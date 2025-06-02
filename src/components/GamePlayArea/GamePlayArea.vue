<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useSessionStore } from '../../stores/index.js'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { storeToRefs } from "pinia"
import { PHYSICS_CONFIG, FRUIT_TYPES, FRUIT_SPAWN_WEIGHTS } from '../../config/fruitMergeGameConfig.js'
import { useComboSystem } from '../../composables/useComboSystem.js'

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
})

// Events
const emit = defineEmits([
  'pause-game',
  'resume-game',
  'back-to-level-selection',
  'move-made',
  'score-update',
  'combo-message'
])

// Store integration
const sessionStore = useSessionStore()
const settingsStore = useSettingsStore()

// Combo system integration
const {
  comboState,
  handleComboMerge,
  resetCombo
} = useComboSystem(emit)

// Physics game state
const gameCanvas = ref(null)
const canDrop = ref(true)
const dropPreviewPosition = ref(null)
const isNearGameOver = ref(false)
const gameOverHeight = PHYSICS_CONFIG.gameOverHeight

// Touch/Mouse interaction state
const isDragging = ref(false)
const dragStartX = ref(null)

// Game mechanics
const currentDropFruit = ref(null)
const nextDropFruit = ref(null)

// Physics-related methods (to be implemented with Matter.js)
const initializePhysics = () => {
  console.log('🎯 Physics engine initialization placeholder')
  // TODO: Matter.js engine setup will go here
}

const createFruitBody = (fruitType, x, y) => {
  console.log(`🍎 Creating ${fruitType} fruit at (${x}, ${y})`)
  // TODO: Matter.js body creation will go here
  return null
}

const handleFruitMerge = (fruit1, fruit2) => {
  console.log('🔄 Fruit merge detected')

  // Get fruit type and calculate score
  const fruitType = FRUIT_TYPES[fruit1.type]
  const baseScore = fruitType.scoreValue

  // Handle combo scoring
  const finalScore = handleComboMerge(baseScore)

  // Update game state
  emit('score-update', finalScore)
  emit('move-made')

  // TODO: Actual physics merge implementation
}

const checkGameOverCondition = () => {
  console.log('🔍 Checking game over condition')
  // TODO: Physics-based height checking
  const fruitsNearTop = false // Placeholder

  isNearGameOver.value = fruitsNearTop

  if (fruitsNearTop) {
    console.log('⚠️ Game over condition detected!')
    // Handle game over
  }
}

// Input handling methods
const getPointerPosition = (event) => {
  const rect = gameCanvas.value.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  return clientX - rect.left
}

const handlePointerDown = (event) => {
  if (!props.isGameActive || !canDrop.value) return

  event.preventDefault()
  isDragging.value = true
  dragStartX.value = getPointerPosition(event)

  // Show drop preview
  updateDropPreview(dragStartX.value)
}

const handlePointerMove = (event) => {
  if (!isDragging.value || !props.isGameActive) return

  event.preventDefault()
  const currentX = getPointerPosition(event)
  updateDropPreview(currentX)
}

const handlePointerUp = (event) => {
  if (!isDragging.value || !props.isGameActive || !canDrop.value) return

  event.preventDefault()
  const dropX = getPointerPosition(event)

  // Validate drop position
  if (dropX >= PHYSICS_CONFIG.dropZone.minX && dropX <= PHYSICS_CONFIG.dropZone.maxX) {
    dropFruit(dropX)
  }

  // Reset interaction state
  isDragging.value = false
  dragStartX.value = null
  dropPreviewPosition.value = null
}

const handlePointerLeave = () => {
  isDragging.value = false
  dragStartX.value = null
  dropPreviewPosition.value = null
}

// Touch event handlers
const handleTouchStart = (event) => handlePointerDown(event)
const handleTouchMove = (event) => handlePointerMove(event)
const handleTouchEnd = (event) => handlePointerUp(event)

// Game logic methods
const updateDropPreview = (x) => {
  // Clamp to drop zone boundaries
  const clampedX = Math.max(
    PHYSICS_CONFIG.dropZone.minX,
    Math.min(PHYSICS_CONFIG.dropZone.maxX, x)
  )
  dropPreviewPosition.value = clampedX
}

const dropFruit = (x) => {
  if (!canDrop.value) return

  console.log(`🎯 Dropping fruit at x: ${x}`)

  // Create physics fruit body
  const fruitType = getRandomSpawnFruit()
  const fruit = createFruitBody(fruitType, x, PHYSICS_CONFIG.dropZone.dropY)

  // Update game state
  emit('move-made')

  // Apply drop cooldown
  canDrop.value = false
  setTimeout(() => {
    canDrop.value = true
  }, PHYSICS_CONFIG.dropCooldown)

  // Check game state
  setTimeout(() => {
    checkGameOverCondition()
  }, 100)
}

const getRandomSpawnFruit = () => {
  const random = Math.random()
  let cumulativeProbability = 0

  for (const [fruitType, probability] of Object.entries(FRUIT_SPAWN_WEIGHTS)) {
    cumulativeProbability += probability
    if (random <= cumulativeProbability) {
      return fruitType
    }
  }

  return 'BLUEBERRY' // Fallback
}

// Lifecycle hooks
onMounted(() => {
  console.log('🎮 GamePlayArea mounted - ready for physics')
  initializePhysics()

  // Generate first drop fruit
  currentDropFruit.value = getRandomSpawnFruit()
  nextDropFruit.value = getRandomSpawnFruit()
})

onUnmounted(() => {
  console.log('🎮 GamePlayArea unmounted - cleanup physics')
  // TODO: Matter.js cleanup will go here
  resetCombo()
})

// Expose combo state for parent components
defineExpose({
  comboState
})
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

    &--cooldown {
      cursor: wait;
      opacity: 0.7;
    }

    &--paused {
      cursor: not-allowed;
      opacity: 0.5;
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
    width: 2px;
    background: linear-gradient(to bottom,
      rgba(0, 184, 148, 0.8) 0%,
      rgba(0, 184, 148, 0.4) 50%,
      transparent 100%
    );
    border-radius: 1px;
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