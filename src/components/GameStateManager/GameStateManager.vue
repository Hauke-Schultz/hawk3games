<script setup>
import { ref, onMounted, onUnmounted, computed, provide } from 'vue'
import { storeToRefs } from 'pinia'
import { useLevelStore, useCurrencyStore, useSessionStore } from '../../stores/index.js'

// Props for configuration
const props = defineProps({
  autoStartSimulation: {
    type: Boolean,
    default: false
  },
  enableDebugMode: {
    type: Boolean,
    default: false
  }
})

// Events emitted to parent component
const emit = defineEmits([
  'level-completed',
  'session-started',
  'session-ended',
  'stores-ready'
])

// Store instances
const levelStore = useLevelStore()
const currencyStore = useCurrencyStore()
const sessionStore = useSessionStore()

// Reactive store state
const {
  currentLevel,
  levelConfigurations,
  unlockedLevels,
  completedLevels,
  levelStars
} = storeToRefs(levelStore)

const { coins, diamonds } = storeToRefs(currencyStore)

const {
  isGameActive,
  isGamePaused,
  formattedGameTime,
  currentSession
} = storeToRefs(sessionStore)

// Local state for game management
const gameContainer = ref(null)
const showLevelSelection = ref(true)

// Auto-simulation control
const autoSimulationEnabled = ref(false)
let simulationInterval = null

// Computed level data for display
const levels = computed(() => {
  return levelConfigurations.value.map(level => ({
    ...level,
    unlocked: levelStore.isLevelUnlocked(level.id),
    completed: levelStore.isLevelCompleted(level.id),
    stars: levelStore.getLevelStars(level.id)
  }))
})

// Computed properties for easier access
const currentLevelPadded = computed(() => {
  return currentLevel.value.toString().padStart(2, '0')
})

const isDev = computed(() => import.meta.env.DEV)

// Core game management functions
const startLevel = (level) => {
  if (!level.unlocked) {
    console.warn(`Level ${level.id} is locked`)
    return false
  }

  console.log(`🎮 Starting level ${level.id} via GameStateManager`)

  // Update stores
  levelStore.startLevel(level.id)
  sessionStore.startNewSession(level.id)

  // Update local state
  showLevelSelection.value = false

  // Emit event to parent
  emit('session-started', {
    levelId: level.id,
    level: level
  })

  // Start actual game logic
  startGameLogic()

  return true
}

const finishCurrentLevel = () => {
  // Stop any running simulation
  stopSimulation()

  // End current session if active
  if (isGameActive.value || isGamePaused.value) {
    sessionStore.abortSession()
    levelStore.finishLevel()
  }

  showLevelSelection.value = true

  emit('session-ended', {
    levelId: currentLevel.value
  })
}

const pauseGame = () => {
  if (sessionStore.pauseSession()) {
    // Pause simulation if running
    if (simulationInterval) {
      clearInterval(simulationInterval)
      simulationInterval = null
    }
    console.log('🎮 Game paused via GameStateManager')
    return true
  }
  return false
}

const resumeGame = () => {
  if (sessionStore.resumeSession()) {
    // Resume simulation if it was enabled
    if (autoSimulationEnabled.value && !simulationInterval) {
      startSimulation()
    }
    console.log('🎮 Game resumed via GameStateManager')
    return true
  }
  return false
}

// Game logic functions
const startGameLogic = () => {
  console.log(`🎯 Game logic started for level ${currentLevel.value}`)

  // Initialize game state
  sessionStore.updateScore(0)
  sessionStore.updateMoves(0)

  // Start simulation only if enabled and in DEV mode
  if (autoSimulationEnabled.value && import.meta.env.DEV) {
    startSimulation()
  }
}

const startSimulation = () => {
  if (!import.meta.env.DEV || !autoSimulationEnabled.value) {
    return
  }

  console.log('🤖 Starting auto-simulation (DEV mode)')

  // Stop any existing simulation
  stopSimulation()

  // Simulate some moves and score over time
  let moveCount = 0
  let score = 0

  simulationInterval = setInterval(() => {
    if (!isGameActive.value) {
      stopSimulation()
      return
    }

    moveCount++
    score += Math.floor(Math.random() * 100) + 50

    sessionStore.updateMoves(moveCount)
    sessionStore.updateScore(score)

    // Simulate combo occasionally
    if (Math.random() > 0.7) {
      const combo = Math.floor(Math.random() * 5) + 2
      sessionStore.updateCombo(combo)
    } else {
      sessionStore.resetCombo()
    }

    // End simulation after 10 moves
    if (moveCount >= 10) {
      stopSimulation()
      completeLevel(score, moveCount)
    }
  }, 2000) // Every 2 seconds
}

const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
    console.log('🤖 Auto-simulation stopped')
  }
}

const toggleAutoSimulation = (enabled) => {
  autoSimulationEnabled.value = enabled
  console.log(`🤖 Auto-simulation ${enabled ? 'enabled' : 'disabled'}`)

  if (enabled && isGameActive.value && import.meta.env.DEV) {
    startSimulation()
  } else {
    stopSimulation()
  }
}

