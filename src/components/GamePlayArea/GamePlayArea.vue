<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Matter from 'matter-js'
import { useSessionStore } from '../../stores/index.js'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { storeToRefs } from "pinia"
import { PHYSICS_CONFIG, FRUIT_TYPES } from '../../config/fruitMergeGameConfig.js'
import { useComboSystem } from '../../composables/useComboSystem.js'
import { usePhysicsEngine } from '../../composables/usePhysicsEngine.js'
import { useFruitManager } from '../../composables/useFruitManager.js'
import { useInputHandler } from '../../composables/useInputHandler.js'
import { useGameRules } from '../../composables/useGameRules.js'
import { useLevelCompletion } from '../../composables/useLevelCompletion.js'
import LevelCompletionOverlay from '../LevelCompletionOverlay/LevelCompletionOverlay.vue'
import DropFruit from '../DropFruit/DropFruit.vue'
import DroppedFruit from '../DroppedFruit/DroppedFruit.vue'

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
  'combo-message',
  'game-over',
  'level-completed',
  'start-next-level',
  'level-physics-stop'
])

// Store integration
const sessionStore = useSessionStore()
const settingsStore = useSettingsStore()

// Game canvas reference
const gameCanvas = ref(null)
let dropCooldownTimer = null


// Physics engine integration
const {
  engine,
  world,
  initializePhysics,
  cleanupPhysics,
  createFruitBody,
  addBodyToWorld,
  removeBodyFromWorld,
  setupCollisionEvents,
  applyRotationImpulse,
  getCollisionForce
} = usePhysicsEngine()

// Fruit management integration
const {
  droppedFruits,
  currentDropFruitType,
  canDrop,
  dropFruit,
  generateNextDropFruit,
  updateFruitPositions,
  checkForMerges,
  resetFruitManager,
  setGameOverState,
  gameOverState,
  setLevelCompletedState,
} = useFruitManager(emit, {
  world,
  createFruitBody,
  addBodyToWorld,
  removeBodyFromWorld
})

// Input handling integration
const {
  isDragging,
  dropPreviewPosition,
  isHoveringDropZone,
  dropFruitPosition,
  dropLineStyle,
  getContainerEventHandlers,
  resetInputState,
  getDropZoneAriaLabel
} = useInputHandler(gameCanvas, {
  canDrop,
  dropFruit
}, {
  isGameActive: computed(() => props.isGameActive),
  isGamePaused: computed(() => props.isGamePaused)
})

// Game rules integration
const {
  isNearGameOver,
  gameOverHeight,
  dangerZoneHeight,
  violationWarningLevel,
  checkGameOver,
  cleanupViolations,
  resetGameRules,
  setLevelGameOverHeight
} = useGameRules(droppedFruits, emit)

// Combo system integration
const {
  comboState,
  handleComboMerge,
  resetCombo
} = useComboSystem(emit)

const levelCompletionState = useLevelCompletion(emit)

// Enhanced collision event handler
const handleCollisionEvent = (event) => {
  const pairs = event.pairs

  pairs.forEach(pair => {
    const { bodyA, bodyB } = pair

    // Check if both bodies are fruits
    const fruitA = droppedFruits.value.find(f => f.body === bodyA)
    const fruitB = droppedFruits.value.find(f => f.body === bodyB)

    if (fruitA || fruitB) {
      // Enhanced collision effects using physics engine
      const collision = pair.collision
      const force = getCollisionForce(collision)

      if (fruitA) {
        applyRotationImpulse(bodyA, force)
      }

      if (fruitB) {
        applyRotationImpulse(bodyB, force)
      }

      // Check for merge using fruit manager
      checkForMerges(bodyA, bodyB, handleComboMerge)
    }
  })
}

// Game over monitoring with cleanup
watch(droppedFruits, () => {
  if (props.isGameActive && !props.isGamePaused) {
    cleanupViolations()

    // Game Over wird von useGameRules selbst getriggert
    const gameOverResult = checkGameOver()
    if (gameOverResult) {
      // useGameRules hat bereits das game-over Event emitted
      handleGameOver({
        reason: 'height_limit',
        finalScore: props.currentSession?.score || 0,
        moves: props.currentSession?.moves || 0,
        level: props.currentLevel
      })
    }
  }
}, { deep: true })

// Physics update loop
let animationFrameId = null
const startUpdateLoop = () => {
  const update = () => {
    if (props.isGameActive && !props.isGamePaused) {
      updateFruitPositions()
    }
    animationFrameId = requestAnimationFrame(update)
  }
  update()
}

const handleGameOver = (gameOverData) => {
  console.log('💀 Game Over received in GamePlayArea:', gameOverData)

  // Stop physics and UI
  stopUpdateLoop()
  resetInputState()
  resetCombo()
  setGameOverState(true)

  // Delegate to parent
  emit('game-over', gameOverData)
}

const handleLevelCompleted = (completionData) => {
  console.log('🎉 Level Completed received in GamePlayArea:', completionData)

  // Stop physics and UI (same as game over)
  stopUpdateLoop()
  resetInputState()
  resetCombo()
  setLevelCompletedState(true)  // Verwende die neue Funktion

  // Delegate to parent
  emit('level-completed', completionData)
}

const stopUpdateLoop = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    console.log('🛑 Physics update loop stopped')
  }
}

