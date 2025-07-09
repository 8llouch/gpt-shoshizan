import type { ApiRequest, ApiResponse } from '@shoshizan/shared-interfaces'
import { useAuthStore } from '../stores/authStore'
import { API_CONFIG } from '../constants'
import { ApiErrorHandler } from '../utils/apiErrorHandler'

export class ApiService {
  private static readonly LLM_API_URL = API_CONFIG.LLM_API_URL
  private static readonly KAFKA_PRODUCER_URL_INPUTS = API_CONFIG.KAFKA_PRODUCER_URL_INPUTS
  private static readonly KAFKA_PRODUCER_URL_RESPONSE = API_CONFIG.KAFKA_PRODUCER_URL_OUTPUTS

  static async sendRequest(
    request: ApiRequest,
    onChunk?: (chunk: string) => void,
    conversationContext?: number[],
  ): Promise<ApiResponse> {
    if (!request.conversationId) {
      throw new Error('conversationId is required')
    }

    const { model, prompt, context, system, options } = request

    const contextToUse = conversationContext || context

    const authStore = useAuthStore()
    const authHeaders = authStore.getAuthHeaders()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization
    }

    try {
      const ollamaResponse = await ApiErrorHandler.fetchWithErrorHandling(ApiService.LLM_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          prompt,
          stream: true,
          context: contextToUse,
          system,
          options,
          conversationId: request.conversationId,
        }),
      })

      if (!ollamaResponse.body) {
        throw new Error('No response body from Ollama')
      }

      let fullResponse = ''
      let contextLlm: number[] | undefined
      const reader = ollamaResponse.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.response) {
              fullResponse += data.response
              if (onChunk) {
                onChunk(data.response)
              }
            }
            if (data.context) {
              contextLlm = data.context
            }
            if (data.done) {
              const apiResponse = {
                response: fullResponse,
                done: true,
                context: contextLlm,
              }
              try {
                await fetch(ApiService.KAFKA_PRODUCER_URL_INPUTS, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(request),
                })
                const responseMessage = {
                  ...apiResponse,
                  conversationId: request.conversationId,
                  model: request.model,
                  prompt: request.prompt,
                  system: request.system,
                  options: request.options,
                  context: contextLlm,
                }
                await fetch(ApiService.KAFKA_PRODUCER_URL_RESPONSE, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(responseMessage),
                })
              } catch (err) {
                console.error('Error sending message to kafka producer:', err)
              }

              return apiResponse
            }
          } catch (e) {
            console.error('Error parsing chunk:', e)
          }
        }
      }

      return {
        response: fullResponse,
        done: false,
        context: contextLlm,
      }
    } catch (error) {
      if (ApiErrorHandler.isAuthError(error)) {
        throw new Error('Authentication required')
      }

      throw error
    }
  }
}
