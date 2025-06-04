<script setup lang="ts">
import { useThemeStore } from '../../stores/themeStore'

const themeStore = useThemeStore()

defineOptions({
  name: 'ThemeSwitcher',
})
</script>

<template>
  <div class="theme-switcher">
    <button
      class="theme-button"
      @click="themeStore.toggleTheme()"
      :title="
        themeStore.currentTheme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'
      "
    >
      <span v-if="themeStore.currentTheme === 'light'" class="icon">🌙</span>
      <span v-else class="icon">☀️</span>
    </button>
  </div>
</template>

<style scoped>
.theme-switcher {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-button {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.theme-button:hover {
  background-color: #f3f4f6;
  transform: scale(1.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.theme-button:active {
  transform: scale(0.95);
}

.icon {
  font-size: 18px;
  line-height: 1;
}

:root.dark .theme-button {
  background-color: #374151;
  border-color: #6b7280;
  color: #f9fafb;
}

:root.dark .theme-button:hover {
  background-color: #4b5563;
}
</style>
