import { Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Login to the application with default test credentials
   */
  async login(email: string = 'test@example.com', password: string = 'TestPassword') {
    await this.page.goto('/auth')
    await this.page.getByTestId('login-email').fill(email)
    await this.page.getByTestId('login-password').fill(password)
    await this.page.getByTestId('login-submit').click()
    await this.page.waitForURL('**/chat')
    await this.page.waitForSelector('[data-testid="chat-layout"]', { timeout: 10000 })
  }

  /**
   * Send a message and wait for it to appear in the conversation
   */
  async sendMessage(message: string) {
    const messageInput = this.page.getByTestId('message-input')

    // Wait for input to be enabled
    await expect(messageInput).toBeEnabled({ timeout: 10000 })

    await messageInput.fill(message)
    await this.page.getByTestId('send-button').click()

    // Wait for the message to appear - use more specific selector
    await expect(this.page.getByTestId('message-user').first()).toBeVisible()
    await expect(
      this.page.locator('[data-testid="message-text"]').filter({ hasText: message }),
    ).toBeVisible()
  }

  /**
   * Create a new conversation
   */
  async createNewConversation() {
    // Ensure sidebar is visible before clicking new chat button
    await this.ensureSidebarVisible()
    await this.page.locator('[data-testid="sidebar-new-chat-btn"]:visible').click()
    await this.waitForConversationLoad()
  }

  /**
   * Select a conversation by index
   */
  async selectConversation(index: number = 0) {
    const conversationItems = this.page.locator('[data-testid^="sidebar-conversation-item-"]')
    await expect(conversationItems.nth(index)).toBeVisible()
    await conversationItems.nth(index).click()

    // Wait for conversation to load
    await this.waitForConversationLoad()
  }

  /**
   * Wait for conversation to load after selection
   */
  async waitForConversationLoad() {
    // Wait for any loading indicators to disappear
    try {
      await this.page.waitForSelector('[data-testid="typing-indicator"]', {
        state: 'hidden',
        timeout: 5000,
      })
    } catch {
      // If no typing indicator, that's fine
    }

    // Wait a bit for the conversation to fully load
    await this.page.waitForTimeout(500)
  }

  /**
   * Delete a conversation by index
   */
  async deleteConversation(index: number) {
    const conversationItems = this.page.locator('[data-testid^="sidebar-conversation-item-"]')
    const conversationItem = conversationItems.nth(index)

    // Hover over the conversation item to make delete button visible
    await conversationItem.hover()

    // Get the conversation ID from the data-testid
    const testId = await conversationItem.getAttribute('data-testid')
    const conversationId = testId?.replace('sidebar-conversation-item-', '')

    if (conversationId) {
      // Click the delete button (it should now be visible due to hover)
      await this.page.getByTestId(`sidebar-conversation-delete-${conversationId}`).click()

      // Wait for the conversation to be removed
      await expect(conversationItem).not.toBeVisible({ timeout: 5000 })
    }
  }

  /**
   * Change the selected model
   */
  async changeModel(modelName: string) {
    await this.page.getByTestId('model-select').selectOption(modelName)
    await expect(this.page.getByTestId('model-select')).toHaveValue(modelName)
  }

  /**
   * Toggle theme
   */
  async toggleTheme() {
    await this.page.getByTestId('theme-switcher-button').click()
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.page.locator('[data-testid="sidebar-logout-btn-desktop"]:visible').click()
    await this.page.waitForURL('**/auth')
  }

  /**
   * Clear all authentication data
   */
  async clearAuth() {
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  }

  /**
   * Wait for loading state to complete
   */
  async waitForLoadingComplete() {
    await this.page.waitForTimeout(1000) // Basic wait, can be enhanced with actual loading indicators
  }

  /**
   * Get the number of conversations in the sidebar
   */
  async getConversationCount(): Promise<number> {
    const conversationItems = this.page.locator('[data-testid^="sidebar-conversation-item-"]')
    return await conversationItems.count()
  }

  /**
   * Check if a message exists in the conversation
   */
  async messageExists(messageText: string): Promise<boolean> {
    const messages = this.page.locator('[data-testid="message-text"]')
    const count = await messages.count()

    for (let i = 0; i < count; i++) {
      const text = await messages.nth(i).textContent()
      if (text?.includes(messageText)) {
        return true
      }
    }
    return false
  }

  /**
   * Wait for a specific message to appear in the conversation
   */
  async waitForMessage(messageText: string, timeout: number = 10000) {
    await expect(
      this.page.locator('[data-testid="message-text"]').filter({ hasText: messageText }).first(),
    ).toBeVisible({ timeout })
  }

  /**
   * Set viewport size for responsive testing
   */
  async setViewport(size: 'mobile' | 'tablet' | 'desktop' | 'large') {
    const sizes = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1024, height: 768 },
      large: { width: 1920, height: 1080 },
    }

    await this.page.setViewportSize(sizes[size])
  }

  /**
   * Check if element is visible and accessible
   */
  async isElementAccessible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector)
      await expect(element).toBeVisible()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the current theme
   */
  async getCurrentTheme(): Promise<'light' | 'dark'> {
    const htmlElement = this.page.locator('html')
    const classes = await htmlElement.getAttribute('class')
    return classes?.includes('dark') ? 'dark' : 'light'
  }

  /**
   * Wait for streaming to complete
   */
  async waitForStreamingComplete() {
    await this.page.waitForSelector('[data-testid="streaming-indicator"]', {
      state: 'hidden',
      timeout: 10000,
    })
  }

  /**
   * Check if regenerate button is enabled
   */
  async isRegenerateEnabled(): Promise<boolean> {
    const regenerateButton = this.page.getByTestId('regenerate-button')
    return !(await regenerateButton.isDisabled())
  }

  /**
   * Check if send button is enabled
   */
  async isSendEnabled(): Promise<boolean> {
    const sendButton = this.page.getByTestId('send-button')
    return !(await sendButton.isDisabled())
  }

  /**
   * Get the current URL path
   */
  async getCurrentPath(): Promise<string> {
    const url = this.page.url()
    return new URL(url).pathname
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const currentPath = await this.getCurrentPath()
    return currentPath === '/chat'
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` })
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Fill and submit a form
   */
  async fillAndSubmitForm(formData: Record<string, string>, submitSelector: string) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.getByTestId(field).fill(value)
    }
    await this.page.locator(submitSelector).click()
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorMessage = this.page.getByTestId('auth-error-message')
    return await errorMessage.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    const errorMessage = this.page.getByTestId('auth-error-message')
    return (await errorMessage.textContent()) || ''
  }

  /**
   * Toggle sidebar visibility (useful for mobile testing)
   */
  async toggleSidebar() {
    await this.page.getByTestId('sidebar-toggle-btn').click()
  }

  /**
   * Ensure sidebar is visible (toggle if needed on mobile)
   */
  async ensureSidebarVisible() {
    // Try to find the sidebar-wrapper
    let sidebarVisible = false
    try {
      await expect(this.page.getByTestId('sidebar-wrapper')).toBeVisible({ timeout: 2000 })
      sidebarVisible = true
    } catch {}
    if (!sidebarVisible) {
      // Try to open the sidebar if toggle button exists
      const toggleBtn = this.page.locator('[data-testid="sidebar-toggle-btn"]')
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click()
        await expect(this.page.getByTestId('sidebar-wrapper')).toBeVisible({ timeout: 5000 })
      }
    }
  }
}

/**
 * Factory function to create TestHelpers instance
 */
export function createTestHelpers(page: Page): TestHelpers {
  return new TestHelpers(page)
}
