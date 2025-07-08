import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers.js'

test.describe('Chat Functionality', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await page.goto('/auth')
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/chat')
  })

  test('should display chat layout with all components', async ({ page }) => {
    await expect(page.getByTestId('chat-layout')).toBeVisible()
    await helpers.ensureSidebarVisible()
    await expect(page.getByTestId('chat-model-selector')).toBeVisible()
    await expect(page.getByTestId('chat-conversation')).toBeVisible()
    await expect(page.getByTestId('chat-user-input')).toBeVisible()
  })

  test('should send a message and display it in conversation', async ({ page }) => {
    const testMessage = 'Hello, this is a test message'

    await page.getByTestId('message-input').fill(testMessage)
    await page.getByTestId('send-button').click()

    // Wait for the message to appear in the conversation
    await expect(page.getByTestId('message-user')).toBeVisible()
    await expect(page.getByTestId('message-text')).toContainText(testMessage)
  })

  test('should handle Enter key to send message', async ({ page }) => {
    const testMessage = 'Testing Enter key functionality'

    await page.getByTestId('message-input').fill(testMessage)
    await page.getByTestId('message-input').press('Enter')

    await expect(page.getByTestId('message-user')).toBeVisible()
    await expect(page.getByTestId('message-text')).toContainText(testMessage)
  })

  test('should show typing indicator when loading', async ({ page }) => {
    const testMessage = 'This should trigger loading state'

    await page.getByTestId('message-input').fill(testMessage)
    await page.getByTestId('send-button').click()

    // Should show typing indicator
    await expect(page.getByTestId('typing-indicator')).toBeVisible()
  })

  test('should display message timestamps', async ({ page }) => {
    const testMessage = 'Message with timestamp'

    await page.getByTestId('message-input').fill(testMessage)
    await page.getByTestId('send-button').click()

    await expect(page.getByTestId('message-timestamp')).toBeVisible()
  })

  test('should disable input during loading', async ({ page }) => {
    await page.getByTestId('message-input').fill('Test message')
    await page.getByTestId('send-button').click()

    // Input should be disabled during loading
    await expect(page.getByTestId('message-input')).toBeDisabled()
  })

  test('should show correct send button states', async ({ page }) => {
    // Initially should show send icon
    await expect(page.getByTestId('send-icon')).toBeVisible()
    await expect(page.getByTestId('loading-icon')).toBeHidden()

    // After sending message, should show loading icon
    await page.getByTestId('message-input').fill('Test message')
    await page.getByTestId('send-button').click()

    await expect(page.getByTestId('loading-icon')).toBeVisible()
    await expect(page.getByTestId('send-icon')).toBeHidden()
  })

  test('should handle markdown rendering in messages', async ({ page }) => {
    const markdownMessage = '**Bold text** and *italic text*'

    await page.getByTestId('message-input').fill(markdownMessage)
    await page.getByTestId('send-button').click()

    await expect(page.getByTestId('message-user')).toBeVisible()
    // Check that markdown is rendered (bold and italic elements exist)
    await expect(page.locator('strong')).toBeVisible()
    await expect(page.locator('em')).toBeVisible()
  })
})