const completeLevel = (finalScore, totalMoves) => {
  const currentLevelId = currentLevel.value

  // Stop simulation
  stopSimulation()

  // Calculate stars based on performance (simple logic)
  let stars = 1
  if (finalScore > 800) stars = 2
  if (finalScore > 1200) stars = 3

  console.log(`🎉 Level ${currentLevelId} completed! Score: ${finalScore}, Stars: ${stars}`)

  // Complete session
  sessionStore.completeSession(finalScore, true)

  // Complete level in level store
  levelStore.completeLevel(currentLevelId, stars, finalScore, sessionStore.gameElapsedTime)

  // Award currency
  const rewards = currencyStore.rewardForLevel(currentLevelId, stars)
  console.log(`💰 Rewards: ${rewards.coins} coins, ${rewards.diamonds} diamonds`)

  // Finish level
  levelStore.finishLevel()

  // Emit completion event
  emit('level-completed', {
    levelId: currentLevelId,
    stars: stars,
    score: finalScore,
    moves: totalMoves,
    rewards: rewards
  })

  // Show completion message (could be a modal in real implementation)
  setTimeout(() => {
    alert(`Level ${currentLevelId} Complete!\n⭐ ${stars} stars\n💰 +${rewards.coins} coins\n💎 +${rewards.diamonds} diamonds`)
    finishCurrentLevel()
  }, 1000)
}

// Store statistics and info functions
const getStoreStatistics = () => {
  return {
    levels: levelStore.getLevelStatistics(),
    currency: currencyStore.getCurrencyStatistics(),
    sessions: sessionStore.getSessionStatistics()
  }
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return `${Math.floor(num / 100) / 10}k`
  }
  return num.toString()
}

// Debug functions (DEV only)
const debugUnlockAllLevels = () => {
  if (import.meta.env.DEV) {
    levelStore.unlockAllLevels()
    console.log('🔓 All levels unlocked (DEBUG)')
    return true
  }
  return false
}

const debugAddCurrency = (coinAmount = 1000, diamondAmount = 100) => {
  if (import.meta.env.DEV) {
    currencyStore.addCheatCurrency(coinAmount, diamondAmount)
    console.log('💰 Added cheat currency (DEBUG)')
    return true
  }
  return false
}

const debugCompleteCurrentLevel = () => {
  if (import.meta.env.DEV && isGameActive.value) {
    completeLevel(1500, 8)
    return true
  }
  return false
}

// Lifecycle management
onMounted(() => {
  console.log('🎮 GameStateManager mounted with store integration')

  // Initialize auto-simulation state from props (but don't start it)
  autoSimulationEnabled.value = props.autoStartSimulation

  // Load saved state if available
  if (currentLevel.value > 1 && !showLevelSelection.value) {
    console.log('📖 Restoring previous game state')
    // Could restore to previous level or session here
  }

  // Emit stores ready event
  emit('stores-ready', {
    levelStore,
    currencyStore,
    sessionStore
  })

  // Expose debug functions to window in development
  if (props.enableDebugMode && import.meta.env.DEV) {
    window.gameStateManagerDebug = {
      unlockAllLevels: debugUnlockAllLevels,
      addCurrency: debugAddCurrency,
      completeCurrentLevel: debugCompleteCurrentLevel,
      toggleAutoSimulation: toggleAutoSimulation,
      getStatistics: getStoreStatistics,
      stores: { levelStore, currencyStore, sessionStore }
    }
    console.log('🛠️ Debug functions available at window.gameStateManagerDebug')
  }
})

onUnmounted(() => {
  // Stop any running simulation
  stopSimulation()

  // Clean up any active sessions
  if (isGameActive.value || isGamePaused.value) {
    sessionStore.abortSession()
    levelStore.finishLevel()
  }

  // Clean up debug functions
  if (typeof window !== 'undefined' && window.gameStateManagerDebug) {
    delete window.gameStateManagerDebug
  }
})

// Provide store access to child components
provide('levelStore', levelStore)
provide('currencyStore', currencyStore)
provide('sessionStore', sessionStore)
provide('gameStateManager', {
  startLevel,
  finishCurrentLevel,
  pauseGame,
  resumeGame,
  completeLevel,
  debugUnlockAllLevels,
  debugAddCurrency,
  debugCompleteCurrentLevel,
  toggleAutoSimulation,
  getStoreStatistics,
  formatNumber
})

// Expose reactive state and functions for parent component
defineExpose({
  // Reactive state
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
  autoSimulationEnabled,

  // Functions
  startLevel,
  finishCurrentLevel,
  pauseGame,
  resumeGame,
  completeLevel,
  debugUnlockAllLevels,
  debugAddCurrency,
  debugCompleteCurrentLevel,
  toggleAutoSimulation,
  getStoreStatistics,
  formatNumber,

  // Store instances (for advanced usage)
  levelStore,
  currencyStore,
  sessionStore
})
</script>

<template>
  <!-- GameStateManager is primarily a logic component -->
  <!-- It renders its slot content and provides store management -->
  <div class="game-state-manager">
    <slot
      :levels="levels"
      :coins="coins"
      :diamonds="diamonds"
      :current-level="currentLevel"
      :current-level-padded="currentLevelPadded"
      :is-game-active="isGameActive"
      :is-game-paused="isGamePaused"
      :formatted-game-time="formattedGameTime"
      :current-session="currentSession"
      :show-level-selection="showLevelSelection"
      :is-dev="isDev"
      :auto-simulation-enabled="autoSimulationEnabled"
      :start-level="startLevel"
      :finish-current-level="finishCurrentLevel"
      :pause-game="pauseGame"
      :resume-game="resumeGame"
      :complete-level="completeLevel"
      :debug-unlock-all-levels="debugUnlockAllLevels"
      :debug-add-currency="debugAddCurrency"
      :debug-complete-current-level="debugCompleteCurrentLevel"
      :toggle-auto-simulation="toggleAutoSimulation"
      :format-number="formatNumber"
      :get-store-statistics="getStoreStatistics"
    />
  </div>
</template>

<style scoped lang="scss">
// GameStateManager is primarily a logic component
// Minimal styling required
.game-state-manager {
  width: 100%;
  height: 100%;
}
</style>