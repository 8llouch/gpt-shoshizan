import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthenticationComponent from './AuthenticationComponent.vue'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({ login: vi.fn(), register: vi.fn() }),
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('AuthenticationComponent', () => {
  it('renders login form', () => {
    const wrapper = mount(AuthenticationComponent)
    expect(wrapper.html()).toContain('email')
    expect(wrapper.html()).toContain('password')
  })
  it('toggles mode via toggle button', async () => {
    const wrapper = mount(AuthenticationComponent)
    const before = wrapper.html()
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(1)
    await buttons[1].trigger('click')
    const after = wrapper.html()
    expect(before).not.toBe(after)
  })
})
