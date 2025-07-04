<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import ThemeProvider from './components/base/ThemeProvider.vue'
import ThemeSwitcher from './components/base/ThemeSwitcher.vue'
import ServiceStartupLoader from './components/ServiceStartupLoader.vue'

const servicesReady = ref(false)

const onServicesReady = () => {
  servicesReady.value = true
}
</script>

<template>
  <ServiceStartupLoader v-if="!servicesReady" @ready="onServicesReady" />

  <ThemeProvider v-if="servicesReady">
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
