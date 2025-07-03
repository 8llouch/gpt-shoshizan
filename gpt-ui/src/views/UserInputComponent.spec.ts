import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import UserInputComponent from './UserInputComponent.vue'

describe('UserInputComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders textarea', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          userInput: {
            placeholder: 'Type your message...',
            regenerate: 'Regenerate',
            sending: 'Sending...',
            errorSend: 'Error sending message',
            errorRegenerate: 'Error regenerating response',
          },
        },
      },
    })

    const wrapper = mount(UserInputComponent, {
      global: { plugins: [createPinia(), i18n] },
    })

    expect(wrapper.find('[data-testid="message-input"]').exists()).toBe(true)
  })
})
