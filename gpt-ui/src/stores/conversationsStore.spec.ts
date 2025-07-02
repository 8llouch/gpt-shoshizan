import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConversationsStore } from './conversationsStore'

vi.mock('../services/conversationsService', () => {
  const mockGetConversations = vi.fn().mockResolvedValue([
    { id: '1', messages: [], updatedAt: new Date(), createdAt: new Date(), context: [42] },
    { id: '2', messages: [], updatedAt: new Date(), createdAt: new Date(), context: null },
  ])
  const mockDeleteConversation = vi.fn().mockImplementation(async (_id) => undefined)
  return {
    ConversationsService: {
      generateConversationId: vi.fn().mockResolvedValue('id'),
      getConversations: mockGetConversations,
      deleteConversation: mockDeleteConversation,
      __mockGetConversations: mockGetConversations,
      __mockDeleteConversation: mockDeleteConversation,
    },
  }
})

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

  it('loadConversations loads conversations', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    expect(store.conversations.length).toBe(2)
    expect(store.conversations[0].id).toBe('1')
  })

  it('loadConversations handles error', async () => {
    const { ConversationsService } = await import('../services/conversationsService')
    ConversationsService.__mockGetConversations.mockRejectedValueOnce(new Error('fail'))
    const store = useConversationsStore()
    await store.loadConversations()
    expect(store.error).toBe('fail')
    expect(store.isLoading).toBe(false)
  })

  it('addMessage adds a message', async () => {
    const store = useConversationsStore()
    await store.createConversation()
    store.addMessage('id', 'hello', 'user')
    expect(store.conversations[0].messages.length).toBe(1)
    expect(store.conversations[0].messages[0].content).toBe('hello')
  })

  it('addMessage does nothing if conversation not found', () => {
    const store = useConversationsStore()
    store.addMessage('notfound', 'msg', 'user')
    expect(store.conversations.length).toBe(0)
  })

  it('updateConversationContext updates context', async () => {
    const store = useConversationsStore()
    await store.createConversation()
    store.updateConversationContext('id', [1, 2, 3])
    expect(store.conversations[0].context).toEqual([1, 2, 3])
  })

  it('updateConversationContext does nothing if conversation not found', () => {
    const store = useConversationsStore()
    store.updateConversationContext('notfound', [1])
    expect(store.conversations.length).toBe(0)
  })

  it('selectConversation sets currentConversationId', async () => {
    const store = useConversationsStore()
    await store.createConversation()
    store.selectConversation('id')
    expect(store.currentConversationId).toBe('id')
  })

  it('deleteConversation removes a conversation', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    await store.deleteConversation('1')
    expect(store.conversations.find((c) => c.id === '1')).toBeUndefined()
  })

  it('deleteConversation handles error', async () => {
    const { ConversationsService } = await import('../services/conversationsService')
    ConversationsService.__mockDeleteConversation.mockRejectedValueOnce(new Error('fail'))
    const store = useConversationsStore()
    await store.loadConversations()
    await expect(store.deleteConversation('1')).rejects.toThrow('fail')
  })

  it('reset clears state', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    store.reset()
    expect(store.conversations).toEqual([])
    expect(store.currentConversationId).toBeNull()
  })

  it('computed: conversationsCount', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    expect(store.conversationsCount).toBe(2)
  })

  it('computed: currentConversation', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    store.currentConversationId = '1'
    expect(store.currentConversation && store.currentConversation.id).toBe('1')
  })

  it('computed: currentMessages', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    store.currentConversationId = '1'
    expect(Array.isArray(store.currentMessages)).toBe(true)
  })

  it('computed: getConversationById', async () => {
    const store = useConversationsStore()
    await store.loadConversations()
    const getById = store.getConversationById
    expect(getById('1')?.id).toBe('1')
    expect(getById('notfound')).toBeUndefined()
  })
})
