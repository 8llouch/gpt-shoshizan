import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ChatComponent from './ChatComponent.vue'

vi.mock('../stores/modelStore', () => ({
  useModelStore: () => ({
    selectedModel: 'test-model',
    setSelectedModel: vi.fn(),
    fetchModels: vi.fn(),
    models: [{ model: 'test-model', name: 'Test Model' }],
    selectedModelName: 'test-model',
  }),
}))

vi.mock('../stores/conversationsStore', () => ({
  useConversationsStore: () => ({
    conversations: [],
    currentConversationId: null,
    currentConversation: null,
    sendMessage: vi.fn(),
  }),
}))

vi.mock('../stores/apiStore', () => ({
  useApiStore: () => ({
    isStreaming: false,
    currentStreamingMessage: '',
  }),
}))

describe('ChatComponent', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } })
    wrapper = mount(ChatComponent, {
      global: { plugins: [pinia, i18n] },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
