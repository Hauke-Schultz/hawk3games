<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Matter from 'matter-js'
import { useSessionStore } from '../../stores/index.js'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { storeToRefs } from "pinia"
import { PHYSICS_CONFIG, FRUIT_TYPES, FRUIT_SPAWN_WEIGHTS } from '../../config/fruitMergeGameConfig.js'
import { useComboSystem } from '../../composables/useComboSystem.js'
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
const engine = ref(null)
const world = ref(null)
const walls = ref([])
const currentDropFruitType = ref('BLUEBERRY')
const dropFruitPosition = ref({ x: 150, y: 30 })
const isHoveringDropZone = ref(false)
const droppedFruits = ref([])
const nextFruitId = ref(1)

// Physics-related methods (to be implemented with Matter.js)
const initializePhysics = () => {
  console.log('🎯 Initializing Matter.js physics engine (headless)')

  // Create engine without render
  engine.value = Matter.Engine.create()
  world.value = engine.value.world

  // Disable gravity for controlled dropping
  engine.value.world.gravity.y = 0.8
  engine.value.world.gravity.x = 0

  // Create boundaries (walls and floor)
  createWorldBoundaries()

  // Start physics loop
  startPhysicsLoop()

  console.log('✅ Physics engine initialized successfully')
}

const createWorldBoundaries = () => {
  const { width, height } = PHYSICS_CONFIG.canvas

  // Create static walls
  const leftWall = Matter.Bodies.rectangle(-5, height/2, 10, height, { isStatic: true })
  const rightWall = Matter.Bodies.rectangle(width + 5, height/2, 10, height, { isStatic: true })
  const floor = Matter.Bodies.rectangle(width/2, height + 5, width, 10, { isStatic: true })

  walls.value = [leftWall, rightWall, floor]

  // Add walls to world
  Matter.World.add(world.value, walls.value)

  console.log('🏗️ World boundaries created')
}

const startPhysicsLoop = () => {
  const runner = Matter.Runner.create()

  // Custom update loop for position sync
  Matter.Events.on(runner, 'tick', () => {
    updateFruitPositions()
  })

  Matter.Runner.run(runner, engine.value)

  // Setup collision detection
  setupCollisionEvents()

  console.log('🔄 Physics loop with rotation and collision detection started')
}

const setupCollisionEvents = () => {
  if (!engine.value) return

  Matter.Events.on(engine.value, 'collisionStart', (event) => {
    const pairs = event.pairs

    pairs.forEach(pair => {
      const { bodyA, bodyB } = pair

      // Check if both bodies are fruits
      const fruitA = droppedFruits.value.find(f => f.body === bodyA)
      const fruitB = droppedFruits.value.find(f => f.body === bodyB)

      if (fruitA || fruitB) {
        // Enhanced collision effects
        const collision = pair.collision
        const force = Matter.Vector.magnitude(collision.normal)

        if (fruitA) {
          const impulse = (Math.random() - 0.5) * force * 0.01
          Matter.Body.setAngularVelocity(bodyA, bodyA.angularVelocity + impulse)
        }

        if (fruitB) {
          const impulse = (Math.random() - 0.5) * force * 0.01
          Matter.Body.setAngularVelocity(bodyB, bodyB.angularVelocity + impulse)
        }

        // NEW: Check for merge potential (same fruit types)
        if (fruitA && fruitB && fruitA.type === fruitB.type && !fruitA.merging && !fruitB.merging) {
          console.log(`🔄 Merging: ${fruitA.type} + ${fruitB.type}`)
          handleFruitMerge(fruitA, fruitB)
        }
      }
    })
  })

  console.log('👂 Enhanced collision events with merge detection setup')
}

