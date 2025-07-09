import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../router'
import { AuthenticationService } from '../services/authenticationService'
import { useConversationsStore } from './conversationsStore'
import { useApiStore } from './apiStore'
import { useModelStore } from './modelStore'
import { useThemeStore } from './themeStore'
import { API_CONFIG } from '../constants'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'))
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

  const validateToken = async (): Promise<boolean> => {
    if (!token.value) {
      return false
    }

    try {
      const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await handleTokenExpiration()
        }
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  const handleTokenExpiration = async () => {
    console.log('Token expired, logging out user')
    token.value = null
    localStorage.removeItem('authToken')
    cleanAllStores()
    router.push('/auth')
  }

  const logout = async () => {
    token.value = null
    localStorage.removeItem('authToken')
    cleanAllStores()
    router.push('/auth')
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
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    validateToken,
    handleTokenExpiration,
    getAuthHeaders,
    cleanAllStores,
  }
})
