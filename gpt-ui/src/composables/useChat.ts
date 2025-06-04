import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { chatService } from '@/services/chatService'

export function useChat() {
  const chatStore = useChatStore()
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  const currentMessages = computed(() => chatStore.currentMessages)
  const currentConversation = computed(() => chatStore.currentConversation)
  const isLoading = computed(() => chatStore.isLoading || isProcessing.value)

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    isProcessing.value = true
    error.value = null

    try {
      let conversation = currentConversation.value
      if (!conversation) {
        conversation = chatStore.createConversation()
      }

      chatStore.addMessage(conversation.id, content, 'user')

      const response = await chatService.sendMessage(content, conversation.id)

      chatStore.addMessage(conversation.id, response.content, 'assistant')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'

      if (currentConversation.value) {
        chatStore.addMessage(
          currentConversation.value.id,
          'Désolé, une erreur est survenue. Veuillez réessayer.',
          'assistant',
        )
      }
    } finally {
      isProcessing.value = false
    }
  }

  const regenerateResponse = async () => {
    const conversation = currentConversation.value
    if (!conversation?.messages) return

    const lastUserMessage = conversation.messages.filter((m) => m.role === 'user').pop()

    if (!lastUserMessage) return

    isProcessing.value = true
    error.value = null

    try {
      const messages = conversation.messages
      const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant')

      if (lastAssistantIndex !== -1) {
        messages.splice(lastAssistantIndex, 1)
      }

      const response = await chatService.regenerateResponse(lastUserMessage.content)
      chatStore.addMessage(conversation.id, response.content, 'assistant')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la régénération'
    } finally {
      isProcessing.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    currentMessages,
    currentConversation,
    isLoading,
    error,

    sendMessage,
    regenerateResponse,
    clearError,

    createConversation: chatStore.createConversation,
    selectConversation: chatStore.selectConversation,
    deleteConversation: chatStore.deleteConversation,
  }
}
