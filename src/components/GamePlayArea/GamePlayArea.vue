<script setup>
import {computed, ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import Matter from 'matter-js'

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

// Physics Engine Setup
const gameCanvas = ref(null)
const physicsEngine = ref(null)
const physicsWorld = ref(null)
const physicsRender = ref(null)
const physicsRunner = ref(null)

// Physics configuration
const PHYSICS_CONFIG = {
  canvas: {
    width: 400,
    height: 500
  },
  engine: {
    gravity: { x: 0, y: 0.8 },
    enableSleeping: true
  },
  render: {
    wireframes: false,
    background: 'transparent',
    showVelocity: false,
    showAngleIndicator: false
  }
}

// Physics Engine Initialization
const initPhysics = async () => {
  try {
    console.log('🔧 Initializing Matter.js physics engine...')

    // Create engine
    physicsEngine.value = Matter.Engine.create()
    physicsWorld.value = physicsEngine.value.world

    // Configure engine
    physicsEngine.value.world.gravity.y = PHYSICS_CONFIG.engine.gravity.y
    physicsEngine.value.world.gravity.x = PHYSICS_CONFIG.engine.gravity.x
    physicsEngine.value.enableSleeping = PHYSICS_CONFIG.engine.enableSleeping

    // Wait for canvas to be mounted
    await nextTick()

    if (!gameCanvas.value) {
      throw new Error('Canvas element not found')
    }

    // Create renderer
    physicsRender.value = Matter.Render.create({
      element: gameCanvas.value,
      engine: physicsEngine.value,
      options: {
        width: PHYSICS_CONFIG.canvas.width,
        height: PHYSICS_CONFIG.canvas.height,
        wireframes: PHYSICS_CONFIG.render.wireframes,
        background: PHYSICS_CONFIG.render.background,
        showVelocity: PHYSICS_CONFIG.render.showVelocity,
        showAngleIndicator: PHYSICS_CONFIG.render.showAngleIndicator
      }
    })

    // Create runner
    physicsRunner.value = Matter.Runner.create()

    // Add ground boundaries
    createBoundaries()

    console.log('✅ Physics engine initialized successfully')

    return true

  } catch (error) {
    console.error('❌ Physics initialization failed:', error)
    return false
  }
}

// Create physics boundaries (walls and floor)
const createBoundaries = () => {
  const { width, height } = PHYSICS_CONFIG.canvas
  const wallThickness = 20

  const boundaries = [
    // Floor
    Matter.Bodies.rectangle(width / 2, height + 10, width, wallThickness, {
      isStatic: true,
      render: { fillStyle: '#333' }
    }),
    // Left wall
    Matter.Bodies.rectangle(-10, height / 2, wallThickness, height, {
      isStatic: true,
      render: { fillStyle: '#333' }
    }),
    // Right wall
    Matter.Bodies.rectangle(width + 10, height / 2, wallThickness, height, {
      isStatic: true,
      render: { fillStyle: '#333' }
    })
  ]

  Matter.World.add(physicsWorld.value, boundaries)
  console.log('🏗️ Physics boundaries created')
}

// Test Physics Objects (für T1.4: Basic Physics Test)
const createTestObjects = () => {
  if (!physicsWorld.value) {
    console.warn('Physics world not available')
    return
  }

  const { width } = PHYSICS_CONFIG.canvas

  // Create test circles (falling fruits)
  const testCircles = []

  for (let i = 0; i < 3; i++) {
    const x = (width / 4) * (i + 1)
    const y = 50
    const radius = 20 + (i * 5)

    const circle = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.6,
      frictionAir: 0.01,
      render: {
        fillStyle: `hsl(${i * 120}, 70%, 50%)`,
        strokeStyle: '#000',
        lineWidth: 2
      }
    })

    testCircles.push(circle)
  }

  // Create test rectangles
  const testRects = []
  for (let i = 0; i < 2; i++) {
    const x = 100 + (i * 200)
    const y = 150
    const width = 40
    const height = 60

    const rect = Matter.Bodies.rectangle(x, y, width, height, {
      restitution: 0.4,
      render: {
        fillStyle: `hsl(${180 + i * 60}, 60%, 50%)`,
        strokeStyle: '#000',
        lineWidth: 2
      }
    })

    testRects.push(rect)
  }

  // Add all test objects to world
  Matter.World.add(physicsWorld.value, [...testCircles, ...testRects])

  console.log('🧪 Test physics objects created:', {
    circles: testCircles.length,
    rectangles: testRects.length
  })

  return { testCircles, testRects }
}

