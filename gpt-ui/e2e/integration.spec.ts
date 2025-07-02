import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers.js'

test.describe('Integration Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('basic login and chat functionality', async ({ page }) => {
    await helpers.login()
    await expect(page.getByTestId('chat-layout')).toBeVisible()

    // Send a simple message
    await helpers.sendMessage('Hello, this is a test message')
    await helpers.waitForLoadingComplete()

    // Verify message appears
    await helpers.waitForMessage('Hello, this is a test message')
  })

  test('new conversation creation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await helpers.login()

    // Create a new conversation
    await helpers.createNewConversation()

    // Verify we have a new conversation
    const conversationCount = await helpers.getConversationCount()
    expect(conversationCount).toBeGreaterThan(0)
  })

  test('theme switching', async ({ page }) => {
    await helpers.login()

    // Toggle theme
    await helpers.toggleTheme()
    expect(await helpers.getCurrentTheme()).toBe('dark')

    // Toggle back
    await helpers.toggleTheme()
    expect(await helpers.getCurrentTheme()).toBe('light')
  })

  test('model selection', async ({ page }) => {
    await helpers.login()

    // Test model selection
    await helpers.changeModel('llama3.2')
    await expect(page.getByTestId('model-select')).toHaveValue('llama3.2')
  })

  test('logout functionality', async ({ page }) => {
    await helpers.login()
    await expect(page.getByTestId('chat-layout')).toBeVisible()

    // Logout
    await helpers.logout()
    await expect(page.getByTestId('login-form')).toBeVisible()
  })
})
