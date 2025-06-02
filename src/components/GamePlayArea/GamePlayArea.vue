<script setup>
import {computed, ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import { useSessionStore } from '../../stores/index.js'
import { useSettingsStore } from '../../stores/settingsStore.js'
import Matter from 'matter-js'
import {storeToRefs} from "pinia";

// Props for game state and session data
const props = defineProps({
  currentLevel: {
    type: Number,
    required: true
  },
  currentSession: {
    type: Object,
    required: true,
    validator: (session) => {
      return session && typeof session.score === 'number' && typeof session.moves === 'number'
    }
  },
  isGameActive: {
    type: Boolean,
    default: false
  },
  isGamePaused: {
    type: Boolean,
    default: false
  },
  formattedGameTime: {
    type: String,
    default: '00:00'
  },
  isDev: {
    type: Boolean,
    default: false
  }
})

// Physics configuration
const PHYSICS_CONFIG = {
  canvas: {
    width: 300,
    height: 400
  },
  dropZone: {
    minX: 25,
    maxX: 275,
    dropY: 50
  },
  dropCooldown: 500, // Milliseconds between drops
  gameOverHeight: 100, // Height at which game is over
  warningZone: 30
}

// Fruit Configuration System
const FRUIT_TYPES = {
  BLUEBERRY: {
    id: 1,
    emoji: '🫐',
    radius: 15,
    nextType: 'STRAWBERRY',
    color: '#4c6ef5',
    scoreValue: 10,
    gradient: ['#748ffc', '#4c6ef5', '#364fc7'],
    shadow: '0 2px 8px rgba(54, 79, 199, 0.4)',
    glowColor: 'rgba(76, 110, 245, 0.6)',
    sparkleColor: '#c5dbff',
    svg: `src/assets/icons/fruits/blueberry.svg`
  },
  STRAWBERRY: {
    id: 2,
    emoji: '🍓',
    radius: 20,
    nextType: 'GRAPE',
    color: '#ff8787',
    scoreValue: 25,
    gradient: ['#ffab91', '#ff8787', '#f4511e'],
    shadow: '0 2px 8px rgba(244, 81, 30, 0.4)',
    glowColor: 'rgba(255, 135, 135, 0.6)',
    sparkleColor: '#ffccbc',
    svg: `src/assets/icons/fruits/strawberry.svg`
  },
  GRAPE: {
    id: 3,
    emoji: '🍇',
    radius: 24,
    nextType: 'ORANGE',
    color: '#845ec2',
    scoreValue: 50,
    gradient: ['#b39ddb', '#845ec2', '#5e35b1'],
    shadow: '0 2px 8px rgba(94, 53, 177, 0.4)',
    glowColor: 'rgba(132, 94, 194, 0.6)',
    sparkleColor: '#d1c4e9',
    svg: `src/assets/icons/fruits/grape.svg`
  },
  ORANGE: {
    id: 4,
    emoji: '🍊',
    radius: 30,
    nextType: 'APPLE',
    color: '#ffa726',
    scoreValue: 100,
    gradient: ['#ffcc02', '#ffa726', '#ff9800'],
    shadow: '0 2px 8px rgba(255, 152, 0, 0.4)',
    glowColor: 'rgba(255, 167, 38, 0.6)',
    sparkleColor: '#ffe0b2',
    svg: `src/assets/icons/fruits/orange.svg`
  },
  APPLE: {
    id: 5,
    emoji: '🍎',
    radius: 40,
    nextType: 'PEACH',
    color: '#e53e3e',
    scoreValue: 200,
    gradient: ['#ef5350', '#e53e3e', '#c62828'],
    shadow: '0 3px 12px rgba(198, 40, 40, 0.5)',
    glowColor: 'rgba(229, 62, 62, 0.7)',
    sparkleColor: '#ffcdd2',
    svg: `src/assets/icons/fruits/apple.svg`
  },
  PEACH: {
    id: 6,
    emoji: '🍑',
    radius: 52,
    nextType: 'PINEAPPLE',
    color: '#ff7043',
    scoreValue: 400,
    gradient: ['#ffab91', '#ff7043', '#d84315'],
    shadow: '0 3px 12px rgba(216, 158, 46, 0.5)',
    glowColor: 'rgba(255, 112, 67, 0.7)',
    sparkleColor: '#ffccbc',
    svg: `src/assets/icons/fruits/peach.svg`
  },
  PINEAPPLE: {
    id: 7,
    emoji: '🍍',
    radius: 68,
    nextType: 'MELON',
    color: '#d69e2e',
    scoreValue: 800,
    gradient: ['#ffd54f', '#d69e2e', '#f57f17'],
    shadow: '0 4px 16px rgba(245, 127, 23, 0.6)',
    glowColor: 'rgba(214, 158, 46, 0.8)',
    sparkleColor: '#fff9c4',
    svg: `src/assets/icons/fruits/pineapple.svg`
  },
  MELON: {
    id: 8,
    emoji: '🍉',
    radius: 82,
    nextType: 'COCONUT',
    color: '#38b2ac',
    scoreValue: 1600,
    gradient: ['#4db6ac', '#38b2ac', '#00695c'],
    shadow: '0 4px 16px rgba(0, 105, 92, 0.6)',
    glowColor: 'rgba(56, 178, 172, 0.8)',
    sparkleColor: '#b2dfdb',
    svg: `src/assets/icons/fruits/melon.svg`
  },
  COCONUT: {
    id: 9,
    emoji: '🥥',
    radius: 98,
    nextType: null,
    color: '#8b4513',
    scoreValue: 3200,
    gradient: ['#a1887f', '#8b4513', '#5d4037'],
    shadow: '0 5px 20px rgba(93, 64, 55, 0.7)',
    glowColor: 'rgba(139, 69, 19, 0.9)',
    sparkleColor: '#d7ccc8',
    svg: `src/assets/icons/fruits/coconut.svg`
  }
}

// Fruit spawning probability (for random drops)
const FRUIT_SPAWN_WEIGHTS = {
  BLUEBERRY: 0.4,    // 40% chance
  STRAWBERRY: 0.3,   // 30% chance
  GRAPE: 0.2,        // 20% chance
  ORANGE: 0.1        // 10% chance
  // Higher fruits only through merging
}
const warningZone = 30 // 30px über der Game Over Linie

// Combo configuration
const COMBO_CONFIG = {
  resetDelay: 6000,
  minComboForDisplay: 1,
  scoreMultipliers: {
    1: 1.0,   // Single merge
    2: 1.2,   // 2x combo = 20% bonus
    3: 1.5,   // 3x combo = 50% bonus
    4: 1.8,   // 4x combo = 80% bonus
    5: 2.0,   // 5x combo = 100% bonus
    6: 2.2,   // 6x combo = 120% bonus
    7: 2.5,   // 7x combo = 150% bonus
    8: 2.8,   // 8x combo = 180% bonus
    9: 3.0,   // 9x combo = 200% bonus
    10: 3.5   // 10+ combo = 250% bonus
  },
  comboMessage: {
    2: 'Nice Combo!',
    3: 'Great Combo!',
    4: 'Awesome Combo!',
    5: 'Amazing Combo!',
    7: 'Incredible Combo!',
    10: 'LEGENDARY COMBO!'
  },
  comboColor: {
    2: '#fdcb6e',  // Yellow
    3: '#e17055',  // Orange
    4: '#e84393',  // Pink
    5: '#a29bfe',  // Purple
    6: '#6c5ce7',  // Deep purple
    7: '#fd79a8',  // Hot pink
    8: '#e84393',  // Magenta
    9: '#9b59b6',  // Royal purple
    10: '#8e44ad' // Deep purple
  }
}

const comboState = ref({
  current: 0,
  maxThisSession: 0,
  lastMergeTime: null,
  timeoutId: null,
  resetDelay: COMBO_CONFIG.resetDelay, // 6 seconds
  comboTimeLeft: 0,
  comboTimerInterval: null
})

const getComboMultiplier = (comboLevel) => {
  if (comboLevel <= 10) {
    return COMBO_CONFIG.scoreMultipliers[comboLevel] || 1.0
  }
  // For combos > 10: 3.5 + 0.2 for each additional combo
  return 3.5 + ((comboLevel - 10) * 0.2)
}

const calculateComboScore = (baseScore, comboLevel) => {
  const multiplier = getComboMultiplier(comboLevel)
  const bonusScore = Math.floor(baseScore * multiplier)

  if (comboLevel > 1) {
    console.log(`🔥 Combo x${comboLevel}! Score: ${baseScore} → ${bonusScore} (${multiplier}x multiplier)`)
  }

  return bonusScore
}

const handleComboMerge = (baseScore) => {
  const now = Date.now()

  // Increment combo
  comboState.value.current++
  comboState.value.lastMergeTime = now

  // Update max combo for session
  comboState.value.maxThisSession = Math.max(
    comboState.value.maxThisSession,
    comboState.value.current
  )

  // Calculate final score with combo bonus
  const finalScore = calculateComboScore(baseScore, comboState.value.current)

  // Update session store with combo
  sessionStore.updateCombo(comboState.value.current)

  if (comboState.value.current >= 2) {
    emitComboMessage(comboState.value.current, 'combo')
  }

  if (comboState.value.current === 5 || comboState.value.current === 10) {
    setTimeout(() => {
      emitComboMessage(comboState.value.current, 'achievement')
    }, 500)
  }

  // Start/reset combo timer
  startComboTimer()

  if (comboState.value.current >= 3) {
    createComboEffect(comboState.value.current)
  }

  // Haptic feedback for high combos
  if (comboState.value.current >= 5 && navigator.vibrate) {
    navigator.vibrate([50, 25, 50])
  }

  console.log(`🎯 Combo x${comboState.value.current} achieved! Max this session: ${comboState.value.maxThisSession}`)

  return finalScore
}

// Start combo countdown timer
const startComboTimer = () => {
  // Clear existing timers
  if (comboState.value.timeoutId) {
    clearTimeout(comboState.value.timeoutId)
  }
  if (comboState.value.comboTimerInterval) {
    clearInterval(comboState.value.comboTimerInterval)
  }

  // Reset combo time left
  comboState.value.comboTimeLeft = COMBO_CONFIG.resetDelay

  // Visual countdown timer (updates every 100ms)
  comboState.value.comboTimerInterval = setInterval(() => {
    comboState.value.comboTimeLeft -= 100

    if (comboState.value.comboTimeLeft <= 0) {
      clearInterval(comboState.value.comboTimerInterval)
      comboState.value.comboTimerInterval = null
    }
  }, 100)

  // Combo reset timeout
  comboState.value.timeoutId = setTimeout(() => {
    resetCombo()
  }, COMBO_CONFIG.resetDelay)
}

// Reset combo state
const resetCombo = () => {
  if (comboState.value.current > 1) {
    console.log(`💫 Combo ended at x${comboState.value.current}`)
  }

  comboState.value.current = 0
  comboState.value.comboTimeLeft = 0

  // Clear timers
  if (comboState.value.timeoutId) {
    clearTimeout(comboState.value.timeoutId)
    comboState.value.timeoutId = null
  }
  if (comboState.value.comboTimerInterval) {
    clearInterval(comboState.value.comboTimerInterval)
    comboState.value.comboTimerInterval = null
  }

  emit('combo-message', null)

  // Reset combo in session store
  sessionStore.resetCombo()
}

</script>

<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">

      <!-- Physics Game Area -->
      <div class="game-play-area__physics">
        <div
          ref="gameCanvas"
          class="game-play-area__physics-container"
          :class="{
            'game-play-area__physics-container--paused': isGamePaused,
            'game-play-area__physics-container--active': isGameActive && canDrop,
            'game-play-area__physics-container--cooldown': !canDrop
          }"
          @mousedown="handlePointerDown"
          @mousemove="handlePointerMove"
          @mouseup="handlePointerUp"
          @mouseleave="handlePointerLeave"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @touchcancel="handlePointerLeave"
        >
          <!-- Drop Zone -->
          <div
            v-if="isGameActive"
            class="game-play-area__drop-zone"
          ></div>
          <!-- Game Over Line -->
          <div
            v-if="isGameActive"
            class="game-play-area__game-over-line"
            :class="{ 'game-play-area__game-over-line--warning': isNearGameOver }"
            :style="{ top: `${gameOverHeight}px` }"
          ></div>
        </div>

        <!-- Drop Trajectory Line -->
        <div
          v-if="dropPreviewPosition && isGameActive && canDrop"
          class="game-play-area__trajectory-line"
          :style="{
            left: `${dropPreviewPosition}px`,
            height: `${PHYSICS_CONFIG.canvas.height - PHYSICS_CONFIG.dropZone.dropY}px`,
            top: `${PHYSICS_CONFIG.dropZone.dropY}px`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '../../assets/variables' as vars;

