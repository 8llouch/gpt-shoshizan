import type { ApiRequest, ApiResponse } from '@shoshizan/shared-interfaces'
import { useAuthStore } from '../stores/authStore'

export class ApiService {
  private static readonly LLM_API_URL = 'http://localhost:11434/api/generate'
  private static readonly KAFKA_PRODUCER_URL_INPUTS =
    'http://localhost:3000/message-producer/ai-inputs'
  private static readonly KAFKA_PRODUCER_URL_RESPONSE =
    'http://localhost:3000/message-producer/ai-outputs'

  static async sendRequest(
    request: ApiRequest,
    onChunk?: (chunk: string) => void,
  ): Promise<ApiResponse> {
    if (!request.conversationId) {
      throw new Error('conversationId is required')
    }

    const { model, prompt, context, system, options } = request

    const ollamaResponse = await fetch(ApiService.LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        context,
        system,
        options,
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Failed to get response from Ollama: ${ollamaResponse.statusText}`)
    }

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
              const authStore = useAuthStore()
              const authHeaders = authStore.getAuthHeaders()
              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
              }

              if (authHeaders.Authorization) {
                headers.Authorization = authHeaders.Authorization
              }

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
  }
}