const handleFruitMerge = (fruitA, fruitB) => {
  // Mark fruits as merging to prevent multiple merges
  fruitA.merging = true
  fruitB.merging = true

  // Calculate center position for the new fruit
  const centerX = (fruitA.body.position.x + fruitB.body.position.x) / 2
  const centerY = (fruitA.body.position.y + fruitB.body.position.y) / 2

  // Get fruit configuration
  const currentConfig = FRUIT_TYPES[fruitA.type]
  const nextType = currentConfig.nextType

  // Calculate score for this merge
  const baseScore = currentConfig.scoreValue

  // Schedule merge after visual delay
  setTimeout(() => {
    // Remove old fruits from physics world
    if (fruitA.body) {
      Matter.Composite.remove(world.value, fruitA.body)
    }
    if (fruitB.body) {
      Matter.Composite.remove(world.value, fruitB.body)
    }

    // Remove fruits from visual array
    droppedFruits.value = droppedFruits.value.filter(
      f => f.id !== fruitA.id && f.id !== fruitB.id
    )

    // Award score with combo system
    const finalScore = handleComboMerge(baseScore)
    emit('score-update', finalScore)

    // Create new fruit if not at max level
    if (nextType) {
      createMergedFruit(nextType, centerX, centerY)
    }

    console.log(`✨ Merge complete: ${currentConfig.scoreValue} → ${finalScore} points`)
  }, 100) // Small delay for visual feedback
}

const createMergedFruit = (fruitType, x, y) => {
  const fruitConfig = FRUIT_TYPES[fruitType]

  // Create Matter.js body
  const fruitBody = Matter.Bodies.circle(x, y, fruitConfig.radius, {
    restitution: 0.3,
    friction: 0.4,
    density: 0.001,
    frictionAir: 0.01,
    label: `fruit_${nextFruitId.value}`,
    fruitType: fruitType
  })

  // Add slight upward impulse for visual effect
  Matter.Body.setVelocity(fruitBody, { x: 0, y: -2 })

  // Add to world
  Matter.World.add(world.value, fruitBody)

  // Create visual fruit data
  const visualFruit = {
    id: nextFruitId.value,
    type: fruitType,
    body: fruitBody,
    position: { x: x, y: y },
    rotation: 0,
    isDropping: true,
    isMerged: true // NEW: Mark as merged for special effects
  }

  // Add to visual fruits array
  droppedFruits.value.push(visualFruit)

  // Increment ID for next fruit
  nextFruitId.value++

  console.log(`🍎 Merged fruit created: ${fruitType}`)
}

const dropFruit = (x) => {
  if (!canDrop.value || !world.value) return

  console.log(`🎯 Dropping ${currentDropFruitType.value} at x: ${x}`)

  // Create Matter.js body with rotation properties
  const fruitConfig = FRUIT_TYPES[currentDropFruitType.value]
  const fruitBody = Matter.Bodies.circle(x, PHYSICS_CONFIG.dropZone.dropY, fruitConfig.radius, {
    restitution: 0.3,
    friction: 0.4,
    density: 0.001,
    frictionAir: 0.01, // Air resistance for rotation
    label: `fruit_${nextFruitId.value}`,
    fruitType: currentDropFruitType.value
  })

  // Add slight random initial rotation
  const initialSpin = (Math.random() - 0.5) * 0.1
  Matter.Body.setAngularVelocity(fruitBody, initialSpin)

  // Add to world
  Matter.World.add(world.value, fruitBody)

  // Create visual fruit data
  const visualFruit = {
    id: nextFruitId.value,
    type: currentDropFruitType.value,
    body: fruitBody,
    position: { x: x, y: PHYSICS_CONFIG.dropZone.dropY },
    rotation: 0, // Initial rotation
    isDropping: true
  }

  // Add to visual fruits array
  droppedFruits.value.push(visualFruit)

  // Generate next fruit
  generateNextDropFruit()

  // Update game state
  emit('move-made')

  // Apply drop cooldown
  canDrop.value = false
  setTimeout(() => {
    canDrop.value = true
  }, PHYSICS_CONFIG.dropCooldown)

  // Increment ID for next fruit
  nextFruitId.value++

  // Reset drop state
  resetDropState()

  console.log(`🍎 Fruit dropped! Total fruits: ${droppedFruits.value.length}`)
}

