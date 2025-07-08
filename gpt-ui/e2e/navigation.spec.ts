import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers.js'

test.describe('Navigation and Routing', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('should redirect root to chat when authenticated', async ({ page }) => {
    // Login first
    await helpers.login()

    // Navigate to root
    await page.goto('/')

    // Should redirect to chat
    await expect(page).toHaveURL(/.*\/chat/)
    await expect(page.getByTestId('chat-layout')).toBeVisible()
  })

  test('should redirect root to auth when not authenticated', async ({ page }) => {
    // Clear any existing authentication using a safer approach
    await page.goto('/auth')
    await page.evaluate(() => {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch {
        // Ignore security errors in some browsers
      }
    })

    // Navigate to root
    await page.goto('/')

    // Should redirect to auth
    await expect(page).toHaveURL(/.*\/auth/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('should prevent access to chat when not authenticated', async ({ page }) => {
    // Clear any existing authentication using a safer approach
    await page.goto('/auth')
    await page.evaluate(() => {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch {
        // Ignore security errors in some browsers
      }
    })

    // Try to access chat directly
    await page.goto('/chat')

    // Should redirect to auth
    await expect(page).toHaveURL(/.*\/auth/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('should handle direct navigation to chat after login', async ({ page }) => {
    // Login first
    await helpers.login()

    // Navigate directly to chat
    await page.goto('/chat')

    // Should successfully navigate to chat
    await expect(page).toHaveURL(/.*\/chat/)
    await expect(page.getByTestId('chat-layout')).toBeVisible()
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Login first
    await page.goto('/auth')
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/chat')

    // Navigate to auth page (should redirect to chat)
    await page.goto('/auth')
    await expect(page).toHaveURL(/.*\/chat/)

    // Go back
    await page.goBack()

    // Should still be on chat page (auth redirects to chat)
    await expect(page).toHaveURL(/.*\/chat/)
    await expect(page.getByTestId('chat-layout')).toBeVisible()
  })

  test('should handle authentication state persistence', async ({ page }) => {
    // Login first
    await page.goto('/auth')
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/chat')

    // Open new tab and navigate to chat
    const newPage = await page.context().newPage()
    await newPage.goto('/chat')

    // Should be authenticated and see chat
    await expect(newPage).toHaveURL(/.*\/chat/)
    await expect(newPage.getByTestId('chat-layout')).toBeVisible()

    await newPage.close()
  })

  test('should handle URL changes during navigation', async ({ page }) => {
    // Login first
    await page.goto('/auth')
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()

    // Should navigate to chat URL
    await expect(page).toHaveURL(/.*\/chat/)

    // URL should remain on chat
    await expect(page).toHaveURL(/.*\/chat/)
  })

  test('should handle deep linking to chat', async ({ page }) => {
    // Login first
    await page.goto('/auth')
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/chat')

    // Navigate to a different page and then back to chat
    await page.goto('/auth') // This will redirect to chat
    await expect(page).toHaveURL(/.*\/chat/)
    await expect(page.getByTestId('chat-layout')).toBeVisible()
  })
})
