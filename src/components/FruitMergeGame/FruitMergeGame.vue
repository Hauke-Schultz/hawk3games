<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue";

// Game state
const gameContainer = ref(null)
const gameRunning = ref(false)
const showLevelSelection = ref(true) // Show level selection by default

// Game stats (placeholder values)
const currentLevel = ref(1)
const coins = ref(1251)
const diamonds = ref(251)

// Level configuration - 9 levels total
const levels = ref([
  { id: 1, unlocked: true, completed: false, stars: 0 },
  { id: 2, unlocked: false, completed: false, stars: 0 },
  { id: 3, unlocked: false, completed: false, stars: 0 },
  { id: 4, unlocked: false, completed: false, stars: 0 },
  { id: 5, unlocked: false, completed: false, stars: 0 },
  { id: 6, unlocked: false, completed: false, stars: 0 },
  { id: 7, unlocked: false, completed: false, stars: 0 },
  { id: 8, unlocked: false, completed: false, stars: 0 },
  { id: 9, unlocked: false, completed: false, stars: 0 }
])

// Game configuration
const CONTAINER_WIDTH = 280
const CONTAINER_HEIGHT = 400
const CONTAINER_BORDER = 4

// Level selection functions
const selectLevel = (level) => {
  if (level.unlocked) {
    currentLevel.value = level.id
    showLevelSelection.value = false
    startGame()
  }
}

const showLevelSelect = () => {
  showLevelSelection.value = true
  gameRunning.value = false
}

// Game functions
const startGame = () => {
  gameRunning.value = true
  console.log(`FruitMerge game started on level ${currentLevel.value}!`)
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
  if (showLevelSelection.value) {
    emit('back-to-menu')
  } else {
    showLevelSelect()
  }
}

// Format numbers for display
const formatNumber = (num) => {
  return num.toString()
}

// Get level button class based on state
const getLevelButtonClass = (level) => {
  return {
    'level-button': true,
    'unlocked': level.unlocked,
    'locked': !level.unlocked,
    'completed': level.completed
  }
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

    <!-- Game Stats Header (only show when not in level selection) -->
    <div v-if="showLevelSelection">
      <main class="game-content">
        <h2 class="level-selection-headline">
          Select a Level
        </h2>
        <!-- Level Selection Screen -->
        <div v-if="showLevelSelection" class="level-selection"> <!-- Level Display -->

          <div class="level-selection-container">
            <div class="levels-grid">
              <button
                  v-for="level in levels"
                  :key="level.id"
                  :class="getLevelButtonClass(level)"
                  @click="selectLevel(level)"
                  :disabled="!level.unlocked"
                  :aria-label="`Level ${level.id}${level.unlocked ? '' : ' (locked)'}`"
              >
                <!-- Lock icon for locked levels -->
                <div v-if="!level.unlocked" class="lock-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>

                <!-- Level number for unlocked levels -->
                <div v-else class="level-number">
                  {{ level.id }}
                </div>

                <!-- Stars for completed levels -->
                <div v-if="level.completed" class="level-stars">
                  <div class="stars">
                  <span v-for="star in 3" :key="star" class="star" :class="{ 'filled': star <= level.stars }">
                    ⭐
                  </span>
                  </div>
                </div>

                <!-- Play button for level 1 -->
                <div v-if="level.id === 1 && level.unlocked" class="play-button">
                  PLAY
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div v-else>
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
      <div class="game-play-area">
        <!-- Game content will be implemented here later -->
        <div class="game-placeholder">
          <p>Game Level {{ currentLevel }} will be implemented here</p>
          <button class="btn" @click="showLevelSelect">Back to Level Selection</button>
        </div>
      </div>
    </div>
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

.game-stats-header {
  background-color: var(--card-bg);
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
    background-color: var(--accent-color);
    color: var(--text-color);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: bold;
    letter-spacing: 0.5px;
    border: 2px solid var(--accent-color);
  }
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
  padding: var(--space-8);
  overflow-y: auto;

  &:focus {
    outline: none;
  }
}

// Level Selection Styles
.level-selection {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.level-selection-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--border-radius-xl);
  padding: var(--space-6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  justify-items: center;
}

.level-button {
  width: 100px;
  height: 100px;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  font-weight: bold;
  font-size: var(--font-size-lg);

  &.unlocked {
    background: linear-gradient(45deg, #00b894, #00cec9);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 184, 148, 0.5);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.locked {
    background: rgba(178, 190, 195, 0.3);
    color: var(--grey-color);
    cursor: not-allowed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: none;
    }
  }

  &.completed {
    background: linear-gradient(45deg, #fdcb6e, #f39c12);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(243, 156, 18, 0.5);
    }
  }

  // Special styling for Level 1 with PLAY button
  &:first-child.unlocked {
    background: linear-gradient(45deg, #e84393, #fd79a8);

    .play-button {
      position: absolute;
      bottom: -8px;
      background: #e84393;
      color: white;
      padding: var(--space-1) var(--space-2);
      border-radius: 12px;
      font-size: var(--font-size-xs);
      font-weight: bold;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(232, 67, 147, 0.4);
    }

    &:hover {
      box-shadow: 0 6px 20px rgba(232, 67, 147, 0.5);
    }
  }
}

.lock-icon {
  opacity: 0.6;

  svg {
    width: 32px;
    height: 32px;
  }
}

.level-number {
  font-size: var(--font-size-2xl);
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.level-stars {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    font-size: 12px;
    opacity: 0.3;

    &.filled {
      opacity: 1;
    }
  }
}

// Game Play Area
.game-play-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.game-placeholder {
  text-align: center;
  background-color: var(--card-bg);
  padding: var(--space-8);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--card-shadow);

  p {
    margin-bottom: var(--space-4);
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }
}

// Dark theme adjustments
[data-theme="dark"] {
  .level-selection-container {
    background: linear-gradient(135deg, #0b0b0b 0%, #323232 100%);
  }

  .level-button.locked {
    background: rgba(99, 110, 114, 0.3);
  }
}
</style>