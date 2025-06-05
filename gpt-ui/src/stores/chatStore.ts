import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApiStore } from './apiStore'
import { useModelStore } from './modelStore'
import type { Message, Conversation } from '@/types'

export const useChatStore = defineStore('chatStore', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string | null>(null)

  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null
    return conversations.value.find((conv) => conv.id === currentConversationId.value) || null
  })

  const currentMessages = computed(() => {
    const current = conversations.value.find((conv) => conv.id === currentConversationId.value)
    return current?.messages || []
  })

  const createConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      messages: [],
      responses: [],
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
    const conversation = conversations.value.find((conv) => conv.id === conversationId)
    if (!conversation) return

    const message: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: Date.now(),
      modelName: modelName || undefined,
    }

    if (!conversation.messages) {
      conversation.messages = []
    }

    conversation.messages.push(message)

    if (role === 'user' && conversation.messages.length === 1) {
      conversation.title = content.length > 30 ? content.substring(0, 30) + '...' : content
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    let conversation = currentConversation.value
    if (!conversation) {
      conversation = createConversation()
    }

    addMessage(conversation.id, content, 'user')

    const apiStore = useApiStore()
    const modelStore = useModelStore()

    try {
      const result = await apiStore.sendMessage(content, conversation.id)

      // Only add the assistant message when we have the complete response
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

    const messages = conversation.messages
    const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant')

    if (lastAssistantIndex !== -1) {
      messages.splice(lastAssistantIndex, 1)
    }

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
    if (!lastUserMessage) return

    const apiStore = useApiStore()
    const modelStore = useModelStore()

    try {
      const result = await apiStore.sendMessage(lastUserMessage.content, conversation.id)

      // Only add the assistant message when we have the complete response
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

  const deleteConversation = (conversationId: string) => {
    const index = conversations.value.findIndex((conv) => conv.id === conversationId)
    if (index !== -1) {
      conversations.value.splice(index, 1)

      if (currentConversationId.value === conversationId) {
        currentConversationId.value =
          conversations.value.length > 0 ? conversations.value[0].id : null
      }
    }
  }

  const initializeStore = () => {
    if (conversations.value.length === 0) {
      createConversation()
    }
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    createConversation,
    addMessage,
    sendMessage,
    regenerateResponse,
    selectConversation,
    deleteConversation,
    initializeStore,
  }
})
