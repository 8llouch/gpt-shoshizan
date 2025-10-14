import { useAuthStore } from '@/stores/authStore'
import type { ConversationEntity } from '@shoshizan/shared-interfaces'
import { API_CONFIG } from '../constants'
import { ApiErrorHandler } from '../utils/apiErrorHandler'

export class ConversationsService {
  private static readonly API_BASE_URL = API_CONFIG.BASE_URL
  private static readonly CONVERSATIONS_API_URL = API_CONFIG.CONVERSATIONS_API_URL

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

      const response = await ApiErrorHandler.fetchWithErrorHandling(
        `${ConversationsService.CONVERSATIONS_API_URL}/generate-id`,
        {
          method: 'POST',
          headers,
        },
      )

      const result: { conversationId: string } = await response.json()
      return result.conversationId
    } catch (error) {
      console.error('Error generating conversation ID:', error)

      if (ApiErrorHandler.isAuthError(error)) {
        throw new Error('Authentication required')
      }

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

      const response = await ApiErrorHandler.fetchWithErrorHandling(
        `${ConversationsService.CONVERSATIONS_API_URL}`,
        {
          method: 'GET',
          headers,
        },
      )

      const conversations: ConversationEntity[] = await response.json()
      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)

      if (ApiErrorHandler.isAuthError(error)) {
        throw new Error('Authentication required')
      }

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

      await ApiErrorHandler.fetchWithErrorHandling(
        `${ConversationsService.CONVERSATIONS_API_URL}/${id}`,
        {
          method: 'DELETE',
          headers,
        },
      )

    } catch (error) {
      console.error('Error deleting conversation:', error)

      if (ApiErrorHandler.isAuthError(error)) {
        throw new Error('Authentication required')
      }

      throw error
    }
  }
}
