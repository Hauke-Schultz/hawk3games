<script setup>
import { ref } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue"
import GameIcon from "../GameIcon/GameIcon.vue"
import GameStateManager from "../GameStateManager/GameStateManager.vue"
import LevelSelection from "../LevelSelection/LevelSelection.vue"
import GamePlayArea from "../GamePlayArea/GamePlayArea.vue"
import DebugPanel from "../DebugPanel/DebugPanel.vue"

// Emit events to parent component
const emit = defineEmits(['back-to-menu'])

// Component refs for accessing child components
const gameStateManager = ref(null)

// Event handlers for child components
const handleBackClick = () => {
  const stateManager = gameStateManager.value
  if (stateManager?.showLevelSelection) {
    emit('back-to-menu')
  } else {
    stateManager?.finishCurrentLevel()
  }
}

// Level Selection Events
const handleLevelSelected = (level) => {
  gameStateManager.value?.startLevel(level)
}

const handleDebugUnlockAll = () => {
  gameStateManager.value?.debugUnlockAllLevels()
}

const handleDebugAddCurrency = () => {
  gameStateManager.value?.debugAddCurrency()
}

// Game Play Area Events
const handlePauseGame = () => {
  gameStateManager.value?.pauseGame()
}

const handleResumeGame = () => {
  gameStateManager.value?.resumeGame()
}

const handleBackToLevelSelection = () => {
  gameStateManager.value?.finishCurrentLevel()
}

const handleDebugCompleteLevel = () => {
  gameStateManager.value?.debugCompleteCurrentLevel()
}

// Debug Panel Events
const handleDebugUnlockAllLevels = () => {
  gameStateManager.value?.debugUnlockAllLevels()
}

const handleDebugAddCurrencyCustom = (amounts) => {
  gameStateManager.value?.debugAddCurrency(amounts.coins, amounts.diamonds)
}

const handleDebugCompleteCurrentLevel = () => {
  gameStateManager.value?.debugCompleteCurrentLevel()
}

const handleDebugResetProgress = () => {
  // This would need to be implemented in GameStateManager
  console.log('🔄 Reset progress requested')
}

