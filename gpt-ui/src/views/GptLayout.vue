<script setup lang="ts"></script>

<template>
  <div class="gpt-layout" data-testid="gpt-layout">
    <div class="gpt-sidebar" data-testid="gpt-sidebar">
      <slot name="sidebar"></slot>
    </div>
    <div class="gpt-main" data-testid="gpt-main">
      <div class="gpt-header" data-testid="gpt-header">
        <slot name="header"></slot>
      </div>
      <div class="gpt-conversation" data-testid="gpt-conversation">
        <slot name="conversation"></slot>
      </div>
      <div class="gpt-user-input" data-testid="gpt-user-input">
        <slot name="user-input"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gpt-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.gpt-sidebar {
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  flex-shrink: 0;
  background: var(--background-secondary);
  border-right: 1px solid var(--border-color);
  transition: all 0.3s ease;
  overflow: hidden;
}

.gpt-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.gpt-header {
  flex-shrink: 0;
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 60px;
}

.gpt-conversation {
  flex: 1;
  overflow-y: auto;
  background: var(--background-primary);
  min-height: 0;
}

.gpt-user-input {
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
  background: var(--background-primary);
  padding: 1rem;
  box-sizing: border-box;
}

@media (max-width: 767px) {
  .gpt-sidebar {
    /* Completely remove sidebar from layout on mobile */
    display: none;
    width: 0;
    min-width: 0;
    max-width: 0;
    flex: none;
  }

  .gpt-main {
    width: 100%;
    margin-left: 0;
    flex: 1;
  }
}
</style>
