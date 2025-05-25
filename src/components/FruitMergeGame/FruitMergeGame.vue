<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue";

// Game state
const gameContainer = ref(null)
const gameRunning = ref(false)

// Game configuration
const CONTAINER_WIDTH = 280
const CONTAINER_HEIGHT = 400
const CONTAINER_BORDER = 4

// Game functions
const startGame = () => {
  gameRunning.value = true
  console.log('FruitMerge game started!')
}

const pauseGame = () => {
  gameRunning.value = false
  console.log('FruitMerge game paused!')
}

const resetGame = () => {
  gameRunning.value = false
  console.log('FruitMerge game reset!')
}

// Lifecycle
onMounted(() => {
  console.log('FruitMerge game component mounted')
})

onUnmounted(() => {
  gameRunning.value = false
})

// Emit events to parent component
const emit = defineEmits(['back-to-menu'])

const handleBackClick = () => {
  emit('back-to-menu')
}
</script>

<template>
  <div class="fruit-merge-game">
    <!-- Game Header -->
    <header role="banner">
      <div class="header-content">
        <button class="back-button" @click="handleBackClick" aria-label="Back to menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1>FruitMergeGame</h1>
        <div class="theme-switch-container">
          <ThemeSwitch :theme="theme" @toggle-theme="toggleTheme" />
        </div>
      </div>
    </header>

    <!-- Game Content -->
    <main class="game-content">

    </main>
  </div>
</template>

<style scoped lang="scss">
.fruit-merge-game {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

</style>