// handleScoreUpdate vereinfachen:
const handleScoreUpdate = (points) => {
  const stateManager = gameStateManager.value
  if (stateManager && stateManager.sessionStore) {
    stateManager.sessionStore.addToScore(points)
    console.log(`📊 Score updated: +${points} points`)

    // Level completion wird automatisch durch watch getriggert
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('🎮 GamePlayArea mounted - ready for physics')

  // Initialize physics engine
  initializePhysics()

  // Setup collision events
  setupCollisionEvents(handleCollisionEvent)

  // Generate first drop fruit
  generateNextDropFruit()

  // Start update loop
  startUpdateLoop()

  // Setze level-spezifische game over height
  setLevelGameOverHeight(props.currentLevel)

  // Initialize level completion
  levelCompletionState.$on?.('level-physics-stop', () => {
    handleLevelCompleted({
      reason: 'target_reached',
      finalScore: props.currentSession?.score || 0,
      moves: props.currentSession?.moves || 0,
      level: props.currentLevel
    })
  })

  console.log(`🍎 Initial drop fruit: ${currentDropFruitType.value}`)
})

onUnmounted(() => {
  console.log('🎮 GamePlayArea unmounted - cleanup')

  // Stop update loop
  stopUpdateLoop()

  // Reset all systems
  resetInputState()
  resetFruitManager()
  resetGameRules()
  resetCombo()

  // Physics cleanup handled by composable
})

// Expose combo state for parent components
defineExpose({
  comboState
})
</script>

<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">
      <!-- Level Completion Overlay -->
      <LevelCompletionOverlay
        :level-completion-state="levelCompletionState"
        :current-session="currentSession"
        :current-level="currentLevel"
        :max-level="9"
        @start-next-level="(levelId) => emit('start-next-level', levelId)"
        @back-to-levels="() => emit('back-to-level-selection')"
      />
      <!-- Physics Game Area -->
      <div class="game-play-area__physics">
        <div
          ref="gameCanvas"
          class="game-play-area__physics-container"
          :class="{
            'game-play-area__physics-container--paused': isGamePaused,
            'game-play-area__physics-container--active': isGameActive && canDrop && !gameOverState,
            'game-play-area__physics-container--cooldown': !canDrop && !gameOverState,
            'game-play-area__physics-container--danger': violationWarningLevel === 'critical',
            'game-play-area__physics-container--game-over': gameOverState || props.currentSession?.status === 'game_over'
          }"
          v-bind="getContainerEventHandlers()"
          :aria-label="getDropZoneAriaLabel()"
          role="application"
          tabindex="0"
        >
          <!-- Drop Zone -->
          <div
            v-if="isGameActive"
            class="game-play-area__drop-zone"
          ></div>

          <!-- Game Over Line -->
          <div
            class="game-play-area__game-over-line"
            :class="{
              'game-play-area__game-over-line--warning': isNearGameOver,
              'game-play-area__game-over-line--critical': violationWarningLevel === 'critical'
            }"
            :style="{ top: `${dangerZoneHeight}px` }"
          ></div>
        </div>

        <!-- Drop Trajectory Line -->
        <div
          v-if="dropPreviewPosition && isGameActive && canDrop && !gameOverState"
          class="game-play-area__trajectory-line"
          :style="dropLineStyle"
        ></div>

        <!-- Drop Fruit Preview -->
        <DropFruit
          v-if="isGameActive && canDrop && !gameOverState"
          :fruit-type="currentDropFruitType"
          :position="dropFruitPosition"
          :is-preview="true"
          :is-dragging="isDragging"
          :is-valid-drop="isHoveringDropZone"
        />

        <!-- Dropped Fruits -->
        <DroppedFruit
          v-for="fruit in droppedFruits"
          :key="fruit.id"
          :fruit="fruit"
          :class="{
            'dropped-fruit--merged': fruit.isMerged,
            'dropped-fruit--merging': fruit.merging
          }"
        />
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
    transition: all 0.3s ease;

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
    }

    &--paused {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &--danger {
      border-color: var(--error-color);
      box-shadow: 0 0 20px rgba(225, 112, 85, 0.5);
      animation: danger-pulse 1s ease-in-out infinite;
    }

    &--game-over {
      cursor: not-allowed;
      opacity: 1;
      background-color: rgba(225, 112, 85, 0.1);
      border-color: var(--error-color);
      z-index: 20;

      &::after {
        content: 'GAME OVER';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: var(--font-size-2xl);
        font-weight: bold;
        color: var(--error-color);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        z-index: 100;
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
    pointer-events: none;
    z-index: 5;
  }

  &__game-over-line {
    position: absolute;
    left: 20px;
    right: 20px;
    height: 3px;
    background: linear-gradient(90deg,
      transparent 0%,
      #e74c3c 20%,
      #e74c3c 80%,
      transparent 100%
    );
    z-index: 30;
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.6);
    pointer-events: none;
    transition: all 0.3s ease;

    &--warning {
      animation: game-over-warning 0.5s ease-in-out infinite alternate;
      box-shadow: 0 0 15px rgba(231, 76, 60, 0.8);
    }

    &--critical {
      background: linear-gradient(90deg,
        transparent 0%,
        #c0392b 20%,
        #c0392b 80%,
        transparent 100%
      );
      animation: game-over-critical 0.3s ease-in-out infinite;
      box-shadow: 0 0 25px rgba(192, 57, 43, 1);
      height: 4px;
    }
  }
}

// Animations
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

@keyframes game-over-critical {
  0% {
    opacity: 0.8;
    transform: scaleY(1.2);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.8);
  }
  100% {
    opacity: 0.8;
    transform: scaleY(1.2);
  }
}

@keyframes danger-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .game-play-area__physics-container,
  .game-play-area__drop-zone,
  .game-play-area__game-over-line {
    animation: none;
    transition: none;
  }
}
</style>