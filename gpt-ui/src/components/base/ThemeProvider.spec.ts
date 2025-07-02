import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeProvider from './ThemeProvider.vue'

beforeEach(() => {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }
    }
})

describe('ThemeProvider', () => {
  it('renders slot content', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ThemeProvider, {
      slots: { default: '<div>slot</div>' },
      global: { plugins: [pinia] },
    })
    expect(wrapper.html()).toContain('slot')
  })
})
