import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import { AuthenticationService } from '../services/authenticationService'

vi.mock('../services/authenticationService', () => ({
  AuthenticationService: { login: vi.fn(), register: vi.fn() },
}))

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

  it('logout clears token', () => {
    const store = useAuthStore()
    store.token = 'tok'
    store.logout()
    expect(store.token).toBeNull()
  })
})
