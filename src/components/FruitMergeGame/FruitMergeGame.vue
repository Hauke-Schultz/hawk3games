<script setup>
import { ref } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue"
import GameIcon from "../GameIcon/GameIcon.vue"
import GameStateManager from "../GameStateManager/GameStateManager.vue"
import LevelSelection from "../LevelSelection/LevelSelection.vue"
import GamePlayArea from "../GamePlayArea/GamePlayArea.vue"
import DebugPanel from "../DebugPanel/DebugPanel.vue"
import GameStatsHeader from "../GameStatsHeader/GameStatsHeader.vue"
import SessionInfoBar from "../SessionInfoBar/SessionInfoBar.vue"
import GameControls from "../GameControls/GameControls.vue"

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
  gameStateManager.value?.toggleAutoSimulation(enabled)
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
      :auto-start-simulation="false"
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
        <GameStatsHeader
          v-if="!showLevelSelection"
          :current-level="currentLevel"
          :coins="coins"
          :diamonds="diamonds"
          :is-game-active="isGameActive"
          :formatted-game-time="formattedGameTime"
          :format-number="formatNumber"
        />

        <!-- Session Info Bar (when active) -->
        <SessionInfoBar
          v-if="(isGameActive || isGamePaused) && !showLevelSelection"
          :current-session="currentSession"
          :is-game-active="isGameActive"
          :is-game-paused="isGamePaused"
          :format-number="formatNumber"
          @pause-game="handlePauseGame"
          @resume-game="handleResumeGame"
        />

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

        <!-- Game Controls (only show when not in level selection) -->
        <GameControls
          v-if="!showLevelSelection"
          :is-game-active="isGameActive"
          :is-game-paused="isGamePaused"
          :current-level="currentLevel"
          :is-dev="isDev"
          :show-back-button="true"
          :show-debug-controls="true"
          @back-to-level-selection="handleBackToLevelSelection"
          @pause-game="handlePauseGame"
          @resume-game="handleResumeGame"
          @debug-complete-level="handleDebugCompleteLevel"
        />

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

  // Content Element
  &__content {
    flex: 1;
    overflow-y: auto;
  }
}

// Responsive adjustments
@media (min-width: vars.$breakpoint-md) {
  .fruit-merge-game {
    // Additional desktop-specific styling if needed
  }
}
</style>