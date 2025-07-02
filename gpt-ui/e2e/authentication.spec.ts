import { test, expect } from '@playwright/test'

test.describe('Authentication Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  test('should display login form by default', async ({ page }) => {
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('login-email')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('should toggle between login and register forms', async ({ page }) => {
    // Initially should show login form
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('register-form')).not.toBeVisible()

    // Click toggle button to show register form
    await page.getByTestId('toggle-auth-mode').click()
    await expect(page.getByTestId('register-form')).toBeVisible()
    await expect(page.getByTestId('login-form')).not.toBeVisible()

    // Click toggle button again to show login form
    await page.getByTestId('toggle-auth-mode').click()
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('register-form')).not.toBeVisible()
  })

  test('should handle successful login', async ({ page }) => {
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()

    // Should redirect to chat page
    await page.waitForURL('**/chat')
    await expect(page.getByTestId('chat-layout')).toBeVisible()
  })

  test('should handle login errors', async ({ page }) => {
    await page.getByTestId('login-email').fill('invalid@example.com')
    await page.getByTestId('login-password').fill('wrongpassword')
    await page.getByTestId('login-submit').click()

    // Should show error message and stay on auth page
    await expect(page.getByTestId('auth-error-message')).toBeVisible()
    await expect(page).toHaveURL(/.*\/auth/)
  })

  test('should have proper form accessibility', async ({ page }) => {
    // Check login form accessibility
    await expect(page.getByTestId('login-email')).toHaveAttribute('type', 'email')
    await expect(page.getByTestId('login-email')).toHaveAttribute('autocomplete', 'username')
    await expect(page.getByTestId('login-password')).toHaveAttribute('type', 'password')
    await expect(page.getByTestId('login-password')).toHaveAttribute(
      'autocomplete',
      'current-password',
    )

    // Check register form accessibility
    await page.getByTestId('toggle-auth-mode').click()
    await expect(page.getByTestId('register-name')).toHaveAttribute('type', 'text')
    await expect(page.getByTestId('register-email')).toHaveAttribute('type', 'email')
    await expect(page.getByTestId('register-password')).toHaveAttribute('type', 'password')
  })
})
