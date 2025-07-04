import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useConversationsStore } from './stores/conversationsStore'
import { ServiceHealthChecker } from './utils/serviceHealth'

const app = createApp(App).use(router)

app.use(createPinia())
app.use(i18n)

async function initializeApp() {
  await ServiceHealthChecker.waitForServices()

  const conversationsStore = useConversationsStore()
  conversationsStore.initialize()
}

app.mount('#app')
initializeApp()
