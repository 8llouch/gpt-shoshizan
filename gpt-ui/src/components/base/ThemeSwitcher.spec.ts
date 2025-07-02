import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeSwitcher from './ThemeSwitcher.vue'

let mockToggleTheme = vi.fn()
let mockCurrentTheme = 'light'

vi.mock('../../stores/themeStore', () => ({
  useThemeStore: () => ({
    currentTheme: mockCurrentTheme,
    toggleTheme: mockToggleTheme,
  }),
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    mockToggleTheme = vi.fn()
    mockCurrentTheme = 'light'
  })

  it('renders button and icon', () => {
    const wrapper = mount(ThemeSwitcher)
    expect(wrapper.find('[data-testid="theme-switcher-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="theme-icon-moon"]').exists()).toBe(true)
  })

  it('calls toggleTheme on click', async () => {
    const wrapper = mount(ThemeSwitcher)
    await wrapper.find('[data-testid="theme-switcher-button"]').trigger('click')
    expect(mockToggleTheme).toHaveBeenCalled()
  })
})
