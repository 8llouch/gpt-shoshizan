<script setup lang="ts">
import { onMounted } from 'vue'
import { useConversationsStore } from './stores/conversationsStore'
import { useApiStore } from './stores/apiStore'
import GptLayout from './views/GptLayout.vue'
import Sidebar from './views/Sidebar.vue'
import ConversationComponent from './views/ConversationComponent.vue'
import UserInputComponent from './views/UserInputComponent.vue'
import ThemeProvider from './components/base/ThemeProvider.vue'
import ThemeSwitcher from './components/base/ThemeSwitcher.vue'
import ModelSelector from './components/base/ModelSelector.vue'

const conversationsStore = useConversationsStore()
const apiStore = useApiStore()

onMounted(() => {
  conversationsStore.initialize()
})

const handleSendMessage = (message: string) => {
  conversationsStore.sendMessage(message)
}

const handleRegenerateResponse = () => {
  conversationsStore.regenerateResponse()
}
</script>

<template>
  <main>
    <ThemeProvider>
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
      <ThemeSwitcher />
    </ThemeProvider>
  </main>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
main {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
