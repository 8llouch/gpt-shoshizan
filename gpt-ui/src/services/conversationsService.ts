import { useAuthStore } from '@/stores/authStore'
import type { ConversationEntity } from '@shoshizan/shared-interfaces'

export class ConversationsService {
  private static readonly API_BASE_URL = 'http://localhost:3000'

  static async generateConversationId(): Promise<string> {
    try {
      const authStore = useAuthStore()
      const authHeaders = authStore.getAuthHeaders()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }

      const response = await fetch(
        `${ConversationsService.API_BASE_URL}/gateway/api/conversations/generate-id`,
        {
          method: 'POST',
          headers,
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to generate conversation ID: ${response.statusText}`)
      }

      const result: { conversationId: string } = await response.json()
      return result.conversationId
    } catch (error) {
      console.error('Error generating conversation ID:', error)
      throw error
    }
  }

  static async getConversations(): Promise<ConversationEntity[]> {
    try {
      const authStore = useAuthStore()
      const authHeaders = authStore.getAuthHeaders()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }
      const response = await fetch(
        `${ConversationsService.API_BASE_URL}/gateway/api/conversations`,
        {
          method: 'GET',
          headers,
        },
      )

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
      const authStore = useAuthStore()
      const authHeaders = authStore.getAuthHeaders()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }
      const response = await fetch(
        `${ConversationsService.API_BASE_URL}/gateway/api/conversations/${id}`,
        {
          method: 'DELETE',
          headers,
        },
      )

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
