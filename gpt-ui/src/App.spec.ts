import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { createI18n, type I18n } from 'vue-i18n'
import App from './App.vue'

vi.mock('./components/base/ThemeProvider.vue', () => ({
  default: {
    name: 'ThemeProvider',
    template: '<div data-testid="theme-provider"><slot /></div>',
  },
}))

vi.mock('./components/base/ThemeSwitcher.vue', () => ({
  default: {
    name: 'ThemeSwitcher',
    template: '<div data-testid="theme-switcher">Theme Switcher</div>',
  },
}))

vi.mock('./components/ServiceStartupLoader.vue', () => ({
  default: {
    name: 'ServiceStartupLoader',
    template: '<div data-testid="service-loader"></div>',
    emits: ['ready'],
  },
}))

describe('App.vue', () => {
  let router: Router
  let i18n: I18n

  beforeEach(() => {
    setActivePinia(createPinia())

    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div data-testid="home-page">Home</div>' },
        },
        {
          path: '/chat',
          name: 'chat',
          component: { template: '<div data-testid="chat-page">Chat</div>' },
        },
      ],
    })

    i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    })
  })

  it('renders the app structure correctly', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, i18n],
      },
    })

    const loader = wrapper.findComponent({ name: 'ServiceStartupLoader' })
    await loader.vm.$emit('ready')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="theme-provider"]').exists()).toBe(true)

    expect(wrapper.find('[data-testid="theme-switcher"]').exists()).toBe(true)

    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })

  it('renders router content correctly', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, i18n],
      },
    })

    const loader = wrapper.findComponent({ name: 'ServiceStartupLoader' })
    await loader.vm.$emit('ready')
    await wrapper.vm.$nextTick()

    await router.push('/')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="home-page"]').exists()).toBe(true)
  })

  it('handles route changes properly', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, i18n],
      },
    })

    const loader = wrapper.findComponent({ name: 'ServiceStartupLoader' })
    await loader.vm.$emit('ready')
    await wrapper.vm.$nextTick()

    await router.push('/')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="home-page"]').exists()).toBe(true)

    await router.push('/chat')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="chat-page"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="home-page"]').exists()).toBe(false)
  })

  it('maintains theme provider context across route changes', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, i18n],
      },
    })

    const loader = wrapper.findComponent({ name: 'ServiceStartupLoader' })
    await loader.vm.$emit('ready')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="theme-provider"]').exists()).toBe(true)

    await router.push('/')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="theme-provider"]').exists()).toBe(true)

    await router.push('/chat')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="theme-provider"]').exists()).toBe(true)
  })

  it('renders theme switcher consistently', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, i18n],
      },
    })

    const loader = wrapper.findComponent({ name: 'ServiceStartupLoader' })
    await loader.vm.$emit('ready')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="theme-switcher"]').exists()).toBe(true)

    await router.push('/')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="theme-switcher"]').exists()).toBe(true)

    await router.push('/chat')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="theme-switcher"]').exists()).toBe(true)
  })

  it('has proper component structure', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, i18n],
      },
    })

    const loader = wrapper.findComponent({ name: 'ServiceStartupLoader' })
    await loader.vm.$emit('ready')
    await wrapper.vm.$nextTick()

    const themeProvider = wrapper.find('[data-testid="theme-provider"]')
    expect(themeProvider.exists()).toBe(true)

    const routerView = themeProvider.findComponent({ name: 'RouterView' })
    expect(routerView.exists()).toBe(true)

    const themeSwitcher = themeProvider.find('[data-testid="theme-switcher"]')
    expect(themeSwitcher.exists()).toBe(true)
  })
})
