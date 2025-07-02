import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConversationsService } from './conversationsService'
import { setActivePinia, createPinia } from 'pinia'

describe('ConversationsService', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
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
})
