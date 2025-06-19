<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useModelStore } from '../../stores/modelStore'
import { MODEL_OPTIONS } from '../../constants'

const { t } = useI18n()
const modelStore = useModelStore()

defineOptions({
  name: 'ModelSelector',
})

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  modelStore.setSelectedModel(target.value)
}
</script>

<template>
  <div class="model-selector">
    <label for="model-select" class="model-label">
      {{ t('model.label') }}
    </label>
    <select
      id="model-select"
      :value="modelStore.selectedModel"
      @change="handleModelChange"
      class="model-select"
    >
      <option v-for="option in MODEL_OPTIONS" :key="option.value" :value="option.value">
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.model-selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.model-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.model-select {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.model-select:hover {
  border-color: #9ca3af;
}

.model-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:root.dark .model-label {
  color: #9ca3af;
}

:root.dark .model-select {
  background-color: #374151;
  border-color: #6b7280;
  color: #f9fafb;
}

:root.dark .model-select:hover {
  border-color: #9ca3af;
}

:root.dark .model-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}
</style>
