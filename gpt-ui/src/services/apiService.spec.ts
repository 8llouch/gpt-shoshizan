import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiService } from './apiService'

const globalAny: any = globalThis

describe('ApiService', () => {
  beforeEach(() => {
    globalAny.fetch = vi.fn()
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should throw if conversationId is missing', async () => {
    await expect(ApiService.sendRequest({} as any)).rejects.toThrow('conversationId is required')
  })

  it('should throw if fetch fails', async () => {
    globalAny.fetch.mockResolvedValue({ ok: false, statusText: 'Error', body: {} })
    await expect(
      ApiService.sendRequest({ conversationId: '1', model: 'test', prompt: 'hi' } as any),
    ).rejects.toThrow('Failed to get response from Ollama: Error')
  })
})
