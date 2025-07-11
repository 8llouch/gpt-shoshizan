import { test, expect } from '@playwright/test'

test.describe('ModelSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
    await page.getByTestId('login-email').fill('test@example.com')
    await page.getByTestId('login-password').fill('TestPassword')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/chat')
    await expect(page.getByTestId('chat-model-selector')).toBeVisible()
  })

  test('should display model selector with correct options', async ({ page }) => {
    const modelSelector = page.getByTestId('model-select')
    await expect(modelSelector).toBeVisible()
    const optionsValues = [
      'llama3.2',
      'gemma3:4b',
      'llava',
      'deepseek-r1',
      'incept5/llama3.1-claude:latest',
    ]

    await expect(modelSelector.locator('option')).toHaveCount(optionsValues.length)

    for (const value of optionsValues) {
      await expect(page.getByTestId(`model-option-${value}`)).toHaveCount(1)
    }
  })

  test('should change model when selecting a different option', async ({ page }) => {
    const modelSelector = page.getByTestId('model-select')
    await modelSelector.selectOption('gemma3:4b')
    await expect(modelSelector).toHaveValue('gemma3:4b')
  })

  test('should have correct styling in light mode', async ({ page }) => {
    const modelSelector = page.getByTestId('model-select')
    await expect(modelSelector).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(modelSelector).toHaveCSS('border-color', 'rgb(209, 213, 219)')
  })

  test('should have correct styling in dark mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    const modelSelector = page.getByTestId('model-select')
    await expect(modelSelector).toHaveCSS('background-color', 'rgb(55, 65, 81)')
    await expect(modelSelector).toHaveCSS('border-color', 'rgb(107, 114, 128)')
  })
})