const handleDebugExportData = () => {
  const stats = gameStateManager.value?.getStoreStatistics()
  if (stats) {
    const dataStr = JSON.stringify(stats, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hawk3games_debug_export.json'
    link.click()
    URL.revokeObjectURL(url)
  }
}

const handleDebugImportData = (data) => {
  console.log('📥 Import data requested:', data)
  // Import logic would be implemented here
}

const handleToggleAutoSimulation = (enabled) => {
  console.log(`🤖 Auto simulation ${enabled ? 'enabled' : 'disabled'}`)
  // Auto simulation logic would be implemented here
}

// GameStateManager Events
const handleLevelCompleted = (completionData) => {
  console.log('🎉 Level completed:', completionData)
  // Could show completion modal, confetti, etc.
}

const handleSessionStarted = (sessionData) => {
  console.log('🎮 Session started:', sessionData)
}

const handleSessionEnded = (sessionData) => {
  console.log('⏹️ Session ended:', sessionData)
}

const handleStoresReady = (stores) => {
  console.log('✅ Stores ready:', Object.keys(stores))
}
</script>

<template>
  <div class="fruit-merge-game">
    <!-- Game State Manager - Central store management -->
    <GameStateManager
      ref="gameStateManager"
      :auto-start-simulation="true"
      :enable-debug-mode="true"
      @level-completed="handleLevelCompleted"
      @session-started="handleSessionStarted"
      @session-ended="handleSessionEnded"
      @stores-ready="handleStoresReady"
    >
      <!-- Slot content with all game state -->
      <template #default="{
        levels,
        coins,
        diamonds,
        currentLevel,
        currentLevelPadded,
        isGameActive,
        isGamePaused,
        formattedGameTime,
        currentSession,
        showLevelSelection,
        isDev,
        formatNumber
      }">

        <!-- Game Header -->
        <header class="app__header" role="banner">
          <div class="app__header-content">
            <button
              class="btn btn--circle"
              @click="handleBackClick"
              :aria-label="showLevelSelection ? 'Back to menu' : 'Back to level selection'"
            >
              <GameIcon name="back-arrow" :size="20" />
            </button>
            <h1 class="app__title">FruitMerge</h1>
            <div class="app__theme-switch">
              <ThemeSwitch />
            </div>
          </div>
        </header>

        <!-- Game Stats Header (only show when playing) -->
        <div v-if="!showLevelSelection" class="fruit-merge-game__stats">
          <!-- Level Display -->
          <div class="fruit-merge-game__level-display">
            <span class="fruit-merge-game__level-text">LEVEL {{ currentLevelPadded }}</span>
            <span v-if="isGameActive" class="fruit-merge-game__time-display">{{ formattedGameTime }}</span>
          </div>

          <!-- Stats Display -->
          <div class="fruit-merge-game__stats-container">
            <div class="fruit-merge-game__stat fruit-merge-game__stat--coins">
              <span class="fruit-merge-game__stat-value">{{ formatNumber(coins) }}</span>
              <GameIcon name="coin" :size="16" class="fruit-merge-game__stat-icon" />
            </div>
            <div class="fruit-merge-game__stat fruit-merge-game__stat--diamonds">
              <span class="fruit-merge-game__stat-value">{{ formatNumber(diamonds) }}</span>
              <GameIcon name="diamond" :size="19" class="fruit-merge-game__stat-icon" />
            </div>
          </div>
        </div>

        <!-- Game Session Info (when active) -->
        <div v-if="isGameActive && !showLevelSelection" class="fruit-merge-game__session-info">
          <div class="fruit-merge-game__session-stats">
            <span class="fruit-merge-game__session-stat">
              🎯 {{ currentSession.moves }} moves
            </span>
            <span class="fruit-merge-game__session-stat">
              📊 {{ formatNumber(currentSession.score) }} points
            </span>
            <span v-if="currentSession.combo > 1" class="fruit-merge-game__session-stat fruit-merge-game__session-stat--combo">
              🔥 {{ currentSession.combo }}x combo
            </span>
          </div>
          <div class="fruit-merge-game__session-controls">
            <button
              v-if="!isGamePaused"
              @click="handlePauseGame"
              class="btn btn--small btn--ghost"
            >
              ⏸️ Pause
            </button>
            <button
              v-else
              @click="handleResumeGame"
              class="btn btn--small"
            >
              ▶️ Resume
            </button>
          </div>
        </div>

        <!-- Main Game Content -->
        <main class="app__main fruit-merge-game__content">
          <!-- Level Selection Screen -->
          <LevelSelection
            v-if="showLevelSelection"
            :levels="levels"
            :is-dev="isDev"
            :show-debug-controls="true"
            @level-selected="handleLevelSelected"
            @debug-unlock-all="handleDebugUnlockAll"
            @debug-add-currency="handleDebugAddCurrency"
          />

          <!-- Game Play Area -->
          <GamePlayArea
            v-else
            :current-level="currentLevel"
            :current-session="currentSession"
            :is-game-active="isGameActive"
            :is-game-paused="isGamePaused"
            :formatted-game-time="formattedGameTime"
            :is-dev="isDev"
            @pause-game="handlePauseGame"
            @resume-game="handleResumeGame"
            @back-to-level-selection="handleBackToLevelSelection"
            @debug-complete-level="handleDebugCompleteLevel"
          />
        </main>

        <!-- Debug Panel (DEV only) -->
        <DebugPanel
          :is-dev="isDev"
          :visible="true"
          :position="'bottom-right'"
          :stores="{ levelStore: gameStateManager?.levelStore, currencyStore: gameStateManager?.currencyStore, sessionStore: gameStateManager?.sessionStore }"
          :current-level="currentLevel"
          :is-game-active="isGameActive"
          @unlock-all-levels="handleDebugUnlockAllLevels"
          @add-currency="handleDebugAddCurrencyCustom"
          @complete-current-level="handleDebugCompleteCurrentLevel"
          @reset-progress="handleDebugResetProgress"
          @export-data="handleDebugExportData"
          @import-data="handleDebugImportData"
          @toggle-auto-simulation="handleToggleAutoSimulation"
        />

      </template>
    </GameStateManager>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Fruit Merge Game Block - Main container
.fruit-merge-game {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);

  // Stats Element
  &__stats {
    background-color: var(--card-bg);
    padding: var(--space-3) var(--space-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--card-border);
  }

  &__level-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: var(--space-1);
  }

  &__level-text {
    background-color: var(--accent-color);
    color: var(--white);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: bold;
    letter-spacing: 0.5px;
    align-self: flex-start;
  }

  &__time-display {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: 500;
  }

  &__stats-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__stat {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);
  }

  &__stat-value {
    font-size: var(--font-size-base);
  }

  &__stat-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  // Session Info Element
  &__session-info {
    background-color: var(--bg-secondary);
    padding: var(--space-2) var(--space-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--card-border);
    font-size: var(--font-size-sm);
  }

  &__session-stats {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  &__session-stat {
    color: var(--text-secondary);

    &--combo {
      color: var(--accent-color);
      font-weight: bold;
    }
  }

  &__session-controls {
    display: flex;
    gap: var(--space-2);
  }

  // Content Element
  &__content {
    flex: 1;
    overflow-y: auto;
  }
}

// Responsive adjustments
@media (min-width: vars.$breakpoint-md) {
  .fruit-merge-game {
    &__session-info {
      padding: var(--space-3) var(--space-8);
    }

    &__session-stats {
      gap: var(--space-6);
    }
  }
}

// Animation for session stats
.fruit-merge-game__session-stat--combo {
  animation: pulse-combo 0.5s ease-in-out;
}

@keyframes pulse-combo {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>