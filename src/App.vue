<script setup>
  import {onMounted, ref, watch} from 'vue'
  import ThemeSwitch from './components/ThemeSwitch.vue'

  const theme = ref('light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  })

  onMounted(() => {
    theme.value = localStorage.getItem('theme') || 'light'
  })
</script>

<template>
  <div class="app-container" :class="theme" role="application">
    <header role="banner">
      <h1>Hawk3Games</h1>
      <div class="theme-switch-container">
        <ThemeSwitch :theme="theme" @toggle-theme="toggleTheme" />
      </div>
    </header>
    <main id="main-content">
      Content
    </main>
  </div>
</template>

<style lang="scss">
  @use './assets/variables.scss' as vars;

  .app-container {
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
    transition: background-color 0.3s, color 0.3s;
    display: flex;
    flex-direction: column;

    &.light {
      background-color: var(--bg-color);
      color: var(--text-color);
    }

    &.dark {
      background-color: var(--bg-color);
      color: var(--text-color);
    }

    @media (min-width: vars.$breakpoint-md) {
      max-width: 75rem;
      margin: 0 auto;
    }
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    flex-wrap: wrap;

    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-4) var(--space-8);
      flex-wrap: nowrap;
    }
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: bold;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-2xl);
    }
  }

  h2, h3 {
    margin: 0;
    font-size: var(--font-size-lg);

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-xl);
    }
  }

  p {
    margin: 0;
  }

  .theme-switch-container {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-2);

    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-4);
    }
  }

  main {
    width: 100%;
    flex-grow: 1;
    padding: var(--space-4);

    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-8);
    }

    &:focus {
      outline: none;
    }
  }

  .content {
    margin-top: var(--space-4);

    @media (min-width: vars.$breakpoint-md) {
      margin-top: var(--space-8);
    }

    &.full-width {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
