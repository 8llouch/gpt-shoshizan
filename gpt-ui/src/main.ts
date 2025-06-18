import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useConversationsStore } from './stores/conversationsStore'

const app = createApp(App).use(router)

app.use(createPinia())
app.use(i18n)

const conversationsStore = useConversationsStore()
conversationsStore.initialize()

app.mount('#app')
