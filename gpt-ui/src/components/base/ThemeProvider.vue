<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useThemeStore } from '../../stores/themeStore'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})

watch(
  () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  (isDark) => {
    if (!localStorage.getItem('theme')) {
      themeStore.setTheme(isDark ? 'dark' : 'light')
    }
  },
)

defineOptions({
  name: 'ThemeProvider',
})
</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>
