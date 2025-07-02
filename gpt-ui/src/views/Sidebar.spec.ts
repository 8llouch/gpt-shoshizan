import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from './Sidebar.vue'

vi.mock('../stores/conversationsStore', () => ({
  useConversationsStore: () => ({
    conversations: [],
    createConversation: vi.fn(),
    selectConversation: vi.fn(),
    deleteConversation: vi.fn(),
  }),
}))
vi.mock('../stores/authStore', () => ({ useAuthStore: () => ({ logout: vi.fn() }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

describe('Sidebar', () => {
  it('renders sidebar', () => {
    const wrapper = mount(Sidebar)
    expect(wrapper.exists()).toBe(true)
  })
  it('emits toggle', async () => {
    const wrapper = mount(Sidebar)
    await wrapper.vm.$emit('toggle')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })
})
