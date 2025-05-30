<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue"
import GameIcon from "../GameIcon/GameIcon.vue"
import GameStateManager from "../GameStateManager/GameStateManager.vue"
import LevelSelection from "../LevelSelection/LevelSelection.vue"
import GamePlayArea from "../GamePlayArea/GamePlayArea.vue"
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

const handleMoveaMade = () => {
  // Update session store
  const stateManager = gameStateManager.value
  if (stateManager && stateManager.sessionStore) {
    stateManager.sessionStore.incrementMoves()
    console.log(`🎯 Move incremented via GameStateManager`)
  }
}

const handleScoreUpdate = (points) => {
  // Update session store
  const stateManager = gameStateManager.value
  if (stateManager && stateManager.sessionStore) {
    stateManager.sessionStore.addToScore(points)
    console.log(`📊 Score updated: +${points} points`)
  }
}

// Enhanced Combo State Management
const comboState = ref({
  current: 0,
  maxThisSession: 0,
  lastMergeTime: null,
  timeoutId: null,
  resetDelay: 4000, // 4 seconds
  comboTimeLeft: 0,
  comboTimerInterval: null
})

const getComboLevelName = (combo) => {
  if (combo >= 10) return 'MEGA'
  if (combo >= 7) return 'EPIC'
  if (combo >= 5) return 'FIRE'
  if (combo >= 3) return 'HOT'
  if (combo >= 2) return 'WARM'
  return 'NORMAL'
}

// Enhanced physics state getter mit combo data
const getPhysicsState = () => {
  const baseState = gamePlayArea.value?.getPhysicsState() || {}
  return {
    ...baseState,
    // Get combo data directly from GamePlayArea's comboState
    combo: baseState.combo || 0,
    maxCombo: baseState.maxCombo || 0,
    comboTimeLeft: baseState.comboTimeLeft || 0
  }
}</script>

<template>
  <div class="fruit-merge-game">
    <!-- Game State Manager - Central store management -->
    <GameStateManager
      ref="gameStateManager"
      :auto-start-simulation="false"
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
        isGameActive,
        isGamePaused,
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
          :current-session="{
            ...currentSession,
            combo: gamePlayArea?.comboState?.current || currentSession?.combo || 0
          }"
          :is-game-active="isGameActive"
          :format-number="formatNumber"
          :combo-time-left="gamePlayArea?.comboState?.comboTimeLeft || 0"
          :combo-reset-delay="gamePlayArea?.comboState?.resetDelay || 6000"
        />

        <!-- Main Game Content -->
        <main class="app__main fruit-merge-game__content">
          <!-- Level Selection Screen -->
          <LevelSelection
            v-if="showLevelSelection"
            :levels="levels"
            :is-dev="isDev"
            @level-selected="handleLevelSelected"
          />

          <!-- Game Play Area (focused on gameplay) -->
          <GamePlayArea
            v-else
            ref="gamePlayArea"
            :current-level="currentLevel"
            :current-session="currentSession"
            :is-game-active="isGameActive"
            :is-game-paused="isGamePaused"
            :is-dev="isDev"
            @pause-game="handlePauseGame"
            @resume-game="handleResumeGame"
            @back-to-level-selection="handleBackToLevelSelection"
            @move-made="handleMoveaMade"
            @score-update="handleScoreUpdate"
          />
        </main>
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