// Game Play Area Block
.game-play-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;

  // Game Container Element
  &__game-container {
    width: var(--game-board-width);
    height: var(--game-board-height);
    background-color: var(--game-board-bg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--card-shadow);
    overflow: hidden;
  }

  // Game Status Element
  &__game-status {
    background-color: var(--bg-secondary);
    padding: var(--space-4);
    border-bottom: 1px solid var(--card-border);
    text-align: center;
  }

  &__status-title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-lg);
    font-weight: bold;
    color: var(--text-color);
  }

  &__game-info {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);

    p {
      margin: 0;
    }

    @media (max-width: vars.$breakpoint-sm) {
      flex-direction: column;
      gap: var(--space-1);
    }
  }

  // Physics Game Area Element
  &__physics {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    position: relative;
  }

  // Canvas Container Element
  &__physics-container {
    width: 300px;
    height: 400px;
    border: 2px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    background-color: var(--bg-secondary);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: none;

    &:hover {
      border-color: var(--accent-color);
    }

    &--active {
      cursor: crosshair;
      box-shadow:
        0 0 20px rgba(0, 184, 148, 0.3),
        inset 0 0 0 2px rgba(0, 184, 148, 0.1);

      &:hover {
        box-shadow:
          0 0 30px rgba(0, 184, 148, 0.5),
          inset 0 0 0 2px rgba(0, 184, 148, 0.2);
      }
    }
  }

  // Drop zone indicator
  &__drop-zone {
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    opacity: 0.6;
    pointer-events: none;
    z-index: 5;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(0, 184, 148, 0.3) 20%,
      rgba(0, 184, 148, 0.6) 50%,
      rgba(0, 184, 148, 0.3) 80%,
      transparent 100%
    );
    height: 3px;
    box-shadow: 0 0 10px rgba(0, 184, 148, 0.4);
    animation: drop-zone-glow 2s ease-in-out infinite;
  }

  &__trajectory-line {
    position: absolute;
    pointer-events: none;
    z-index: 5;
  }

  &__game-over-line {
    position: absolute;
    top: 100px;
    left: 20px;
    right: 20px;
    height: 3px;
    background: linear-gradient(90deg,
      transparent 0%,
      #e74c3c 20%,
      #e74c3c 80%,
      transparent 100%
    );
    z-index: 10;
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.6);
    pointer-events: none;

    &--warning {
      animation: game-over-warning 0.5s ease-in-out infinite alternate;
      box-shadow: 0 0 15px rgba(231, 76, 60, 0.8);
    }
  }
}

@keyframes drop-zone-glow {
  0%, 100% {
    opacity: 0.6;
    transform: scaleY(1);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.5);
  }
}

@keyframes game-over-warning {
  0% {
    opacity: 0.7;
    transform: scaleY(1);
  }
  100% {
    opacity: 1;
    transform: scaleY(1.5);
  }
}
</style>