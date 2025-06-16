import { test, expect } from '@playwright/test'

test.describe('ThemeSwitcher Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display theme switcher with correct initial state', async ({ page }) => {
    const themeButton = page.locator('.theme-button')
    await expect(themeButton).toBeVisible()
    await expect(themeButton).toHaveAttribute('title', 'Passer en mode sombre')
    await expect(themeButton.locator('.icon')).toHaveText('🌙')
  })

  test('should toggle theme correctly', async ({ page }) => {
    const themeButton = page.locator('.theme-button')
    await expect(page.locator('html')).toHaveClass(/light/)
    await expect(themeButton.locator('.icon')).toHaveText('🌙')

    await themeButton.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(themeButton.locator('.icon')).toHaveText('☀️')
    await expect(themeButton).toHaveAttribute('title', 'Passer en mode clair')

    await themeButton.click()
    await expect(page.locator('html')).toHaveClass(/light/)
  })

  test('should persist theme preference', async ({ page }) => {
    const themeButton = page.locator('.theme-button')
    await themeButton.click()
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(themeButton.locator('.icon')).toHaveText('☀️')
  })
})
