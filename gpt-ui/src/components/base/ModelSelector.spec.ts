import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ModelSelector from './ModelSelector.vue'

vi.mock('../../stores/modelStore', () => ({
  useModelStore: () => ({
    selectedModel: 'test-model',
    setSelectedModel: vi.fn(),
  }),
}))

describe('ModelSelector', () => {
  it('renders select', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } })
    const wrapper = mount(ModelSelector, {
      global: { plugins: [i18n] },
    })
    expect(wrapper.find('select').exists()).toBe(true)
  })
})
