import type { ConversationEntity } from '@shoshizan/shared-interfaces'

export class ConversationsService {
  private static readonly API_BASE_URL = 'http://localhost:3001'

  static async getConversations(): Promise<ConversationEntity[]> {
    try {
      const response = await fetch(`${ConversationsService.API_BASE_URL}/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`)
      }

      const conversations: ConversationEntity[] = await response.json()
      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  static async deleteConversation(id: string): Promise<void> {
    try {
      const response = await fetch(`${ConversationsService.API_BASE_URL}/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`)
      }

      console.log(`Successfully deleted conversation ${id}`)
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }
}
