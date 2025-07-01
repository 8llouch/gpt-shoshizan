import { test, expect } from '@playwright/test'

test.describe('ThemeSwitcher Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display theme switcher with correct initial state', async ({ page }) => {
    const themeButton = page.getByTestId('theme-switcher-button')
    await expect(themeButton).toBeVisible()
    await expect(themeButton).toHaveAttribute('title', 'Passer en mode sombre')
    await expect(page.getByTestId('theme-icon-moon')).toBeVisible()
  })

  test('should toggle theme correctly', async ({ page }) => {
    const themeButton = page.getByTestId('theme-switcher-button')
    await expect(page.locator('html')).toHaveClass(/light/)
    await expect(page.getByTestId('theme-icon-moon')).toBeVisible()

    await themeButton.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('theme-icon-sun')).toBeVisible()
    await expect(themeButton).toHaveAttribute('title', 'Passer en mode clair')

    await themeButton.click()
    await expect(page.locator('html')).toHaveClass(/light/)
    await expect(page.getByTestId('theme-icon-moon')).toBeVisible()
  })

  test('should persist theme preference', async ({ page }) => {
    const themeButton = page.getByTestId('theme-switcher-button')
    await themeButton.click()
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('theme-icon-sun')).toBeVisible()
  })
})
