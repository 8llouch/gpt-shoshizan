import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MODEL_OPTIONS } from '@/constants'

export const useModelStore = defineStore('modelStore', () => {
  const selectedModel = ref<string>('llama3.2')

  const getSelectedModel = computed(() => selectedModel.value)

  const selectedModelName = computed(() => {
    const option = MODEL_OPTIONS.find((opt) => opt.value === selectedModel.value)
    return option?.text || selectedModel.value
  })

  const setSelectedModel = (model: string) => {
    selectedModel.value = model
  }

  return {
    selectedModel,
    getSelectedModel,
    selectedModelName,
    setSelectedModel,
  }
})
