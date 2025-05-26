<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue";

// Game state
const gameContainer = ref(null)
const gameRunning = ref(false)

// Game stats (placeholder values)
const currentLevel = ref(1)
const coins = ref(1251)
const diamonds = ref(251)

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

// Format numbers for display
const formatNumber = (num) => {
  return num.toString()
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
          <ThemeSwitch />
        </div>
      </div>
    </header>

    <!-- Game Stats Header -->
    <div class="game-stats-header">
      <!-- Level Display -->
      <div class="level-display">
        <span class="level-text">LEVEL {{ currentLevel.toString().padStart(2, '0') }}</span>
      </div>

      <!-- Stats Display -->
      <div class="stats-display">
        <div class="stat-item coins">
          <span class="stat-value">{{ formatNumber(coins) }}</span>
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.8643 1.58644L8.54707 1.1212L8.41312 1.78468C6.25302 2.55799 4.39922 4.86186 3.80003 7.84349C3.20085 10.8251 4.02417 13.663 5.71635 15.2132L5.5833 15.8775L7.90502 16.3428C10.9876 16.9625 14.1505 14.1604 14.9693 10.0857C15.7882 6.01111 13.9469 2.20527 10.8643 1.58644Z" fill="#E86124"/>
            <path d="M8.33811 14.1666L6.02085 13.6969L6.1539 13.0334C4.67157 11.6752 3.85718 9.33028 4.07953 6.76567C3.96605 7.11937 3.87273 7.47922 3.80003 7.84349C3.20085 10.826 4.02417 13.663 5.71635 15.2132L5.5833 15.8775L7.90502 16.3428C10.9876 16.9625 14.1505 14.1604 14.9693 10.0857C15.0404 9.72268 15.0917 9.35602 15.1229 8.98738C14.0094 12.461 11.1411 14.7256 8.33811 14.1666Z" fill="#DC4A26"/>
            <path d="M12.6465 9.62148C13.4652 5.54644 11.6297 1.74086 8.54686 1.12148C5.46399 0.502101 2.30112 3.30347 1.48241 7.37852C0.663698 11.4536 2.49916 15.2591 5.58204 15.8785C8.66491 16.4979 11.8278 13.6965 12.6465 9.62148Z" fill="#F0E92D"/>
            <path d="M11.1039 9.31156C11.6964 6.36262 10.3682 3.60868 8.13724 3.16047C5.90631 2.71225 3.6175 4.73949 3.02503 7.68844C2.43256 10.6374 3.76079 13.3913 5.99172 13.8395C8.22265 14.2877 10.5115 12.2605 11.1039 9.31156Z" fill="#EF8521"/>
            <path d="M7.00759 12.4128C4.7573 11.961 3.19907 9.88035 3.07851 7.44433C3.05946 7.5247 3.0416 7.60596 3.02494 7.68811C2.4329 10.6349 3.76164 13.3906 5.99228 13.8389C7.42818 14.1273 8.88729 13.3924 9.90349 12.0413C9.00385 12.4754 7.98765 12.6057 7.00759 12.4128Z" fill="#E86124"/>
          </svg>
        </div>
        <div class="stat-item diamonds">
          <span class="stat-value">{{ formatNumber(diamonds) }}</span>
          <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.6514 0.5L13.8008 0.69043L17.3926 5.24609L17.626 5.54102L17.4062 5.84668L9.90625 16.292L9.50098 16.8574L9.09473 16.292L1.59375 5.84668L1.37402 5.54102L1.60742 5.24609L5.19922 0.69043L5.34961 0.5H13.6514Z" fill="#ED6FF7" stroke="white"/>
            <path d="M13.4084 1H9.5005H5.59162L2 5.55537L9.5005 16L17 5.55537L13.4084 1Z" fill="#ED6FF7"/>
            <path d="M9.50043 5.43665H5.75018L9.50043 16L13.2497 5.43665H9.50043Z" fill="#E249F2"/>
            <path d="M9.50043 1L5.75018 5.43665H13.2497L9.50043 1Z" fill="#FA6AFF"/>
            <path d="M2 5.55537H5.75025L9.5005 1H5.59162L2 5.55537Z" fill="#E249F2"/>
            <path d="M13.2497 5.43665H17L13.4084 1H9.50049L13.2497 5.43665Z" fill="#F989FF"/>
            <path d="M12.9684 6.25871C13.8663 6.25871 13.8663 4.86197 12.9684 4.86197C12.0705 4.86197 12.0705 6.25871 12.9684 6.25871Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>

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

header {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--grey-color);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    max-width: 100%;
  }
}

h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.game-stats-header {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--grey-color);
  padding: var(--space-3) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 99;
}

.back-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: var(--grey-color);
  }

  &:focus-visible {
    outline: var(--focus-outline);
    outline-offset: 0.125rem;
  }
}

.level-display {
  flex: 1;
  display: flex;
  justify-content: flex-start;

  .level-text {
    background-color: var(--text-color);
    color: var(--bg-color);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: bold;
    letter-spacing: 0.5px;
    border: 2px solid var(--text-color);
  }
}

.level-text {
  background-color: var(--text-color);
  color: var(--bg-color);
  padding: var(--space-2) var(--space-4);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: bold;
  letter-spacing: 0.5px;
  border: 2px solid var(--text-color);
}

.stats-display {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-1);

  .stat-item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);

    .stat-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .stat-value {
      font-size: var(--font-size-base);
    }
  }
}

.theme-switch-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.game-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;

  &:focus {
    outline: none;
  }
}

// Responsive adjustments
@media (min-width: 768px) {
  header .header-content {
    padding: var(--space-4) var(--space-8);
  }

  .game-stats-header {
    padding: var(--space-3) var(--space-8);
  }

  .game-content {
    padding: var(--space-8);
  }
}
</style>