const generateNextDropFruit = () => {
  currentDropFruitType.value = getRandomSpawnFruit()
  console.log(`🎲 Next drop fruit: ${currentDropFruitType.value}`)
}

// Physics update loop
const updateFruitPositions = () => {
  if (!droppedFruits.value.length) return

  droppedFruits.value.forEach(fruit => {
    if (fruit.body) {
      // Sync visual position with physics body
      fruit.position.x = fruit.body.position.x
      fruit.position.y = fruit.body.position.y

      // Sync rotation (stored for reactivity)
      fruit.rotation = fruit.body.angle

      // Check velocity for dropping state
      const velocity = Matter.Vector.magnitude(fruit.body.velocity)
      const angularVelocity = Math.abs(fruit.body.angularVelocity)

      if (velocity < 0.1 && angularVelocity < 0.05 && fruit.isDropping) {
        fruit.isDropping = false
        console.log(`🍎 Fruit ${fruit.id} settled`)
      }
    }
  })
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

  // Start showing drop preview
  updateDropPreview(dragStartX.value)

  console.log('🎯 Started dragging drop fruit')
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

  // Only drop if in valid zone
  if (isHoveringDropZone.value) {
    dropFruit(dropX)
  } else {
    console.log('❌ Drop outside valid zone')
  }

  // Reset interaction state
  resetDropState()
}

const resetDropState = () => {
  isDragging.value = false
  dragStartX.value = null
  dropPreviewPosition.value = null
  isHoveringDropZone.value = false

  // Reset drop fruit to center
  dropFruitPosition.value = { x: 150, y: 30 }
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

  // Update drop preview line
  dropPreviewPosition.value = clampedX

  // Update drop fruit position
  dropFruitPosition.value = {
    x: clampedX,
    y: 30
  }

  // Check if in valid drop zone
  isHoveringDropZone.value = x >= PHYSICS_CONFIG.dropZone.minX && x <= PHYSICS_CONFIG.dropZone.maxX
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

const checkGameOver = () => {
  const currentTime = Date.now()
  const currentTopBoundary = PHYSICS_CONFIG.gameOverHeight

  // Check for fruits that are above the game over line
  let hasViolation = false

  for (const fruit of droppedFruits.value) {
    if (fruit.body && fruit.body.position.y < currentTopBoundary && !fruit.merging) {
      hasViolation = true

      // Track violation start time
      if (!topViolations.value[fruit.id]) {
        topViolations.value[fruit.id] = currentTime
      }

      // Check if violation has lasted too long
      else if (currentTime - topViolations.value[fruit.id] >= gameOverDelay) {
        // Game Over
        console.log('💀 Game Over - fruit reached danger zone')

        // TODO: Emit game over event
        emit('game-over', {
          reason: 'height_limit',
          finalScore: sessionStore?.currentSession?.score || 0
        })

        isNearGameOver.value = true
        return true
      }
    } else {
      // Remove violation if fruit moved away
      if (topViolations.value[fruit.id]) {
        delete topViolations.value[fruit.id]
      }
    }
  }

  // Update warning state
  isNearGameOver.value = hasViolation

  return false
}

// Lifecycle hooks
onMounted(() => {
  console.log('🎮 GamePlayArea mounted - ready for physics')
  initializePhysics()

  // Generate first drop fruit
  currentDropFruitType.value = getRandomSpawnFruit()

  console.log(`🍎 Initial drop fruit: ${currentDropFruitType.value}`)
})

onUnmounted(() => {
  console.log('🎮 GamePlayArea unmounted - cleanup physics')

  // Clear dropped fruits
  droppedFruits.value = []

  // Clear Matter.js world
  if (world.value) {
    Matter.World.clear(world.value)
  }

  // Stop engine
  if (engine.value) {
    Matter.Engine.clear(engine.value)
  }

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
        <DropFruit
          v-if="isGameActive && canDrop"
          :fruit-type="currentDropFruitType"
          :position="dropFruitPosition"
          :is-preview="true"
          :is-dragging="isDragging"
          :is-valid-drop="isHoveringDropZone"
        />
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