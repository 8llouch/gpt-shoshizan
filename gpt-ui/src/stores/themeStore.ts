import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')

  const setTheme = (theme: Theme) => {
    console.log('🎨 Setting theme to:', theme)
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  }

  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    console.log('🔄 Toggling theme from', currentTheme.value, 'to', newTheme)
    setTheme(newTheme)
  }

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    console.log('📝 Applying theme:', theme)

    root.classList.remove('dark', 'light')

    if (theme === 'auto') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const appliedTheme = systemPrefersDark ? 'dark' : 'light'
      root.classList.add(appliedTheme)
      console.log('🖥️ Auto theme resolved to:', appliedTheme)
    } else {
      root.classList.add(theme)
      console.log('✅ Applied theme class:', theme)
    }

    updateGlobalStyles()
  }

  const updateGlobalStyles = () => {
    const isDark = document.documentElement.classList.contains('dark')

    document.body.style.backgroundColor = isDark ? '#0a0a0a' : '#ffffff'
    document.body.style.color = isDark ? '#f9fafb' : '#1f2937'

    setTimeout(() => {
      document.body.style.backgroundColor = isDark
        ? 'var(--background-primary)'
        : 'var(--background-primary)'
    }, 50)

    console.log('🎨 Updated global styles for', isDark ? 'dark' : 'light', 'theme')
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme
    console.log('🚀 Initializing theme. Saved theme:', savedTheme)

    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      setTheme('light')
    }
  }

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  }
})
