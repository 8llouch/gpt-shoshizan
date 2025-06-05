import type { ApiRequest, ApiResponse } from '@/types'

export class ApiService {
  private static readonly API_URL = 'http://localhost:11434/api/generate'

  static async sendRequest(
    request: ApiRequest,
    onChunk?: (chunk: string) => void,
  ): Promise<ApiResponse> {
    if (!request.conversationId) {
      throw new Error('conversationId is required')
    }

    const ollamaResponse = await fetch(ApiService.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        stream: true,
        context: request.context,
        system: request.system,
        options: request.options,
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Failed to get response from Ollama: ${ollamaResponse.statusText}`)
    }

    if (!ollamaResponse.body) {
      throw new Error('No response body from Ollama')
    }

    let fullResponse = ''
    let context: number[] | undefined
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
            context = data.context
          }
          if (data.done) {
            return {
              response: fullResponse,
              done: true,
              context: context,
            }
          }
        } catch (e) {
          console.error('Error parsing chunk:', e)
        }
      }
    }

    return {
      response: fullResponse,
      done: false,
      context: context,
    }
  }
}