// Remove test objects (cleanup)
const removeTestObjects = () => {
  if (!physicsWorld.value) return

  // Remove all non-static bodies (test objects)
  const bodies = Matter.Composite.allBodies(physicsWorld.value)
  const testBodies = bodies.filter(body => !body.isStatic)

  if (testBodies.length > 0) {
    Matter.World.remove(physicsWorld.value, testBodies)
    console.log('🧹 Removed test objects:', testBodies.length)
  }
}

// Click/Touch handler for dropping test objects
const handleCanvasClick = (event) => {
  if (!physicsWorld.value || !gameCanvas.value) return

  const rect = gameCanvas.value.querySelector('canvas')?.getBoundingClientRect()
  if (!rect) return

  const x = event.clientX - rect.left
  const y = 50 // Drop from top

  // Create new test circle at click position
  const newCircle = Matter.Bodies.circle(x, y, 15 + Math.random() * 10, {
    restitution: 0.7,
    render: {
      fillStyle: `hsl(${Math.random() * 360}, 70%, 50%)`,
      strokeStyle: '#000',
      lineWidth: 1
    }
  })

  Matter.World.add(physicsWorld.value, newCircle)
  console.log('🎯 Dropped test object at:', { x, y })
}

// Start physics simulation
const startPhysics = () => {
  if (!physicsEngine.value || !physicsRender.value || !physicsRunner.value) {
    console.warn('Physics not initialized')
    return false
  }

  Matter.Render.run(physicsRender.value)
  Matter.Runner.run(physicsRunner.value, physicsEngine.value)

  // Add test objects for demo (T1.4: Basic Physics Test)
  if (props.isDev && props.isGameActive) { // →
    setTimeout(() => {
      createTestObjects()
    }, 500) // Delay to let physics settle
  }

  console.log('▶️ Physics simulation started')
  return true
}

// Stop physics simulation
const stopPhysics = () => {
  if (physicsRender.value) {
    Matter.Render.stop(physicsRender.value)
  }
  if (physicsRunner.value) {
    Matter.Runner.stop(physicsRunner.value)
  }

  console.log('⏹️ Physics simulation stopped')
}

// Cleanup physics resources
const cleanupPhysics = () => {
  stopPhysics()

  if (physicsRender.value) {
    Matter.Render.stop(physicsRender.value)
    physicsRender.value.canvas.remove()
    physicsRender.value = null
  }

  if (physicsEngine.value) {
    Matter.World.clear(physicsWorld.value)
    Matter.Engine.clear(physicsEngine.value)
    physicsEngine.value = null
    physicsWorld.value = null
  }

  if (physicsRunner.value) {
    physicsRunner.value = null
  }

  console.log('🧹 Physics resources cleaned up')
}

// Events emitted to parent component
const emit = defineEmits([
  'pause-game',
  'resume-game',
  'back-to-level-selection',
  'debug-complete-level'
])

