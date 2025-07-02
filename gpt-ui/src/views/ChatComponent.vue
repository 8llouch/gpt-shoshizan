<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useConversationsStore } from '../stores/conversationsStore'
import { useApiStore } from '../stores/apiStore'
import GptLayout from './GptLayout.vue'
import Sidebar from './Sidebar.vue'
import ConversationComponent from './ConversationComponent.vue'
import UserInputComponent from './UserInputComponent.vue'
import ModelSelector from '../components/base/ModelSelector.vue'

const conversationsStore = useConversationsStore()
const apiStore = useApiStore()

const isSidebarOpen = ref(false)

const handleSendMessage = (message: string) => {
  conversationsStore.sendMessage(message)
}

const handleRegenerateResponse = () => {
  conversationsStore.regenerateResponse()
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="chat-container" data-testid="chat-container">
    <!-- Sidebar rendered outside layout on mobile for proper overlay -->
    <Sidebar
      data-testid="chat-sidebar"
      :is-open="isSidebarOpen"
      @toggle="toggleSidebar"
      class="mobile-sidebar"
    />

    <GptLayout data-testid="chat-layout">
      <template #sidebar>
        <!-- Desktop sidebar slot -->
        <Sidebar
          data-testid="chat-sidebar-desktop"
          :is-open="isSidebarOpen"
          @toggle="toggleSidebar"
          class="desktop-sidebar"
        />
      </template>
      <template #header>
        <div class="header-content" data-testid="chat-header-content">
          <button
            @click="toggleSidebar"
            class="sidebar-toggle-btn"
            data-testid="sidebar-toggle-btn"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <ModelSelector data-testid="chat-model-selector" />
        </div>
      </template>
      <template #conversation>
        <ConversationComponent
          data-testid="chat-conversation"
          :messages="conversationsStore.currentMessages"
          :is-loading="apiStore.isLoading || apiStore.isStreaming"
        />
      </template>
      <template #user-input>
        <UserInputComponent
          data-testid="chat-user-input"
          @send-message="handleSendMessage"
          @regenerate-response="handleRegenerateResponse"
        />
      </template>
    </GptLayout>
  </div>
</template>

<style scoped>
.chat-container {
  position: relative;
  height: 100vh;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.sidebar-toggle-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.sidebar-toggle-btn:hover {
  background: var(--hover-bg);
}

/* Mobile sidebar - visible on mobile, hidden on desktop */
.mobile-sidebar {
  @media (min-width: 768px) {
    display: none;
  }
}

/* Desktop sidebar - hidden on mobile, visible on desktop */
.desktop-sidebar {
  @media (max-width: 767px) {
    display: none;
  }
}

/* Hide toggle button on desktop */
@media (min-width: 768px) {
  .sidebar-toggle-btn {
    display: none;
  }
}
</style>
