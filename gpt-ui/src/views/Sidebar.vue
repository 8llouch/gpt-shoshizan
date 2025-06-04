<script setup lang="ts">
import { ref } from 'vue'

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

const isOpen = ref(false)
const conversations = ref<Conversation[]>([
  {
    id: '1',
    title: 'Nouvelle conversation',
    lastMessage: 'Comment puis-je vous aider ?',
    timestamp: new Date()
  }
])

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const startNewConversation = () => {
  const newConv: Conversation = {
    id: Date.now().toString(),
    title: 'Nouvelle conversation',
    lastMessage: '',
    timestamp: new Date()
  }
  conversations.value.unshift(newConv)
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Aujourd\'hui'
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return date.toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="sidebar-wrapper">
    <aside
      :class="[
        'sidebar',
        'fixed top-0 left-0 h-full w-4/5 max-w-xs z-50 transition-transform',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:translate-x-0 md:w-64',
      ]"
    >
      <header class="sidebar-header">
        <div class="logo-section">
          <div class="logo">
            <span class="logo-text">GPT</span>
          </div>
          <h3 class="app-title">SHOSHIZAN</h3>
        </div>

        <button @click="startNewConversation" class="new-chat-btn">
          <span class="plus-icon">+</span>
          Nouvelle conversation
        </button>
      </header>

      <div class="conversations-section">
        <div class="conversations-list">
          <div
            v-for="conversation in conversations"
            :key="conversation.id"
            class="conversation-item"
          >
            <div class="conversation-content">
              <h4 class="conversation-title">{{ conversation.title }}</h4>
              <p class="conversation-preview">{{ conversation.lastMessage || 'Conversation vide' }}</p>
              <span class="conversation-date">{{ formatDate(conversation.timestamp) }}</span>
            </div>
            <button class="conversation-menu">⋮</button>
          </div>
        </div>
      </div>

      <footer class="sidebar-footer">
        <div class="user-section">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <span class="user-name">Utilisateur</span>
            <span class="user-status">En ligne</span>
          </div>
        </div>
      </footer>
    </aside>

    <div
      v-if="isOpen"
      @click="toggleSidebar"
      class="mobile-overlay md:hidden"
    ></div>
  </div>
</template>

<style scoped>
.sidebar {
  background: var(--background-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mobile-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 18px;
  cursor: pointer;
  z-index: 60;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.new-chat-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.new-chat-btn:hover {
  background: var(--primary-hover);
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

.conversations-section {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.conversation-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.conversation-item:hover {
  background: var(--hover-bg);
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-preview {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-date {
  font-size: 11px;
  color: var(--text-muted);
}

.conversation-menu {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.conversation-item:hover .conversation-menu {
  opacity: 1;
}

.conversation-menu:hover {
  background: var(--hover-bg);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--avatar-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-status {
  font-size: 12px;
  color: var(--success-color);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

.conversations-section::-webkit-scrollbar {
  width: 4px;
}

.conversations-section::-webkit-scrollbar-track {
  background: transparent;
}

.conversations-section::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 85%;
    max-width: 300px;
  }
}
</style>
