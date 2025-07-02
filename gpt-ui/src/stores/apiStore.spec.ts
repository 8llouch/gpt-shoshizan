import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApiStore } from './apiStore'
import { ApiService } from '../services/apiService'

vi.mock('../services/apiService', () => ({
  ApiService: { sendRequest: vi.fn() },
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('apiStore', () => {
  it('initial state is correct', () => {
    const store = useApiStore()
    expect(store.isLoading).toBeDefined()
    expect(store.error).toBeNull()
  })

  it('sendMessage handles error', async () => {
    const store = useApiStore()
    const error = new Error('fail')
    ;(ApiService.sendRequest as any).mockRejectedValue(error)
    await expect(store.sendMessage('msg', 'id')).rejects.toThrow('fail')
    expect(store.error).toBe('fail')
  })

  it('sendMessage updates isLoading', async () => {
    const store = useApiStore()
    ;(ApiService.sendRequest as any).mockResolvedValue({ data: 'ok' })
    const promise = store.sendMessage('msg', 'id')
    expect(store.isLoading).toBe(true)
    await promise
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })
})
