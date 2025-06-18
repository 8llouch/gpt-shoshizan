<script setup lang="ts">
import { RouterView } from 'vue-router'
import ThemeProvider from './components/base/ThemeProvider.vue'
import ThemeSwitcher from './components/base/ThemeSwitcher.vue'
</script>

<template>
  <ThemeProvider>
    <RouterView />
    <ThemeSwitcher />
  </ThemeProvider>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
/* App-level styles */
</style>
