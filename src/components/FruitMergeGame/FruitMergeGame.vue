<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue"
import GameIcon from "../GameIcon/GameIcon.vue"
import GameStateManager from "../GameStateManager/GameStateManager.vue"
import LevelSelection from "../LevelSelection/LevelSelection.vue"
import GamePlayArea from "../GamePlayArea/GamePlayArea.vue"
import DebugPanel from "../DebugPanel/DebugPanel.vue"
import GameStatsHeader from "../GameStatsHeader/GameStatsHeader.vue"

// Emit events to parent component
const emit = defineEmits(['back-to-menu'])

// Component refs for accessing child components
const gameStateManager = ref(null)
const gamePlayArea = ref(null)

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

const handleDebugAddTestObjects = () => {
  if (gamePlayArea.value) {
    gamePlayArea.value.handleDebugAddTestObjects()
  }
}

const handleDebugClearObjects = () => {
  if (gamePlayArea.value) {
    gamePlayArea.value.handleDebugClearObjects()
  }
}

const handleDebugPhysicsInfo = () => {
  if (gamePlayArea.value) {
    gamePlayArea.value.handleDebugPhysicsInfo()
  }
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
}

const handleToggleAutoSimulation = (enabled) => {
  console.log(`🤖 Auto simulation ${enabled ? 'enabled' : 'disabled'}`)
  gameStateManager.value?.toggleAutoSimulation(enabled)
}

// GameStateManager Events
const handleLevelCompleted = (completionData) => {
  console.log('🎉 Level completed:', completionData)
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

const getPhysicsState = () => {
  return gamePlayArea.value?.getPhysicsState() || {}
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
        <header
          class="app__header"
          role="banner"
        >
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

        <!-- Game Stats Header (enhanced with session data) -->
        <GameStatsHeader
          v-if="!showLevelSelection"
          :current-level="currentLevel"
          :coins="coins"
          :diamonds="diamonds"
          :current-session="currentSession"
          :is-game-active="isGameActive"
          :formatted-game-time="formattedGameTime"
          :format-number="formatNumber"
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

          <!-- Game Play Area (focused on gameplay) -->
          <GamePlayArea
            v-else
            ref="gamePlayArea"
            :current-level="currentLevel"
            :current-session="currentSession"
            :is-game-active="isGameActive"
            :is-game-paused="isGamePaused"
            :formatted-game-time="formattedGameTime"
            :is-dev="isDev"
            @pause-game="handlePauseGame"
            @resume-game="handleResumeGame"
            @back-to-level-selection="handleBackToLevelSelection"
            @move-made="() => {}"
            @debug-add-test-objects="handleDebugAddTestObjects"
            @debug-clear-objects="handleDebugClearObjects"
            @debug-physics-info="handleDebugPhysicsInfo"
          />
        </main>

        <!-- Enhanced Debug Panel (DEV only) -->
        <DebugPanel
          :is-dev="isDev"
          :visible="true"
          :position="'bottom-right'"
          :stores="{
            levelStore: gameStateManager?.levelStore,
            currencyStore: gameStateManager?.currencyStore,
            sessionStore: gameStateManager?.sessionStore
          }"
          :current-level="currentLevel"
          :is-game-active="isGameActive"
          :is-game-paused="isGamePaused"
          :current-session="currentSession"
          :format-number="formatNumber"
          v-bind="getPhysicsState()"
          @unlock-all-levels="handleDebugUnlockAllLevels"
          @add-currency="handleDebugAddCurrencyCustom"
          @complete-current-level="handleDebugCompleteCurrentLevel"
          @reset-progress="handleDebugResetProgress"
          @export-data="handleDebugExportData"
          @import-data="handleDebugImportData"
          @toggle-auto-simulation="handleToggleAutoSimulation"
          @debug-add-test-objects="handleDebugAddTestObjects"
          @debug-clear-objects="handleDebugClearObjects"
          @debug-physics-info="handleDebugPhysicsInfo"
          @pause-game="handlePauseGame"
          @resume-game="handleResumeGame"
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