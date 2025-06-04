import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, Conversation } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null
    return conversations.value.find((conv) => conv.id === currentConversationId.value) || null
  })

  const currentMessages = computed(() => {
    return currentConversation.value?.messages || []
  })

  const createConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      lastMessage: '',
      timestamp: new Date(),
      messages: [],
    }

    conversations.value.unshift(newConversation)
    currentConversationId.value = newConversation.id
    return newConversation
  }

  const addMessage = (conversationId: string, content: string, role: 'user' | 'assistant') => {
    const conversation = conversations.value.find((conv) => conv.id === conversationId)
    if (!conversation) return

    const message: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    }

    if (!conversation.messages) {
      conversation.messages = []
    }

    conversation.messages.push(message)
    conversation.lastMessage = content
    conversation.timestamp = new Date()

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

    isLoading.value = true

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const response = generateMockResponse(content)
      addMessage(conversation.id, response, 'assistant')
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage(
        conversation.id,
        'Désolé, une erreur est survenue. Veuillez réessayer.',
        'assistant',
      )
    } finally {
      isLoading.value = false
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

    isLoading.value = true

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const response = generateMockResponse(lastUserMessage.content)
      addMessage(conversation.id, response, 'assistant')
    } catch (error) {
      console.error('Error regenerating response:', error)
      addMessage(
        conversation.id,
        'Désolé, une erreur est survenue lors de la régénération.',
        'assistant',
      )
    } finally {
      isLoading.value = false
    }
  }

  const selectConversation = (conversationId: string) => {
    currentConversationId.value = conversationId
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

  const generateMockResponse = (userMessage: string): string => {
    const responses = [
      'Je comprends votre question. Voici ma réponse basée sur les informations que vous avez fournies.',
      "C'est une excellente question ! Laissez-moi vous expliquer en détail.",
      'Je vais vous aider avec cela. Voici ce que je recommande :',
      'Bonne question ! Voici mon analyse de la situation :',
      'Je peux certainement vous aider avec ça. Voici quelques points importants à considérer :',
    ]

    if (userMessage.toLowerCase().includes('code')) {
      return "Voici un exemple de code qui devrait résoudre votre problème :\n\n```javascript\nconst solution = () => {\n  console.log('Hello World!');\n};\n```\n\nCette approche est recommandée car elle est simple et efficace."
    }

    if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('aide')) {
      return "Je suis là pour vous aider ! Voici comment je peux vous assister :\n\n1. Répondre à vos questions\n2. Expliquer des concepts complexes\n3. Vous aider avec du code\n4. Analyser des problèmes\n\nN'hésitez pas à me poser toute question spécifique."
    }

    return (
      responses[Math.floor(Math.random() * responses.length)] +
      '\n\nVotre message était : "' +
      userMessage +
      '"'
    )
  }

  const initializeStore = () => {
    if (conversations.value.length === 0) {
      createConversation()
    }
  }

  return {
    conversations,
    currentConversationId,
    isLoading,

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
