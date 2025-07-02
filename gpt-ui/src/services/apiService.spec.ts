import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiService } from './apiService'

const globalAny: any = globalThis

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer token' }) }),
}))

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

  it('should throw if no response body', async () => {
    globalAny.fetch.mockResolvedValue({ ok: true, body: null })
    await expect(
      ApiService.sendRequest({ conversationId: '1', model: 'test', prompt: 'hi' } as any),
    ).rejects.toThrow('No response body from Ollama')
  })

  it('should handle streaming and onChunk, and call kafka endpoints', async () => {
    const chunks = [
      JSON.stringify({ response: 'a' }) + '\n',
      JSON.stringify({ response: 'b', context: [1, 2] }) + '\n',
      JSON.stringify({ done: true }) + '\n',
    ]
    let chunkIndex = 0
    const reader = {
      read: async () =>
        chunkIndex < chunks.length
          ? { done: false, value: new TextEncoder().encode(chunks[chunkIndex++]) }
          : { done: true },
    }
    globalAny.fetch
      .mockResolvedValueOnce({ ok: true, body: { getReader: () => reader } })
      .mockResolvedValue({ ok: true })
    const onChunk = vi.fn()
    const req = {
      conversationId: '1',
      model: 'm',
      prompt: 'p',
      context: [0],
      system: '',
      options: {},
    }
    const res = await ApiService.sendRequest(req as any, onChunk)
    expect(res.response).toBe('ab')
    expect(res.done).toBe(true)
    expect(res.context).toEqual([1, 2])
    expect(onChunk).toHaveBeenCalledWith('a')
    expect(onChunk).toHaveBeenCalledWith('b')
    expect(globalAny.fetch).toHaveBeenCalledTimes(3)
    expect(globalAny.fetch.mock.calls[1][0]).toContain('/ai-inputs')
    expect(globalAny.fetch.mock.calls[2][0]).toContain('/ai-outputs')
  })

  it('should handle JSON parse errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const chunks = ['not-json\n', JSON.stringify({ response: 'ok', done: true }) + '\n']
    let chunkIndex = 0
    const reader = {
      read: async () =>
        chunkIndex < chunks.length
          ? { done: false, value: new TextEncoder().encode(chunks[chunkIndex++]) }
          : { done: true },
    }
    globalAny.fetch
      .mockResolvedValueOnce({ ok: true, body: { getReader: () => reader } })
      .mockResolvedValue({ ok: true })
    const res = await ApiService.sendRequest({
      conversationId: '1',
      model: 'm',
      prompt: 'p',
    } as any)
    expect(res.response).toBe('ok')
    expect(res.done).toBe(true)
    consoleError.mockRestore()
  })
})
