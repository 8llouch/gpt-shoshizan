<script></script>

<template>
  <div class="gpt-layout">
    <div class="gpt-sidebar">
      <slot name="sidebar"></slot>
    </div>
    <div class="gpt-main">
      <div class="gpt-header">
        <slot name="header"></slot>
      </div>
      <div class="gpt-conversation">
        <slot name="conversation"></slot>
      </div>
      <div class="gpt-user-input">
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

@media (max-width: 768px) {
  .gpt-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 50;
    transform: translateX(-100%);
    width: 85%;
    max-width: 300px;
  }

  .gpt-sidebar.open {
    transform: translateX(0);
  }

  .gpt-main {
    width: 100%;
    margin-left: 0;
  }
}
</style>
