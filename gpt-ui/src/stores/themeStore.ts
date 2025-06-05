import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('themeStore', () => {
  const currentTheme = ref<Theme>('light')

  const getCurrentTheme = computed(() => currentTheme.value)

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  }

  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement

    root.classList.remove('dark', 'light')

    if (theme === 'auto') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const appliedTheme = systemPrefersDark ? 'dark' : 'light'
      root.classList.add(appliedTheme)
    } else {
      root.classList.add(theme)
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
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme

    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      setTheme('light')
    }
  }

  return {
    currentTheme,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  }
})
