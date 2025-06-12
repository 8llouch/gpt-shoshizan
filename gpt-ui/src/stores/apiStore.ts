import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useModelStore } from './modelStore'
import { ApiService } from '@/services/apiService'

export const useApiStore = defineStore('apiStore', () => {
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const currentResponse = ref('')
  const thinking = ref<string | null>(null)
  const conversationContext = ref<number[] | null>(null)

  const canSendMessage = computed(() => !isLoading.value && !isStreaming.value)

  const startRequest = () => {
    isLoading.value = true
    isStreaming.value = false
    error.value = null
    currentResponse.value = ''
    thinking.value = null
  }

  const startStreaming = () => {
    isLoading.value = false
    isStreaming.value = true
  }

  const updateResponse = (chunk: string) => {
    currentResponse.value += chunk
  }

  const resetCurrentResponse = () => {
    currentResponse.value = ''
  }

  const setThinking = (thinkingContent: string) => {
    thinking.value = thinkingContent
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    isLoading.value = false
    isStreaming.value = false
  }

  const endRequest = () => {
    isLoading.value = false
    isStreaming.value = false
  }

  const setContext = (context: number[]) => {
    conversationContext.value = context
  }

  const clearContext = () => {
    conversationContext.value = null
  }

  const sendMessage = async (
    message: string,
    conversationId: string,
    options?: {
      images?: string[]
      systemPrompt?: string
      temperature?: number
    },
  ) => {
    const modelStore = useModelStore()
    const selectedModel = modelStore.selectedModel

    try {
      startRequest()

      const stream = await ApiService.sendRequest(
        {
          conversationId,
          model: selectedModel,
          prompt: message,
          stream: true,
          images: options?.images || [],
          system: options?.systemPrompt || '',
          context: conversationContext.value || undefined,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: 0.9,
            num_ctx: 4096,
            num_predict: 2048,
          },
        },
        (chunk: string) => {
          if (!isStreaming.value) {
            startStreaming()
          }
          updateResponse(chunk)
        },
      )

      if (stream.response) {
        if (stream.context) {
          setContext(stream.context)
        }
      }

      endRequest()
      return {
        response: currentResponse.value,
        context: conversationContext.value,
        thinking: thinking.value,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const reset = () => {
    isLoading.value = false
    isStreaming.value = false
    error.value = null
    currentResponse.value = ''
    thinking.value = null
    conversationContext.value = null
  }

  return {
    isLoading,
    isStreaming,
    error,
    currentResponse,
    thinking,
    conversationContext,
    canSendMessage,
    startRequest,
    startStreaming,
    updateResponse,
    resetCurrentResponse,
    setThinking,
    setError,
    endRequest,
    setContext,
    clearContext,
    sendMessage,
    reset,
  }
})
