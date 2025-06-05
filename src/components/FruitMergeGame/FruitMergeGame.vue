<script setup>
import { ref } from 'vue'
import GameStateManager from "../GameStateManager/GameStateManager.vue"
import LevelSelection from "../LevelSelection/LevelSelection.vue"
import GamePlayArea from "../GamePlayArea/GamePlayArea.vue"
import GameStatsHeader from "../GameStatsHeader/GameStatsHeader.vue"

// Simplified props - navigation handled globally
const props = defineProps({
  showLevelSelection: {
    type: Boolean,
    default: true
  }
})

// Simplified events - navigation handled globally
const emit = defineEmits([
  'level-selected',
  'back-to-menu',
  'back-to-levels',
  'start-next-level'
])

// Component refs
const gameStateManager = ref(null)
const gamePlayArea = ref(null)
const currentComboMessage = ref(null)

// Simplified event handlers
const handleLevelSelected = (level) => {
  gameStateManager.value?.startLevel(level)
  emit('level-selected', level)
}

const handlePauseGame = () => {
  gameStateManager.value?.pauseGame()
}

const handleResumeGame = () => {
  gameStateManager.value?.resumeGame()
}

const handleBackToLevelSelection = () => {
  gameStateManager.value?.finishCurrentLevel()
  emit('back-to-levels')
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
  const stateManager = gameStateManager.value
  if (stateManager && stateManager.sessionStore) {
    stateManager.sessionStore.incrementMoves()
    console.log(`🎯 Move incremented via GameStateManager`)
  }
}

const handleScoreUpdate = (points) => {
  const stateManager = gameStateManager.value
  if (stateManager && stateManager.sessionStore) {
    stateManager.sessionStore.addToScore(points)
    console.log(`📊 Score updated: +${points} points`)
  }
}

const handleComboMessage = (comboData) => {
  if (comboData === null) {
    currentComboMessage.value = null
    console.log('🔥 Combo message cleared (combo reset)')
    return
  }

  currentComboMessage.value = comboData
  console.log('🔥 Combo message received:', comboData.message)

  // Auto-clear message nach duration (bleibt als Fallback)
  setTimeout(() => {
    if (currentComboMessage.value === comboData) {
      currentComboMessage.value = null
    }
  }, comboData.duration)
}

const handleGameOver = (gameOverData) => {
  console.log('💀 Game Over received:', gameOverData)

  // Update session store
  const stateManager = gameStateManager.value
  if (stateManager && stateManager.sessionStore) {
    stateManager.sessionStore.completeSession(gameOverData.finalScore, false)
  }
}

const handleStartNextLevel = (levelId) => {
  console.log(`🚀 Starting next level: ${levelId}`)

  // Reset current game state
  gameStateManager.value?.finishCurrentLevel()

  // Start new level
  setTimeout(() => {
    const nextLevel = levels.value.find(l => l.id === levelId)
    if (nextLevel && nextLevel.unlocked) {
      handleLevelSelected(nextLevel)
    } else {
      console.warn(`Next level ${levelId} is not available or unlocked`)
      // Fallback to level selection
      emit('back-to-levels')
    }
  }, 300) // Kurze Verzögerung für sauberen Übergang
}
</script>

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
        isDev,
        formatNumber
      }">

        <!-- Game Stats Header (only when playing) -->
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
          :is-game-over="currentSession?.status === 'game_over'"
          :format-number="formatNumber"
          :combo-time-left="gamePlayArea?.comboState?.comboTimeLeft || 0"
          :combo-reset-delay="gamePlayArea?.comboState?.resetDelay || 6000"
          :combo-message="currentComboMessage"
          :on-back-to-levels="handleBackToLevelSelection"
        />

        <!-- Main Game Content -->
        <div class="fruit-merge-game__content">
          <!-- Level Selection Screen -->
          <LevelSelection
            v-if="showLevelSelection"
            :levels="levels"
            :is-dev="isDev"
            @level-selected="handleLevelSelected"
          />

          <!-- Game Play Area -->
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
            @combo-message="handleComboMessage"
            @game-over="handleGameOver"
            @start-next-level="handleStartNextLevel"
          />
        </div>
      </template>
    </GameStateManager>
  </div>
</template>

<style scoped lang="scss">
// Fruit Merge Game Block - MUCH SIMPLER
.fruit-merge-game {
  display: flex;
  flex-direction: column;
  height: 100%;

  // Content Element
  &__content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>