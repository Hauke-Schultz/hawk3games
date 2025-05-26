<script setup>
import {ref, watch, onMounted, computed} from 'vue'

  const theme = ref('dark')

  // Watch theme changes and update DOM + localStorage
  watch(theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  })

  onMounted(() => {
    theme.value = localStorage.getItem('theme') || 'dark'
  })

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const isDark = computed(() => theme.value === 'dark')
</script>

<template>
  <div class="theme-switch">
    <button @click="toggleTheme" class="btn btn--circle" :class="{ 'dark': isDark }" aria-label="theme-switch">
      <span class="switch-icon">
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </span>
    </button>
  </div>
</template>

<style scoped>
.theme-switch {
  display: flex;
  align-items: center;
}

.switch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>