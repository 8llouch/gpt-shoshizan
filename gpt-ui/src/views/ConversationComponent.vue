<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { marked } from 'marked'
import { useI18n } from 'vue-i18n'
import { useApiStore } from '../stores/apiStore'
import { useModelStore } from '../stores/modelStore'
import type { Message } from '@shoshizan/shared-interfaces'

const { t } = useI18n()

const props = defineProps<{
  messages: Message[]
  isLoading?: boolean
}>()

const apiStore = useApiStore()
const modelStore = useModelStore()
const conversationContainer = ref<HTMLElement>()

const scrollToBottom = () => {
  if (conversationContainer.value) {
    conversationContainer.value.scrollTop = conversationContainer.value.scrollHeight
  }
}

const displayMessages = computed(() => {
  // Simply return all messages - no need to filter empty ones anymore
  return props.messages
})

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch(
  () => apiStore.currentResponse,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="conversation-container" data-testid="conversation-container">
    <div ref="conversationContainer" class="messages-container" data-testid="messages-container">
      <div
        v-for="message in displayMessages"
        :key="message.id"
        :class="`message-wrapper ${message.role}-message`"
        :data-testid="`message-${message.role}`"
      >
        <div class="message-container" data-testid="message-container">
          <div v-if="message.role === 'assistant'" class="avatar" data-testid="assistant-avatar">
            <span data-testid="assistant-model">{{
              message.modelName || t('conversation.assistant')
            }}</span>
          </div>

          <div class="message-content" data-testid="message-content">
            <div
              class="message-text"
              v-html="marked(message.content)"
              data-testid="message-text"
            ></div>
            <div class="message-meta">
              <span class="timestamp" data-testid="message-timestamp">{{
                formatTime(message.timestamp)
              }}</span>
            </div>
          </div>

          <div v-if="message.role === 'user'" class="avatar user-avatar" data-testid="user-avatar">
            <span>👤</span>
          </div>
        </div>
      </div>

      <div
        v-if="props.isLoading && !apiStore.isStreaming"
        class="message-wrapper assistant-message"
        data-testid="typing-indicator"
      >
        <div class="message-container">
          <div class="avatar">
            <span>{{ modelStore.selectedModelName }}</span>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="apiStore.isStreaming"
        class="message-wrapper assistant-message streaming"
        data-testid="streaming-message"
      >
        <div class="message-container">
          <div class="avatar">
            <span>{{ modelStore.selectedModelName }}</span>
          </div>
          <div class="message-content">
            <div
              class="message-text streaming-text"
              v-html="marked(apiStore.currentResponse)"
              data-testid="streaming-text"
            ></div>
            <div class="message-meta">
              <span class="streaming-indicator" data-testid="streaming-indicator">{{
                t('conversation.streaming')
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scroll-behavior: smooth;
}

.message-wrapper {
  margin-bottom: 1.5rem;
  width: 100%;
}

.message-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 80%;
  margin: 0 auto;
}

.user-message .message-container {
  flex-direction: row-reverse;
  margin-left: auto;
  margin-right: 0;
}

.assistant-message .message-container {
  margin-left: 0;
  margin-right: auto;
}

.avatar {
  min-width: 60px;
  width: auto;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--avatar-bg, #e5e7eb);
  font-size: 10px;
  font-weight: 600;
  padding: 0 8px;
  flex-shrink: 0;
  text-align: center;
  color: var(--avatar-text, #374151);
}

.user-avatar {
  background: var(--user-avatar-bg, #3b82f6);
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
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

.streaming-text {
  background: var(--streaming-bg, #f0fdf4);
  border: 1px solid var(--streaming-border, #bbf7d0);
  position: relative;
}

.streaming-text::after {
  content: '▋';
  animation: blink 1s infinite;
  color: var(--streaming-cursor, #059669);
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.message-meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}

.streaming-indicator {
  color: var(--streaming-color, #059669);
  font-weight: 500;
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
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 24px;
}

.empty-content h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: 2rem;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.suggestion-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.suggestion-card:hover {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.suggestion-title {
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: 0.5rem;
}

.suggestion-desc {
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
}

:root.dark {
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --card-bg: #1f2937;
  --border-color: #374151;
  --message-bg: #374151;
  --user-message-bg: #3b82f6;
  --user-avatar-bg: #3b82f6;
  --avatar-bg: #4b5563;
  --avatar-text: #f9fafb;
  --text-color: #f9fafb;
  --text-muted: #9ca3af;
  --streaming-bg: #1a2e1a;
  --streaming-border: #2d5a2d;
  --streaming-color: #34d399;
  --streaming-cursor: #34d399;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, #d1d5db);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover, #9ca3af);
}

:root.dark {
  --scrollbar-thumb: #4b5563;
  --scrollbar-thumb-hover: #6b7280;
}
</style>
