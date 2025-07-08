import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers.js'

test.describe('Integration Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('basic login and chat functionality', async () => {
    await helpers.login()
    await expect(helpers.testPage.getByTestId('chat-layout')).toBeVisible()

    // Send a simple message
    await helpers.sendMessage('Hello, this is a test message')
    await helpers.waitForLoadingComplete()

    // Verify message appears
    await helpers.waitForMessage('Hello, this is a test message')
  })

  test('new conversation creation', async () => {
    await helpers.setViewport('desktop')
    await helpers.login()

    // Create a new conversation
    await helpers.createNewConversation()

    // Verify we have a new conversation
    const conversationCount = await helpers.getConversationCount()
    expect(conversationCount).toBeGreaterThan(0)
  })

  test('theme switching', async () => {
    await helpers.login()

    // Toggle theme
    await helpers.toggleTheme()
    expect(await helpers.getCurrentTheme()).toBe('dark')

    // Toggle back
    await helpers.toggleTheme()
    expect(await helpers.getCurrentTheme()).toBe('light')
  })

  test('model selection', async () => {
    await helpers.login()

    // Test model selection
    await helpers.changeModel('llama3.2')
    await expect(helpers.testPage.getByTestId('model-select')).toHaveValue('llama3.2')
  })

  test('logout functionality', async () => {
    await helpers.login()
    await expect(helpers.testPage.getByTestId('chat-layout')).toBeVisible()

    // Logout
    await helpers.logout()
    await expect(helpers.testPage.getByTestId('login-form')).toBeVisible()
  })
})
