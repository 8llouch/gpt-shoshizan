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
    const mockSendRequest = ApiService.sendRequest as ReturnType<typeof vi.fn>
    mockSendRequest.mockRejectedValue(error)
    await expect(store.sendMessage('msg', 'id')).rejects.toThrow('fail')
    expect(store.error).toBe('fail')
  })

  it('sendMessage updates isLoading', async () => {
    const store = useApiStore()
    const mockSendRequest = ApiService.sendRequest as ReturnType<typeof vi.fn>
    mockSendRequest.mockResolvedValue({ data: 'ok' })
    const promise = store.sendMessage('msg', 'id')
    expect(store.isLoading).toBe(true)
    await promise
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('actions and computed', () => {
    const store = useApiStore()
    store.startRequest()
    expect(store.isLoading).toBe(true)
    store.startStreaming()
    expect(store.isStreaming).toBe(true)
    store.updateResponse('foo')
    expect(store.currentResponse).toContain('foo')
    store.resetCurrentResponse()
    expect(store.currentResponse).toBe('')
    store.setThinking('bar')
    expect(store.thinking).toBe('bar')
    store.setError('err')
    expect(store.error).toBe('err')
    expect(store.isLoading).toBe(false)
    expect(store.isStreaming).toBe(false)
    store.endRequest()
    expect(store.isLoading).toBe(false)
    expect(store.isStreaming).toBe(false)
    store.setContext([1, 2, 3])
    expect(store.conversationContext).toEqual([1, 2, 3])
    store.clearContext()
    expect(store.conversationContext).toBeNull()
    store.isLoading = false
    store.isStreaming = false
    expect(store.canSendMessage).toBe(true)
    store.isLoading = true
    expect(store.canSendMessage).toBe(false)
    store.reset()
    expect(store.isLoading).toBe(false)
    expect(store.isStreaming).toBe(false)
    expect(store.error).toBeNull()
    expect(store.currentResponse).toBe('')
    expect(store.thinking).toBeNull()
    expect(store.conversationContext).toBeNull()
  })
})
