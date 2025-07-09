import { useAuthStore } from '../stores/authStore'

export class ApiErrorHandler {
  /**
   * Handles API response errors globally
   * @param response - The fetch response object
   * @returns true if error was handled, false if not
   */
  static async handleApiError(response: Response): Promise<boolean> {
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication error detected, handling token expiration')
      const authStore = useAuthStore()
      await authStore.handleTokenExpiration()
      return true
    }

    return false
  }

  /**
   * Enhanced fetch wrapper that automatically handles authentication errors
   * @param url - The URL to fetch
   * @param options - Fetch options
   * @returns Promise<Response>
   */
  static async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options)

    if (!response.ok) {
      const wasHandled = await this.handleApiError(response)
      if (!wasHandled) {
        // Let other errors bubble up
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } else {
        // Auth error was handled, throw a specific error
        throw new Error('Authentication expired')
      }
    }

    return response
  }

  /**
   * Checks if an error is an authentication error
   * @param error - Error object or message
   * @returns boolean
   */
  static isAuthError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('Authentication expired') ||
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')
      )
    }
    return false
  }
}
