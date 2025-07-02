import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ChatComponent from './ChatComponent.vue'

describe('ChatComponent', () => {
  it('renders', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } })
    const wrapper = mount(ChatComponent, {
      global: { plugins: [pinia, i18n] },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
