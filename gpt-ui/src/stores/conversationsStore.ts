import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ConversationsService } from '../services/conversationsService'
import { useApiStore } from './apiStore'
import { useModelStore } from './modelStore'
import { useAuthStore } from './authStore'
import type {
  ConversationEntity,
  MessageEntity,
  Message,
  ModelOptions,
} from '@shoshizan/shared-interfaces'

export const useConversationsStore = defineStore('conversationsStore', () => {
  const conversations = ref<ConversationEntity[]>([])
  const currentConversationId = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const conversationsCount = computed(() => conversations.value.length)

  const currentConversation = computed(() => {
    if (!currentConversationId.value) {
      return null
    }

    const found = conversations.value.find((conv) => conv.id === currentConversationId.value)

    return found || null
  })

  const currentMessages = computed(() => {
    const current = currentConversation.value
    if (!current?.messages) {
      return []
    }

    const messages = current.messages
      .map(
        (msg): Message => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: parseInt(msg.timestamp),
          modelName: msg.modelName,
          imageUrl: msg.imageUrl,
        }),
      )
      .sort((a, b) => a.timestamp - b.timestamp)

    return messages
  })

  const getConversationById = computed(() => {
    return (conversationId: string) =>
      conversations.value.find((conv) => conv.id === conversationId)
  })

  const loadConversations = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const fetchedConversations = await ConversationsService.getConversations()

      // Ensure each conversation has a messages array for reactivity
      const processedConversations = fetchedConversations
        .map((conv) => ({
          ...conv,
          messages: conv.messages || [],
        }))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

      conversations.value = processedConversations
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load conversations'
      console.error('Error loading conversations:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createConversation = (): ConversationEntity => {
    const newConversation: ConversationEntity = {
      id: Date.now().toString(),
      userId: undefined as any,
      user: undefined as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      systemPrompt: '',
      messages: [],
      responses: [],
      modelOptions: {} as ModelOptions,
      apiMetrics: {},
    }

    conversations.value.unshift(newConversation)
    currentConversationId.value = newConversation.id
    return newConversation
  }

  const addMessage = (
    conversationId: string,
    content: string,
    role: 'user' | 'assistant',
    modelName?: string,
  ) => {
    const conversationIndex = conversations.value.findIndex((conv) => conv.id === conversationId)
    if (conversationIndex === -1) return

    const conversation = conversations.value[conversationIndex]

    const message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: Date.now().toString(),
      modelName: modelName || undefined,
      conversation,
      createdAt: new Date(),
    } as MessageEntity

    if (!conversation.messages) {
      conversation.messages = []
    }

    conversation.messages = [...conversation.messages, message]
    conversation.updatedAt = new Date()

    conversations.value[conversationIndex] = { ...conversation }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    let conversation = currentConversation.value

    if (!conversation) {
      conversation = createConversation()
    }

    // Add user message immediately
    addMessage(conversation.id, content, 'user')

    const apiStore = useApiStore()
    const modelStore = useModelStore()

    try {
      // Clear previous response to avoid confusion
      apiStore.resetCurrentResponse()

      const result = await apiStore.sendMessage(content, conversation.id)

      // Add assistant response
      if (apiStore.currentResponse) {
        addMessage(
          conversation.id,
          apiStore.currentResponse,
          'assistant',
          modelStore.selectedModelName,
        )
      } else if (result && result.response) {
        addMessage(conversation.id, result.response, 'assistant', modelStore.selectedModelName)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage(
        conversation.id,
        'Désolé, une erreur est survenue. Veuillez réessayer.',
        'assistant',
        modelStore.selectedModelName,
      )
    }
  }

  const regenerateResponse = async () => {
    const conversation = currentConversation.value
    if (!conversation || !conversation.messages) return

    const conversationIndex = conversations.value.findIndex((c) => c.id === conversation.id)
    if (conversationIndex === -1) return

    // Remove last assistant message with proper reactivity
    const messages = [...conversation.messages]
    const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant')

    if (lastAssistantIndex !== -1) {
      messages.splice(lastAssistantIndex, 1)
      // Update conversation with new messages array
      conversations.value[conversationIndex] = {
        ...conversation,
        messages: messages,
      }
    }

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
    if (!lastUserMessage) return

    const apiStore = useApiStore()
    const modelStore = useModelStore()

    try {
      apiStore.resetCurrentResponse()
      const result = await apiStore.sendMessage(lastUserMessage.content, conversation.id)

      if (apiStore.currentResponse) {
        addMessage(
          conversation.id,
          apiStore.currentResponse,
          'assistant',
          modelStore.selectedModelName,
        )
      } else if (result && result.response) {
        addMessage(conversation.id, result.response, 'assistant', modelStore.selectedModelName)
      }
    } catch (error) {
      console.error('Error regenerating response:', error)
      addMessage(
        conversation.id,
        'Désolé, une erreur est survenue lors de la régénération.',
        'assistant',
        modelStore.selectedModelName,
      )
    }
  }

  const selectConversation = (conversationId: string) => {
    currentConversationId.value = conversationId
    const apiStore = useApiStore()
    apiStore.clearContext()
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      await ConversationsService.deleteConversation(conversationId)

      const index = conversations.value.findIndex((conv) => conv.id === conversationId)
      if (index !== -1) {
        conversations.value.splice(index, 1)

        if (currentConversationId.value === conversationId) {
          currentConversationId.value =
            conversations.value.length > 0 ? conversations.value[0].id : null
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      throw error
    }
  }

  const initialize = async (): Promise<void> => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    if (conversations.value.length === 0) {
      await loadConversations()
    }

    // If no conversations exist or no current conversation is selected, create a new one
    if (conversations.value.length === 0 || !currentConversationId.value) {
      createConversation()
    }
  }

  const reset = (): void => {
    conversations.value = []
    currentConversationId.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    conversations,
    currentConversationId,
    isLoading,
    error,

    // Getters
    conversationsCount,
    currentConversation,
    currentMessages,
    getConversationById,

    // Actions
    loadConversations,
    createConversation,
    addMessage,
    sendMessage,
    regenerateResponse,
    selectConversation,
    deleteConversation,
    initialize,
    reset,
  }
})
