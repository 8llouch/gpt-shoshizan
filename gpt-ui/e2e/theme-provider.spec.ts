import { test, expect } from '@playwright/test'

test.describe('ThemeProvider Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should initialize theme correctly', async ({ page }) => {
    await expect(page.locator('html')).toHaveClass(/light/)

    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
    })
    await page.reload()

    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
