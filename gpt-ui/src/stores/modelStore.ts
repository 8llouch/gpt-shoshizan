
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_CONFIG } from '../constants'
import { useAuthStore } from './authStore'

interface OllamaModel {
  name: string;
  model: string;
  details?: {
    parameter_size?: string;
    family?: string;
  };
}

export const useModelStore = defineStore('modelStore', () => {
  const models = ref<OllamaModel[]>([])
  const selectedModel = ref<string | null>(null)
  const isLoading = ref<boolean>(false)

  const selectedModelName = computed(() => {
    if (!selectedModel.value) return ''
    const found = models.value.find((m) => m.model === selectedModel.value)
    if (found) {
      let label = found.name
      if (found.details?.parameter_size) label += ` (${found.details.parameter_size})`
      return label
    }
    return selectedModel.value
  })

  const setSelectedModel = (model: string) => {
    selectedModel.value = model
  }

  const reset = () => {
    selectedModel.value = models.value[0]?.model
  }

  const fetchModels = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const authStore = useAuthStore()
      const authHeaders = authStore.getAuthHeaders()

      const url = `${API_CONFIG.BASE_URL}/gateway/ollama/models`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }

      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error('Failed to fetch models')

      const data = await res.json()
      if (Array.isArray(data.models) && data.models.length > 0) {
        models.value = data.models

        // Si aucun modèle n'est sélectionné, ou si le modèle sélectionné n'existe plus
        if (!selectedModel.value || !models.value.find(m => m.model === selectedModel.value)) {
          // Sélectionner le premier modèle disponible
          selectedModel.value = models.value[0].model
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      models.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    models,
    selectedModel,
    selectedModelName,
    isLoading,
    setSelectedModel,
    reset,
    fetchModels,
  }
})
