import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConversationsStore } from './conversationsStore'

vi.mock('../services/conversationsService', () => ({
  ConversationsService: { generateConversationId: vi.fn().mockResolvedValue('id') },
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('conversationsStore', () => {
  it('initial state is correct', () => {
    const store = useConversationsStore()
    expect(store.conversations).toEqual([])
    expect(store.currentConversationId).toBeNull()
  })

  it('createConversation adds a conversation', async () => {
    const store = useConversationsStore()
    await store.createConversation()
    expect(store.conversations.length).toBe(1)
    expect(store.currentConversationId).toBe('id')
  })
})
