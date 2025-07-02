import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConversationsService } from './conversationsService'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer token' }) }),
}))

describe('ConversationsService', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('generateConversationId success', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ conversationId: 'abc' }),
    })
    const id = await ConversationsService.generateConversationId()
    expect(id).toBe('abc')
  })

  it('generateConversationId error', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false, statusText: 'fail' })
    await expect(ConversationsService.generateConversationId()).rejects.toThrow(
      'Failed to generate conversation ID: fail',
    )
  })

  it('getConversations success', async () => {
    const conversations = [{ id: '1' }]
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(conversations),
    })
    const res = await ConversationsService.getConversations()
    expect(res).toEqual(conversations)
  })

  it('getConversations error', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false, statusText: 'fail' })
    await expect(ConversationsService.getConversations()).rejects.toThrow(
      'Failed to fetch conversations: fail',
    )
  })

  it('deleteConversation success', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true })
    await expect(ConversationsService.deleteConversation('1')).resolves.toBeUndefined()
  })

  it('deleteConversation error', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false, statusText: 'fail' })
    await expect(ConversationsService.deleteConversation('1')).rejects.toThrow(
      'Failed to delete conversation: fail',
    )
  })
})
