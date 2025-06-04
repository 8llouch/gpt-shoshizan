<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatStore } from './stores/chat'
import GptLayout from './views/GptLayout.vue'
import Sidebar from './views/Sidebar.vue'
import ConversationComponent from './views/ConversationComponent.vue'
import UserInputComponent from './views/UserInputComponent.vue'
import ThemeProvider from './components/base/ThemeProvider.vue'
import ThemeSwitcher from './components/base/ThemeSwitcher.vue'

const chatStore = useChatStore()

onMounted(() => {
  chatStore.initializeStore()
})

const handleSendMessage = (message: string) => {
  chatStore.sendMessage(message)
}

const handleRegenerateResponse = () => {
  chatStore.regenerateResponse()
}
</script>

<template>
  <main>
    <ThemeProvider>
      <GptLayout>
        <template #sidebar>
          <Sidebar />
        </template>
        <template #conversation>
          <ConversationComponent
            :messages="chatStore.currentMessages"
            :is-loading="chatStore.isLoading"
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
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
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
