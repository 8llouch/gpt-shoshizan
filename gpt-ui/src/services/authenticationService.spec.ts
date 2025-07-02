import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthenticationService } from './authenticationService'

describe('AuthenticationService', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('login success', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve({ token: 'tok' }) })
    const token = await AuthenticationService.login('a', 'b')
    expect(token).toBe('tok')
  })

  it('login error', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false, statusText: 'fail' })
    await expect(AuthenticationService.login('a', 'b')).rejects.toThrow('Login failed: fail')
  })

  it('register success', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true })
    await expect(AuthenticationService.register('a', 'b', 'n')).resolves.toBeUndefined()
  })

  it('register error', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false, statusText: 'fail' })
    await expect(AuthenticationService.register('a', 'b', 'n')).rejects.toThrow(
      'Registration failed: fail',
    )
  })
})
