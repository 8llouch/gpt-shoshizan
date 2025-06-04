import type { Message } from '@/types'

export interface ChatAPIResponse {
  content: string
  id: string
  timestamp: Date
}

export class ChatService {
  private baseUrl = '/api/chat'

  async sendMessage(message: string, conversationId?: string): Promise<ChatAPIResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const response = this.generateMockResponse(message)
      return {
        content: response,
        id: Date.now().toString(),
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Chat API Error:', error)
      throw new Error("Erreur lors de l'envoi du message")
    }
  }

  async regenerateResponse(lastUserMessage: string): Promise<ChatAPIResponse> {
    return this.sendMessage(lastUserMessage)
  }

  private generateMockResponse(userMessage: string): string {
    const responses = [
      'Je comprends votre question. Voici ma réponse basée sur les informations que vous avez fournies.',
      "C'est une excellente question ! Laissez-moi vous expliquer en détail.",
      'Je vais vous aider avec cela. Voici ce que je recommande :',
    ]

    if (userMessage.toLowerCase().includes('code')) {
      return "Voici un exemple de code qui devrait résoudre votre problème :\n\n```javascript\nconst solution = () => {\n  console.log('Hello World!');\n};\n```"
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }
}

export const chatService = new ChatService()
