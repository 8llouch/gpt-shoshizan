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
  <GptLayout>
    <template #sidebar>
      <Sidebar />
    </template>
    <template #header>
      <ModelSelector />
    </template>
    <template #conversation>
      <ConversationComponent
        :messages="conversationsStore.currentMessages"
        :is-loading="apiStore.isLoading || apiStore.isStreaming"
      />
    </template>
    <template #user-input>
      <UserInputComponent
        @send-message="handleSendMessage"
        @regenerate-response="handleRegenerateResponse"
      />
    </template>
  </GptLayout>
</template>
