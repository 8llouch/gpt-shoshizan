<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '../stores/chatStore'
import { useApiStore } from '../stores/apiStore'

const { t } = useI18n()
const chatStore = useChatStore()
const apiStore = useApiStore()

const message = ref('')
const textarea = ref<HTMLTextAreaElement>()

const adjustTextareaHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = textarea.value.scrollHeight + 'px'
  }
}

const handleInput = () => {
  adjustTextareaHeight()
}

const sendMessage = async () => {
  if (!message.value.trim() || !apiStore.canSendMessage) return

  const messageToSend = message.value.trim()
  message.value = ''

  await nextTick()
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }

  try {
    await chatStore.sendMessage(messageToSend)
  } catch (error) {
    console.error(t('userInput.errorSend'), error)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const regenerateResponse = async () => {
  if (!apiStore.canSendMessage) return

  try {
    await chatStore.regenerateResponse()
  } catch (error) {
    console.error(t('userInput.errorRegenerate'), error)
  }
}
</script>

<template>
  <div class="user-input-container">
    <div class="input-wrapper">
      <div class="input-box">
        <textarea
          ref="textarea"
          v-model="message"
          @input="handleInput"
          @keydown="handleKeydown"
          :placeholder="t('userInput.placeholder')"
          rows="1"
          class="message-input"
          :disabled="!apiStore.canSendMessage"
        />
        <button
          @click="sendMessage"
          :disabled="!message.trim() || !apiStore.canSendMessage"
          class="send-button"
          :class="{ disabled: !message.trim() || !apiStore.canSendMessage }"
        >
          <span v-if="!apiStore.isLoading && !apiStore.isStreaming" class="send-icon">↗</span>
          <span v-else class="loading-icon">⟳</span>
        </button>
      </div>
      <div class="actions">
        <button
          @click="regenerateResponse"
          :disabled="!apiStore.canSendMessage"
          class="regenerate-button"
        >
          <span class="regenerate-icon">↻</span>
          {{ t('userInput.regenerate') }}
        </button>
        <div v-if="apiStore.error" class="error-message">
          {{ apiStore.error }}
        </div>
        <div v-if="apiStore.isStreaming" class="streaming-indicator">{{ t('userInput.sending') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-input-container {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.input-wrapper {
  background: var(--input-wrapper-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-box {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-input {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  background: transparent;
  color: var(--text-color);
  min-height: 24px;
  max-height: 200px;
  overflow-y: auto;
}

.message-input::placeholder {
  color: var(--placeholder-color);
}

.send-button {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.send-button:hover:not(.disabled) {
  background: var(--primary-hover);
  transform: scale(1.05);
}

.send-button.disabled {
  background: var(--disabled-color);
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  font-size: 18px;
  font-weight: bold;
}

.loading-icon {
  font-size: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.regenerate-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.regenerate-button:hover:not(:disabled) {
  background: var(--hover-bg);
  border-color: var(--border-hover);
}

.regenerate-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.regenerate-icon {
  font-size: 14px;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
  padding: 4px 8px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

.streaming-indicator {
  color: #059669;
  font-size: 12px;
  margin-top: 8px;
  padding: 4px 8px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.streaming-indicator::before {
  content: '●';
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

:root {
  --input-wrapper-bg: #ffffff;
  --text-color: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --placeholder-color: #9ca3af;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --disabled-color: #9ca3af;
  --hover-bg: #f3f4f6;
  --border-color: #d1d5db;
  --border-hover: #9ca3af;
}

:root.dark {
  --input-wrapper-bg: #1f2937;
  --text-color: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --placeholder-color: #6b7280;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --disabled-color: #6b7280;
  --hover-bg: #374151;
  --border-color: #6b7280;
  --border-hover: #9ca3af;
}

:root.dark .error-message {
  color: #f87171;
  background-color: #2d1b1b;
  border-color: #5d2c2c;
}

:root.dark .streaming-indicator {
  color: #34d399;
  background-color: #1a2e1a;
  border-color: #2d5a2d;
}
</style>
