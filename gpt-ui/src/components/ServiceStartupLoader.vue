<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ServiceHealthChecker, type ServiceHealth } from '../utils/serviceHealth'

const isLoading = ref(true)
const serviceHealth = ref<ServiceHealth | null>(null)
const loadingMessage = ref('🔍 Checking service availability...')
const attempt = ref(0)
const showContinueButton = ref(false)

const emit = defineEmits<{
  ready: []
}>()

const handleContinue = () => {
  isLoading.value = false
  emit('ready')
}

onMounted(async () => {
  try {
    loadingMessage.value = '🚀 Starting services...'

    // Show loading progress
    const checkInterval = setInterval(() => {
      attempt.value++
      loadingMessage.value = `⏳ Waiting for services... (${attempt.value}s)`
    }, 1000)

    const isReady = await ServiceHealthChecker.waitForServices()

    clearInterval(checkInterval)

    if (isReady) {
      loadingMessage.value = '✅ Services are ready!'
      serviceHealth.value = await ServiceHealthChecker.checkGatewayHealth()
    } else {
      loadingMessage.value = '⚠️ Services may not be fully ready. You can still continue.'
    }

    // Show the continue button
    showContinueButton.value = true
  } catch (error) {
    console.error('Service health check failed:', error)
    loadingMessage.value = '❌ Failed to connect to services. You can still continue.'
    showContinueButton.value = true
  }
})
</script>

<template>
  <div v-if="isLoading" class="startup-loader">
    <div class="loader-content">
      <div v-if="!showContinueButton" class="spinner"></div>
      <p class="loading-message">{{ loadingMessage }}</p>
      <button v-if="showContinueButton" @click="handleContinue" class="continue-button">
        Continue
      </button>
    </div>
  </div>
</template>

<style scoped>
.startup-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loader-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: #666;
  font-size: 14px;
  margin: 0 0 1rem 0;
}

.continue-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.continue-button:hover {
  background: #0056b3;
}
</style>
