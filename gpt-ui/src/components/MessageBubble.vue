<script setup lang="ts">
import { computed } from 'vue'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isTyping?: boolean
}

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="message-wrapper" :class="{ 'user-message': isUser, 'assistant-message': isAssistant }">
    <div class="message-container">
      <div v-if="isAssistant" class="avatar">
        <div class="avatar-icon">
          <span>🤖</span>
        </div>
      </div>

      <div class="message-content">
        <div v-if="message.isTyping" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div v-else class="message-text">
          {{ message.content }}
        </div>
        <div class="message-meta">
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>

      <div v-if="isUser" class="avatar">
        <div class="avatar-icon user-avatar">
          <span>👤</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  margin-bottom: 1.5rem;
  width: 100%;
}

.message-container {
  margin: 0 auto;
  margin-left: 10px;
  margin-right: 40px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 100%;
}

.user-message .message-container {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.avatar-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--avatar-bg, #e5e7eb);
  font-size: 16px;
}

.user-avatar {
  background: var(--user-avatar-bg, #3b82f6);
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.user-message .message-content {
  text-align: right;
}

.message-text {
  background: var(--message-bg, #f3f4f6);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  line-height: 1.5;
  color: var(--text-color, #1f2937);
  word-wrap: break-word;
  white-space: pre-wrap;
}

.user-message .message-text {
  background: var(--user-message-bg, #3b82f6);
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-message .message-text {
  border-bottom-left-radius: 4px;
}

.message-meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}

.timestamp {
  opacity: 0.7;
}

.typing-indicator {
  background: var(--message-bg, #f3f4f6);
  padding: 1rem;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted, #9ca3af);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

:root.dark {
  --message-bg: #374151;
  --user-message-bg: #3b82f6;
  --user-avatar-bg: #3b82f6;
  --avatar-bg: #4b5563;
  --text-color: #f9fafb;
  --text-muted: #9ca3af;
}

@media (max-width: 768px) {
  .message-container {
    gap: 0.5rem;
  }

  .avatar {
    width: 28px;
    height: 28px;
  }

  .avatar-icon {
    font-size: 14px;
  }

  .message-text {
    padding: 0.625rem 0.875rem;
    font-size: 0.95rem;
  }
}
</style>
