import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'

global.document = {
  documentElement: { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  body: { style: {} },
} as any

global.window = { matchMedia: () => ({ matches: false }) } as any

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('themeStore', () => {
  it('initial state is correct', () => {
    const store = useThemeStore()
    expect(store.currentTheme).toBe('light')
  })

  it('setTheme updates theme', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.currentTheme).toBe('dark')
  })

  it('toggleTheme switches theme', () => {
    const store = useThemeStore()
    store.setTheme('light')
    store.toggleTheme()
    expect(store.currentTheme).toBe('dark')
  })

  it('reset sets theme to light', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    store.reset()
    expect(store.currentTheme).toBe('light')
  })
})
