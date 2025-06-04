import { ref, computed } from 'vue'
import type { AppError } from '@/types'
import { ERROR_CODES } from '@/constants'
import { createAppError } from '@/utils'

export function useErrorHandler() {
  const errors = ref<AppError[]>([])
  const isShowingError = ref(false)

  const currentError = computed(() => errors.value[errors.value.length - 1] || null)
  const hasErrors = computed(() => errors.value.length > 0)
  const errorCount = computed(() => errors.value.length)

  const handleError = (error: unknown, context?: Record<string, unknown>) => {
    console.error('Error caught:', error)

    let appError: AppError

    if (error instanceof Error) {
      appError = createAppError(ERROR_CODES.UNKNOWN_ERROR, error.message, {
        ...context,
        originalError: error.name,
      })
    } else if (typeof error === 'string') {
      appError = createAppError(ERROR_CODES.UNKNOWN_ERROR, error, context)
    } else {
      appError = createAppError(ERROR_CODES.UNKNOWN_ERROR, 'Une erreur inconnue est survenue', {
        ...context,
        originalError: error,
      })
    }

    addError(appError)
    return appError
  }

  const handleAPIError = (error: any, endpoint: string) => {
    const status = error?.response?.status || 500
    const message = error?.response?.data?.message || error?.message || 'Erreur API'

    const appError: AppError = {
      ...createAppError(ERROR_CODES.API_ERROR, message, { endpoint, status }),
    }

    addError(appError)
    return appError
  }

  const handleNetworkError = (error: any) => {
    const appError = createAppError(
      ERROR_CODES.NETWORK_ERROR,
      'Erreur de connexion. Vérifiez votre connexion internet.',
      { originalError: error?.message },
    )

    addError(appError)
    return appError
  }

  const handleValidationError = (field: string, message: string) => {
    const appError = createAppError(ERROR_CODES.VALIDATION_ERROR, message, { field })

    addError(appError)
    return appError
  }

  const addError = (error: AppError) => {
    errors.value.push(error)

    if (errors.value.length > 10) {
      errors.value = errors.value.slice(-10)
    }
    showError()
  }

  const removeError = (errorId?: string) => {
    if (errorId) {
      const index = errors.value.findIndex((e) => `${e.timestamp.getTime()}-${e.code}` === errorId)
      if (index !== -1) {
        errors.value.splice(index, 1)
      }
    } else {
      errors.value.pop()
    }

    if (errors.value.length === 0) {
      hideError()
    }
  }

  const clearErrors = () => {
    errors.value = []
    hideError()
  }

  const showError = () => {
    isShowingError.value = true
  }

  const hideError = () => {
    isShowingError.value = false
  }

  const dismissCurrentError = () => {
    removeError()
  }

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>,
  ): Promise<T | null> => {
    try {
      return await operation()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }

  const handleAsyncError = (promise: Promise<any>, context?: Record<string, unknown>) => {
    promise.catch((error) => handleError(error, context))
  }

  return {
    errors: errors.value,
    currentError,
    hasErrors,
    errorCount,
    isShowingError,

    handleError,
    handleAPIError,
    handleNetworkError,
    handleValidationError,

    addError,
    removeError,
    clearErrors,
    dismissCurrentError,

    showError,
    hideError,

    withErrorHandling,
    handleAsyncError,
  }
}
