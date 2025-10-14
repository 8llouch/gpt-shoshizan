import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConversationsService } from './conversationsService'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer token' }) }),
}))

describe('ConversationsService', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn() as ReturnType<typeof vi.fn>
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('generateConversationId success', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ conversationId: 'abc' }),
    })
    const id = await ConversationsService.generateConversationId()
    expect(id).toBe('abc')
  })

  it('generateConversationId error', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'fail' })
    await expect(ConversationsService.generateConversationId()).rejects.toThrow(
      'HTTP 500: fail',
    )
  })

  it('getConversations success', async () => {
    const conversations = [{ id: '1' }]
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(conversations),
    })
    const res = await ConversationsService.getConversations()
    expect(res).toEqual(conversations)
  })

  it('getConversations error', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'fail' })
    await expect(ConversationsService.getConversations()).rejects.toThrow(
      'HTTP 500: fail',
    )
  })

  it('deleteConversation success', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({ ok: true })
    await expect(ConversationsService.deleteConversation('1')).resolves.toBeUndefined()
  })

  it('deleteConversation error', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'fail' })
    await expect(ConversationsService.deleteConversation('1')).rejects.toThrow(
      'HTTP 500: fail',
    )
  })
})
