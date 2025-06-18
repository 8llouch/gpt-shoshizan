import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthenticationService } from '../services/authenticationService'
import { useConversationsStore } from './conversationsStore'
import { useApiStore } from './apiStore'
import { useModelStore } from './modelStore'
import { useThemeStore } from './themeStore'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'))
  const user = ref<any>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const authToken = await AuthenticationService.login(email, password)
      token.value = authToken
      localStorage.setItem('authToken', authToken)
      return authToken
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, name: string) => {
    isLoading.value = true
    try {
      await AuthenticationService.register(email, password, name)
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
    cleanAllStores()
  }

  const cleanAllStores = () => {
    const conversationsStore = useConversationsStore()
    conversationsStore.reset()

    const apiStore = useApiStore()
    apiStore.reset()

    const modelStore = useModelStore()
    modelStore.reset()

    const themeStore = useThemeStore()
    themeStore.reset()
  }

  const getAuthHeaders = () => {
    if (!token.value) return {}
    return {
      Authorization: `Bearer ${token.value}`,
    }
  }

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    getAuthHeaders,
    cleanAllStores,
  }
})
