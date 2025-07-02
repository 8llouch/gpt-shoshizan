import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GptLayout from './GptLayout.vue'

describe('GptLayout', () => {
  it('renders', () => {
    const wrapper = mount(GptLayout)
    expect(wrapper.exists()).toBe(true)
  })
})
