import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import UserInputComponent from './UserInputComponent.vue'

describe('UserInputComponent', () => {
  it('renders textarea', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } })
    const wrapper = mount(UserInputComponent, {
      global: { plugins: [pinia, i18n] },
    })
    expect(wrapper.find('[data-testid="message-input"]').exists()).toBe(true)
  })
})
