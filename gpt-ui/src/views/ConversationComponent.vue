<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Message } from '../types'
import MessageBubble from '../components/MessageBubble.vue'

const props = defineProps<{
  messages: Message[]
  isLoading?: boolean
}>()

const conversationContainer = ref<HTMLElement>()

const scrollToBottom = () => {
  if (conversationContainer.value) {
    conversationContainer.value.scrollTop = conversationContainer.value.scrollHeight
  }
}

const displayMessages = computed(() => {
  const messages = [...props.messages]
  if (props.isLoading) {
    messages.push({
      id: 'loading',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    })
  }
  return messages
})
</script>

<template>
  <div class="conversation-container">


    <div class="messages-container">
      <MessageBubble
        v-for="message in displayMessages"
        :key="message.id"
        :message="message"
      />
    </div>
  </div>
</template>

<style scoped>
.conversation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scroll-behavior: smooth;
}

:root.dark {
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --card-bg: #1f2937;
  --border-color: #374151;
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
