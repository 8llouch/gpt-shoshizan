<script setup lang="ts">
import { onMounted } from 'vue'
import { useConversationsStore } from '../stores/conversationsStore'
import { useApiStore } from '../stores/apiStore'
import GptLayout from './GptLayout.vue'
import Sidebar from './Sidebar.vue'
import ConversationComponent from './ConversationComponent.vue'
import UserInputComponent from './UserInputComponent.vue'
import ModelSelector from '../components/base/ModelSelector.vue'

const conversationsStore = useConversationsStore()
const apiStore = useApiStore()

const handleSendMessage = (message: string) => {
  conversationsStore.sendMessage(message)
}

const handleRegenerateResponse = () => {
  conversationsStore.regenerateResponse()
}
</script>

<template>
  <GptLayout data-testid="chat-layout">
    <template #sidebar>
      <Sidebar data-testid="chat-sidebar" />
    </template>
    <template #header>
      <ModelSelector data-testid="chat-model-selector" />
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
</template>