// Format numbers for display
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${Math.floor(num / 100) / 10}k`
  }
  return num.toString()
}

// Event handlers
const handlePauseGame = () => {
  console.log('🎮 Pause game requested from GamePlayArea')
  stopPhysics()
  emit('pause-game')
}

const handleResumeGame = () => {
  console.log('🎮 Resume game requested from GamePlayArea')
  startPhysics()
  emit('resume-game')
}

const handleBackToLevelSelection = () => {
  console.log('🔙 Back to level selection requested from GamePlayArea')
  emit('back-to-level-selection')
}

const handleDebugCompleteLevel = () => {
  console.log('🏁 Debug complete level requested from GamePlayArea')
  emit('debug-complete-level')
}

// Debug Functions (DEV only)
const handleDebugAddTestObjects = () => {
  if (props.isDev) { // →
    createTestObjects()
  }
}

const handleDebugClearObjects = () => {
  if (props.isDev) { // →
    removeTestObjects()
  }
}

const handleDebugPhysicsInfo = () => {
  if (props.isDev && physicsEngine.value) { // →
    const bodies = Matter.Composite.allBodies(physicsWorld.value)
    console.log('🔧 Physics Debug Info:', {
      engine: !!physicsEngine.value,
      world: !!physicsWorld.value,
      render: !!physicsRender.value,
      runner: !!physicsRunner.value,
      totalBodies: bodies.length,
      staticBodies: bodies.filter(b => b.isStatic).length,
      dynamicBodies: bodies.filter(b => !b.isStatic).length,
      gravity: physicsEngine.value.world.gravity
    })
  }
}

// Computed game status text
const gameStatusTitle = computed(() => {
  if (props.isGamePaused) {
    return '⏸️ Game Paused'
  }
  return `🎮 Playing Level ${props.currentLevel}`
})

const gameStatusSubtitle = computed(() => {
  if (props.isGamePaused) {
    return 'Game is paused'
  }
  return 'Game is active'
})

// Show game info when game is active or paused
const showGameInfo = computed(() => {
  return props.isGameActive || props.isGamePaused
})

// Lifecycle Management
onMounted(async () => {
  console.log('🎮 GamePlayArea mounted, initializing physics...')

  const success = await initPhysics()
  if (success && props.isGameActive) {
    startPhysics()
  }
})

onUnmounted(() => {
  console.log('🎮 GamePlayArea unmounting, cleaning up physics...')
  cleanupPhysics()
})

// Watch for game state changes
watch(() => props.isGameActive, (isActive) => {
  if (isActive && physicsEngine.value) {
    startPhysics()
  } else {
    stopPhysics()
  }
})

watch(() => props.isGamePaused, (isPaused) => {
  if (isPaused) {
    stopPhysics()
  } else if (props.isGameActive) {
    startPhysics()
  }
})

</script>

<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">
      <!-- Game Status Display -->
      <div class="game-play-area__game-status">
        <h3 class="game-play-area__status-title">
          {{ gameStatusTitle }}
        </h3>
        <div v-if="showGameInfo" class="game-play-area__game-info">
          <p>Score: {{ formatNumber(currentSession.score) }}</p>
          <p>Moves: {{ currentSession.moves }}</p>
          <p>Time: {{ formattedGameTime }}</p>
        </div>
      </div>

      <!-- Physics Game Area -->
      <div class="game-play-area__game-physics">
        <!-- Physics Canvas Container -->
        <div
          ref="gameCanvas"
          class="game-play-area__canvas-container"
          :class="{
            'game-play-area__canvas-container--paused': isGamePaused,
            'game-play-area__canvas-container--active': isGameActive
          }"
          @click="handleCanvasClick"
        >
          <!-- Canvas wird von Matter.js hier eingefügt -->
        </div>

        <!-- Physics Debug Info (DEV only) -->
        <div v-if="props.isDev" class="game-play-area__physics-debug"> <!-- → -->
          <p>Engine: {{ physicsEngine ? '✅' : '❌' }}</p>
          <p>Render: {{ physicsRender ? '✅' : '❌' }}</p>
          <p>Runner: {{ physicsRunner ? '✅' : '❌' }}</p>
          <div class="game-play-area__debug-controls">
            <button @click="handleDebugAddTestObjects" class="btn btn--small">
              🧪 Add Objects
            </button>
            <button @click="handleDebugClearObjects" class="btn btn--small">
              🧹 Clear Objects
            </button>
            <button @click="handleDebugPhysicsInfo" class="btn btn--small">
              📊 Physics Info
            </button>
          </div>
        </div>
      </div>
      <!-- Original placeholder als fallback -->
      <div v-if="!physicsEngine" class="game-play-area__game-placeholder">
        <p class="game-play-area__placeholder-text">
          Initializing Physics Engine...
        </p>
        <p class="game-play-area__placeholder-subtitle">
          {{ gameStatusSubtitle }}
        </p>

        <!-- Game Controls -->
        <div class="game-play-area__game-controls">
          <!-- Pause/Resume Controls -->
          <button
            v-if="!isGamePaused"
            @click="handlePauseGame"
            class="btn"
            :disabled="!isGameActive"
          >
            ⏸️ Pause Game
          </button>
          <button
            v-else
            @click="handleResumeGame"
            class="btn"
          >
            ▶️ Resume Game
          </button>

          <!-- Navigation Control -->
          <button
            @click="handleBackToLevelSelection"
            class="btn btn--ghost"
          >
            🔙 Back to Level Selection
          </button>

          <!-- Debug complete button (DEV only) -->
          <button
            v-if="isDev"
            @click="handleDebugCompleteLevel"
            class="btn btn--small"
            style="margin-top: 1rem;"
          >
            🏁 Complete Level (DEBUG)
          </button>
        </div>
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
  padding: var(--space-4);

  // Game Container Element
  &__game-container {
    width: 100%;
    max-width: 500px;
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--card-shadow);
    overflow: hidden;

    @media (min-width: vars.$breakpoint-md) {
      max-width: 600px;
    }
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

  // Game Placeholder Element (will be replaced with actual game)
  &__game-placeholder {
    padding: var(--space-6);
    text-align: center;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__placeholder-text {
    margin-bottom: var(--space-2);
    font-size: var(--font-size-lg);
    color: var(--text-color);
    font-weight: 600;
  }

  &__placeholder-subtitle {
    margin-bottom: var(--space-4);
    font-size: var(--font-size-base);
    color: var(--text-secondary);
  }

  // Game Controls Element
  &__game-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    align-items: center;
    width: 100%;
    max-width: 200px;

    @media (min-width: vars.$breakpoint-md) {
      flex-direction: row;
      max-width: none;
      gap: var(--space-4);
    }
  }

  // Physics Game Area Element
  &__game-physics {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  // Canvas Container Element
  &__canvas-container {
    border: 2px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    background-color: var(--bg-secondary);
    overflow: hidden;
    position: relative;
    cursor: pointer; // →

    &:hover {
      border-color: var(--accent-color); // →
    }

    canvas {
      display: block;
      border-radius: var(--border-radius-lg);
    }

    &--paused {
      opacity: 0.7;
      filter: grayscale(0.3);
      cursor: not-allowed; // →
    }

    &--active {
      box-shadow: 0 0 20px rgba(0, 184, 148, 0.3);
    }
  }

  // Physics Debug Element (DEV only)
  &__physics-debug {
    margin-top: var(--space-2);
    padding: var(--space-2);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: var(--border-radius-md);
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-xs);

    p {
      margin: 0;
      line-height: 1.2;
    }
  }

  &__debug-controls {
    display: flex;
    gap: var(--space-1);
    margin-top: var(--space-2);
    flex-wrap: wrap;

    button {
      font-size: 10px;
      padding: var(--space-1) var(--space-2);
    }
  }
}

// Responsive adjustments
@media (min-width: vars.$breakpoint-md) {
  .game-play-area {
    padding: var(--space-8);
  }
}

// Game state specific styling
.game-play-area__game-container {
  // Paused state styling
  &[data-game-paused="true"] {
    opacity: 0.8;

    .game-play-area__game-placeholder {
      filter: grayscale(0.3);
    }
  }
}

</style>