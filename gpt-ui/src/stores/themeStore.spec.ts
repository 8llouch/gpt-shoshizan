import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useThemeStore } from './themeStore'

let localStorageMock: any
let originalSetTimeout: any

global.document = {
  documentElement: { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  body: { style: {} },
} as any

global.window = { matchMedia: () => ({ matches: false }) } as any

beforeEach(() => {
  setActivePinia(createPinia())
  localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        store = {}
      },
    }
  })()
  global.localStorage = localStorageMock
  originalSetTimeout = global.setTimeout
  const mockSetTimeout = ((fn: any) => {
    fn()
    return 0
  }) as typeof setTimeout
  ;(mockSetTimeout as any).__promisify__ = () => Promise.resolve()
  global.setTimeout = mockSetTimeout
})

afterEach(() => {
  global.setTimeout = originalSetTimeout
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

  it('getCurrentTheme computed', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.getCurrentTheme).toBe('dark')
  })

  it('initTheme uses saved theme', () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    store.initTheme()
    expect(store.currentTheme).toBe('dark')
  })

  it('initTheme uses default if no saved theme', () => {
    localStorage.removeItem('theme')
    const store = useThemeStore()
    store.initTheme()
    expect(store.currentTheme).toBe('light')
  })
})
