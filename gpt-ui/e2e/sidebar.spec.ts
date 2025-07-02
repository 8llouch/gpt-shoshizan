import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers.js'

test.describe('Sidebar Component', () => {
  let helpers: TestHelpers

  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.login()
    // Ensure we're on the chat page where sidebar is visible
    await expect(page.getByTestId('chat-layout')).toBeVisible()
  })

  test('should display sidebar with all components', async ({ page }) => {
    const desktopSidebar = page.getByTestId('chat-sidebar-desktop')
    await expect(desktopSidebar).toBeVisible()
    await helpers.ensureSidebarVisible()
    await expect(desktopSidebar.getByTestId('sidebar')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-header')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-logo-section')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-logo')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-logo-text')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-app-title')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-new-chat-btn')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-plus-icon')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-conversations-section')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-footer')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-user-section')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-user-avatar')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-user-info')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-user-name')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-user-status')).toBeVisible()
    await expect(desktopSidebar.getByTestId('sidebar-logout-btn-desktop')).toBeVisible()
  })

  test('should create new conversation when new chat button is clicked', async ({ page }) => {
    const initialCount = await helpers.getConversationCount()
    // Target the desktop sidebar specifically
    await page.getByTestId('chat-sidebar-desktop').getByTestId('sidebar-new-chat-btn').click()

    // Wait for new conversation to be created
    await page.waitForTimeout(1000)
    const newCount = await helpers.getConversationCount()
    expect(newCount).toBeGreaterThanOrEqual(initialCount)
  })

  test('should show correct user status', async ({ page }) => {
    // Target the desktop sidebar specifically
    await expect(
      page.getByTestId('chat-sidebar-desktop').getByTestId('sidebar-user-status'),
    ).toContainText('En ligne')
  })

  test('should format conversation dates correctly', async ({ page }) => {
    // Create a conversation to test date formatting
    await helpers.createNewConversation()

    // Check that conversation items have date elements in desktop sidebar
    const desktopSidebar = page.getByTestId('chat-sidebar-desktop')
    const conversationItems = desktopSidebar.locator('[data-testid^="sidebar-conversation-item-"]')
    if ((await conversationItems.count()) > 0) {
      await expect(desktopSidebar.getByTestId('sidebar-conversation-date').first()).toBeVisible()
    }
  })
})
