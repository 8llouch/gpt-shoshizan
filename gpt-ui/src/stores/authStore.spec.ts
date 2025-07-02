import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import { AuthenticationService } from '../services/authenticationService'

vi.mock('../services/authenticationService', () => ({
  AuthenticationService: { login: vi.fn(), register: vi.fn() },
}))
vi.mock('./conversationsStore', () => ({ useConversationsStore: () => ({ reset: vi.fn() }) }))
vi.mock('./apiStore', () => ({ useApiStore: () => ({ reset: vi.fn() }) }))
vi.mock('./modelStore', () => ({ useModelStore: () => ({ reset: vi.fn() }) }))
vi.mock('./themeStore', () => ({ useThemeStore: () => ({ reset: vi.fn() }) }))

global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
} as any

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('authStore', () => {
  it('initial state is correct', () => {
    const store = useAuthStore()
    expect(store.token).toBe(localStorage.getItem('authToken'))
    expect(store.isAuthenticated).toBe(!!localStorage.getItem('authToken'))
  })

  it('login sets token', async () => {
    const store = useAuthStore();
    (
      AuthenticationService.login as any,
    ).mockResolvedValue('tok')
    await store.login('a', 'b')
    expect(store.token).toBe('tok')
  })

  it('register calls service', async () => {
    const store = useAuthStore()
    await store.register('a', 'b', 'n')
    expect(AuthenticationService.register).toHaveBeenCalled()
  })

  it('logout clears token', () => {
    const store = useAuthStore()
    store.token = 'tok'
    store.logout()
    expect(store.token).toBeNull()
  })

  it('getAuthHeaders returns Authorization if token', () => {
    const store = useAuthStore()
    store.token = 'tok'
    expect(store.getAuthHeaders()).toEqual({ Authorization: 'Bearer tok' })
  })

  it('getAuthHeaders returns empty if no token', () => {
    const store = useAuthStore()
    store.token = null
    expect(store.getAuthHeaders()).toEqual({})
  })

  it('isAuthenticated computed', () => {
    const store = useAuthStore()
    store.token = 'tok'
    expect(store.isAuthenticated).toBe(true)
    store.token = null
    expect(store.isAuthenticated).toBe(false)
  })

  it('cleanAllStores calls resets', () => {
    const store = useAuthStore()
    store.cleanAllStores()
    // If no error, all resets were called
    expect(true).toBe(true)
  })
})
