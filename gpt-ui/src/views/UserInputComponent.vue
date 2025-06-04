<script setup lang="ts">
import { ref, nextTick } from 'vue'

const emit = defineEmits<{
  sendMessage: [message: string]
  regenerateResponse: []
}>()

const message = ref('')
const textarea = ref<HTMLTextAreaElement>()
const isLoading = ref(false)

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
  if (!message.value.trim() || isLoading.value) return

  const messageToSend = message.value.trim()
  message.value = ''
  isLoading.value = true

  await nextTick()
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }

  emit('sendMessage', messageToSend)
  isLoading.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const regenerateResponse = () => {
  if (!isLoading.value) {
    emit('regenerateResponse')
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
          placeholder="Tapez votre message ici..."
          rows="1"
          class="message-input"
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="!message.trim() || isLoading"
          class="send-button"
          :class="{ 'disabled': !message.trim() || isLoading }"
        >
          <span v-if="!isLoading" class="send-icon">↗</span>
          <span v-else class="loading-icon">⟳</span>
        </button>
      </div>
      <div class="actions">
        <button
          @click="regenerateResponse"
          :disabled="isLoading"
          class="regenerate-button"
        >
          <span class="regenerate-icon">↻</span>
          Régénérer la réponse
        </button>
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
  background: var(--input-wrapper-bg, #ffffff);
  border: 1px solid var(--border-color, #d1d5db);
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
  color: var(--text-color, #1f2937);
  min-height: 24px;
  max-height: 200px;
  overflow-y: auto;
}

.message-input::placeholder {
  color: var(--placeholder-color, #9ca3af);
}

.send-button {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color, #2563eb);
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
  background: var(--primary-hover, #1d4ed8);
  transform: scale(1.05);
}

.send-button.disabled {
  background: var(--disabled-color, #9ca3af);
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.regenerate-button:hover:not(:disabled) {
  background: var(--hover-bg, #f3f4f6);
  border-color: var(--border-hover, #9ca3af);
}

.regenerate-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.regenerate-icon {
  font-size: 14px;
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
  --border-hover: #6b7280;
}
</style>
