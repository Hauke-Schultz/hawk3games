<script setup>
import {computed, ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import Matter from 'matter-js'
import FruitDropPreview from '../FruitDropPreview/FruitDropPreview.vue'

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
const dropPreviewPosition = ref(null)
const isPointerDown = ref(false)
const canDrop = ref(true)
const dropCooldown = 500 // Milliseconds between drops
let dropCooldownTimer = null

// Touch tracking for mobile
const lastTouchPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)

// Physics configuration
const PHYSICS_CONFIG = {
  canvas: {
    width: 400,
    height: 500
  },
  dropZone: {
    minX: 30, // Safe margin from walls
    maxX: 370, // Canvas width - safe margin
    dropY: 50  // Drop height
  },
  engine: {
    gravity: { x: 0, y: 0.8 },
    enableSleeping: true,
    velocityIterations: 4,    // Reduziert von 6
    positionIterations: 2,    // Reduziert von 6
    constraintIterations: 1   // Neu hinzugefügt
  },
  render: {
    wireframes: false,
    background: 'transparent',
    showVelocity: false,
    showAngleIndicator: false,
    pixelRatio: 1,           // Fixiere Pixel Ratio
    hasBounds: true          // Aktiviere Bounds für bessere Performance
  }
}

// Fruit Configuration System
const FRUIT_TYPES = {
  CHERRY: {
    id: 1,
    emoji: '🍒',
    radius: 15,
    nextType: 'STRAWBERRY',
    color: '#ff6b6b',
    scoreValue: 10
  },
  STRAWBERRY: {
    id: 2,
    emoji: '🍓',
    radius: 18,
    nextType: 'GRAPE',
    color: '#ff8787',
    scoreValue: 25
  },
  GRAPE: {
    id: 3,
    emoji: '🍇',
    radius: 22,
    nextType: 'ORANGE',
    color: '#845ec2',
    scoreValue: 50
  },
  ORANGE: {
    id: 4,
    emoji: '🍊',
    radius: 26,
    nextType: 'APPLE',
    color: '#ffa726',
    scoreValue: 100
  },
  APPLE: {
    id: 5,
    emoji: '🍎',
    radius: 30,
    nextType: 'PEAR',
    color: '#e53e3e',
    scoreValue: 200
  },
  PEAR: {
    id: 6,
    emoji: '🍐',
    radius: 34,
    nextType: 'PINEAPPLE',
    color: '#38a169',
    scoreValue: 400
  },
  PINEAPPLE: {
    id: 7,
    emoji: '🍍',
    radius: 38,
    nextType: 'MELON',
    color: '#d69e2e',
    scoreValue: 800
  },
  MELON: {
    id: 8,
    emoji: '🍉',
    radius: 42,
    nextType: 'COCONUT',
    color: '#38b2ac',
    scoreValue: 1600
  },
  COCONUT: {
    id: 9,
    emoji: '🥥',
    radius: 46,
    nextType: null,
    color: '#8b4513',
    scoreValue: 3200
  }
}

// Fruit spawning probability (for random drops)
const FRUIT_SPAWN_WEIGHTS = {
  CHERRY: 0.4,      // 40% chance
  STRAWBERRY: 0.3,  // 30% chance
  GRAPE: 0.2,       // 20% chance
  ORANGE: 0.1       // 10% chance
  // Higher fruits only through merging
}

const fruits = ref([])
const nextFruitType = ref('CHERRY')
const gameOverHeight = 100 // Game over if fruit reaches this height

let performanceRunning = false

const monitorPerformance = () => {
  if (!performanceRunning) {
    performanceRunning = true
    console.log('📊 Performance monitoring started')
  }

  // Nur weiterlaufen wenn Physics Engine noch aktiv ist
  if (physicsEngine.value && performanceRunning) {
    requestAnimationFrame(monitorPerformance)
  } else {
    performanceRunning = false
    console.log('📊 Performance monitoring stopped')
  }
}

// Enhanced Touch/Click Event Handlers
const getCanvasPosition = (event) => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return null

  const rect = canvas.getBoundingClientRect()

  // Handle both mouse and touch events
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  const x = clientX - rect.left
  const y = clientY - rect.top

  // Clamp to drop zone boundaries
  const clampedX = Math.max(
    PHYSICS_CONFIG.dropZone.minX,
    Math.min(PHYSICS_CONFIG.dropZone.maxX, x)
  )

  return { x: clampedX, y }
}

const getPhysicsState = () => {
  return {
    engine: physicsEngine.value,
    world: physicsWorld.value,
    render: physicsRender.value,
    runner: physicsRunner.value,
    canDrop: canDrop.value,
    dropPreviewPosition: dropPreviewPosition.value
  }
}

const handlePointerMove = (event) => {
  if (!props.isGameActive) return

  const position = getCanvasPosition(event)
  if (position) {
    dropPreviewPosition.value = position.x
    lastTouchPosition.value = position
  }
}

const handlePointerDown = (event) => {
  if (!props.isGameActive || !canDrop.value) return

  event.preventDefault()
  isPointerDown.value = true

  const position = getCanvasPosition(event)
  if (position) {
    dropPreviewPosition.value = position.x
    lastTouchPosition.value = position
  }
}

const handlePointerUp = (event) => {
  if (!props.isGameActive || !canDrop.value || !isPointerDown.value) return

  event.preventDefault()
  isPointerDown.value = false

  const position = getCanvasPosition(event)
  if (position) {
    performDrop(position.x)
  }
}

const handlePointerLeave = () => {
  dropPreviewPosition.value = null
  isPointerDown.value = false
  isDragging.value = false
}

// Touch-specific handlers for mobile optimization
const handleTouchStart = (event) => {
  isDragging.value = false
  handlePointerDown(event)
}

const handleTouchMove = (event) => {
  if (!isPointerDown.value) return

  event.preventDefault() // Prevent scrolling
  isDragging.value = true
  handlePointerMove(event)
}

const handleTouchEnd = (event) => {
  if (isDragging.value) {
    handlePointerUp(event)
  }
  isDragging.value = false
}

// Drop functionality with cooldown
const performDrop = (x) => {
  if (!canDrop.value || !physicsWorld.value) return

  // Start cooldown
  canDrop.value = false

  // Drop the fruit
  const droppedFruit = dropNextFruit(x)

  if (droppedFruit) {
    // Emit move event for session tracking
    emit('move-made')

    // Visual feedback
    createDropFeedback(x)

    // Check for game over after a delay
    setTimeout(() => {
      checkGameOver()
    }, 1000)
  }

  // Reset cooldown
  if (dropCooldownTimer) {
    clearTimeout(dropCooldownTimer)
  }

  dropCooldownTimer = setTimeout(() => {
    canDrop.value = true
  }, dropCooldown)

  // Hide preview
  dropPreviewPosition.value = null
}

// Visual drop feedback
const createDropFeedback = (x) => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Simple ring effect
  let radius = 10
  const maxRadius = 30
  const animateRing = () => {
    if (radius > maxRadius) return

    ctx.save()
    ctx.globalAlpha = 1 - (radius / maxRadius)
    ctx.strokeStyle = '#00b894'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, PHYSICS_CONFIG.dropZone.dropY, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    radius += 2
    requestAnimationFrame(animateRing)
  }

  animateRing()
}

// Physics Engine Initialization
const initPhysics = async () => {
  try {
    console.log('🔧 Initializing Matter.js physics engine...')

    // Create engine mit Performance-Optimierungen
    physicsEngine.value = Matter.Engine.create()
    physicsWorld.value = physicsEngine.value.world

    // Configure engine für bessere Performance
    physicsEngine.value.world.gravity.y = PHYSICS_CONFIG.engine.gravity.y
    physicsEngine.value.world.gravity.x = PHYSICS_CONFIG.engine.gravity.x
    physicsEngine.value.enableSleeping = PHYSICS_CONFIG.engine.enableSleeping

    // NEUE Performance-Optimierungen
    physicsEngine.value.velocityIterations = PHYSICS_CONFIG.engine.velocityIterations
    physicsEngine.value.positionIterations = PHYSICS_CONFIG.engine.positionIterations
    physicsEngine.value.constraintIterations = PHYSICS_CONFIG.engine.constraintIterations

    // Broadphase-Optimierung für bessere Collision Detection
    physicsEngine.value.broadphase.controller = Matter.Grid.create()

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

    // Setup fruit collision detection
    setupFruitCollisions()

    // Setup custom renderer for emojis // →
    setupCustomRenderer()

    // Initialize next fruit type // →
    nextFruitType.value = getRandomFruitType()

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

// Fruit Factory System (T2.1)
const createFruit = (x, y, fruitType, options = {}) => {
  const type = FRUIT_TYPES[fruitType]
  if (!type) {
    console.error('Invalid fruit type:', fruitType)
    return null
  }

  // Create Matter.js body mit Performance-Optimierungen
  const body = Matter.Bodies.circle(x, y, type.radius, {
    restitution: 0.4,
    friction: 0.3,
    frictionAir: 0.01,
    density: 0.001,
    // PERFORMANCE: Aktiviere Sleeping für statische Früchte
    sleepThreshold: 60,      // Schneller schlafen
    sleepTimeScale: 1,       // Normal sleep time
    render: {
      fillStyle: type.color,
      strokeStyle: '#333',
      lineWidth: 2
    },
    ...options
  })

  // Add custom properties
  body.fruitType = fruitType
  body.fruitData = {
    id: crypto.randomUUID(),
    type: fruitType,
    emoji: type.emoji,
    scoreValue: type.scoreValue,
    createdAt: Date.now(),
    hasBeenMerged: false
  }

  // Add to fruits tracking array
  fruits.value.push({
    id: body.fruitData.id,
    body: body,
    type: fruitType,
    data: body.fruitData
  })

  console.log(`🍎 Created ${fruitType} fruit at (${x}, ${y})`)
  return body
}

// Get random fruit type for spawning
const getRandomFruitType = () => {
  const random = Math.random()
  let cumulative = 0

  for (const [type, weight] of Object.entries(FRUIT_SPAWN_WEIGHTS)) {
    cumulative += weight
    if (random <= cumulative) {
      return type
    }
  }

  return 'CHERRY' // Fallback
}

// Remove fruit from tracking
const removeFruit = (fruitBody) => {
  const index = fruits.value.findIndex(f => f.body === fruitBody)
  if (index > -1) {
    const fruit = fruits.value[index]
    fruits.value.splice(index, 1)
    console.log(`🗑️ Removed ${fruit.type} fruit (index: ${index})`)
    return fruit
  }
  console.warn('⚠️ Fruit not found for removal:', fruitBody.fruitType)
  return null
}

// Clear all fruits
const clearAllFruits = () => {
  if (!physicsWorld.value) return

  const fruitBodies = fruits.value.map(f => f.body)
  if (fruitBodies.length > 0) {
    Matter.World.remove(physicsWorld.value, fruitBodies)
    fruits.value = []
    console.log('🧹 Cleared all fruits')
  }
}

// Get fruit by Matter.js body
const getFruitByBody = (body) => {
  return fruits.value.find(f => f.body === body)
}

// Get next fruit type in progression chain
const getNextFruitType = (currentType) => {
  const type = FRUIT_TYPES[currentType]
  return type?.nextType || null
}

// Start physics simulation
const startPhysics = () => {
  if (!physicsEngine.value || !physicsRender.value || !physicsRunner.value) {
    console.warn('Physics not initialized')
    return false
  }

  Matter.Render.run(physicsRender.value)

  // Verwende einen Custom Runner für bessere Performance-Kontrolle
  const runner = physicsRunner.value
  runner.fps = 60           // Fixiere auf 60 FPS
  runner.deltaSampleSize = 8  // Reduziere Delta Samples
  runner.delta = 1000 / 60    // Fixiere Delta Time

  Matter.Runner.run(runner, physicsEngine.value)

  // STARTE PERFORMANCE MONITORING
  if (props.isDev) {
    monitorPerformance()
    console.log('📊 Performance monitoring started')
  }

  console.log('▶️ Physics simulation started and ready for interaction')
  return true
}

// Fruit Collision Detection (T2.2)
const setupFruitCollisions = () => {
  if (!physicsEngine.value) return

  // Performance: Throttle collision events
  let lastCollisionCheck = 0
  const COLLISION_THROTTLE = 16 // ~60fps

  // Listen for collision events
  Matter.Events.on(physicsEngine.value, 'collisionStart', (event) => {
    const now = Date.now()
    if (now - lastCollisionCheck < COLLISION_THROTTLE) return
    lastCollisionCheck = now

    event.pairs.forEach(pair => {
      const { bodyA, bodyB } = pair

      // Check if both bodies are fruits
      if (bodyA.fruitType && bodyB.fruitType) {
        handleFruitCollision(bodyA, bodyB)
      }
    })
  })

  console.log('🔧 Optimized fruit collision detection setup')
}

// Visual Fruit Rendering System (T2.3)
const setupCustomRenderer = () => {
  if (!physicsRender.value || !physicsEngine.value) return

  // Custom render function for fruits with emojis
  const originalRender = physicsRender.value.canvas.getContext('2d')

  // Override Matter.js render to add emoji rendering
  Matter.Events.on(physicsRender.value, 'afterRender', () => {
    renderFruitEmojis(originalRender)
  })

  console.log('🎨 Custom fruit renderer setup')
}

// Render emoji overlays on fruits
// Render emoji overlays auf fruits - OPTIMIERT
const renderFruitEmojis = (ctx) => {
  if (!ctx || fruits.value.length === 0) return

  // Batch alle Rendering-Operationen
  ctx.save()

  // Performance: Setze einmal für alle Früchte
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  fruits.value.forEach(fruit => {
    const body = fruit.body

    // Skip if fruit is sleeping (Performance!)
    if (body.isSleeping) return

    const { x, y } = body.position
    const { emoji, type } = fruit.data
    const fruitType = FRUIT_TYPES[type]

    if (!fruitType) return

    // Nur rendern wenn Frucht sich bewegt oder sichtbar ist
    const isMoving = Math.abs(body.velocity.x) > 0.1 || Math.abs(body.velocity.y) > 0.1
    const isVisible = y < PHYSICS_CONFIG.canvas.height + 50 && y > -50

    if (!isVisible) return

    const fontSize = fruitType.radius * 1.2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(body.angle)
    ctx.font = `${fontSize}px Arial`
    ctx.fillText(emoji, 0, 0)
    ctx.restore()
  })

  ctx.restore()
}

// Visual effect for merging
const createMergeEffect = (x, y, fruitType) => {
  if (!physicsRender.value) return

  const ctx = physicsRender.value.canvas.getContext('2d')
  if (!ctx) return

  // Create particle effect
  const particles = []
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1.0,
      color: FRUIT_TYPES[fruitType]?.color || '#ffff00'
    })
  }

  // Animate particles
  const animateParticles = () => {
    ctx.save()

    particles.forEach(particle => {
      if (particle.life <= 0) return

      ctx.globalAlpha = particle.life
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
      ctx.fill()

      // Update particle
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.3 // Gravity
      particle.life -= 0.05
    })

    ctx.restore()

    // Continue animation if particles are alive
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(animateParticles)
    }
  }

  animateParticles()
  console.log(`✨ Merge effect created for ${fruitType}`)
}

// Handle fruit collision and potential merging
const handleFruitCollision = (fruitA, fruitB) => {
  // Prüfe ob beide Früchte noch existieren
  const fruitAExists = fruits.value.find(f => f.body === fruitA)
  const fruitBExists = fruits.value.find(f => f.body === fruitB)

  if (!fruitAExists || !fruitBExists) {
    return // Früchte bereits entfernt
  }

  // Nur mergen wenn gleicher Typ und noch nicht merged
  if (fruitA.fruitType === fruitB.fruitType &&
    !fruitA.fruitData.hasBeenMerged &&
    !fruitB.fruitData.hasBeenMerged) {

    console.log(`💥 ${fruitA.fruitType} collision detected!`)

    // SOFORTIGER Merge ohne setTimeout um Race Conditions zu vermeiden
    mergeFruits(fruitA, fruitB)
  }
}

// Merge two fruits into next type
const mergeFruits = (fruitA, fruitB) => {
  if (!physicsWorld.value) return

  // Sofortige Überprüfung: Sind die Früchte bereits entfernt?
  const fruitAExists = fruits.value.find(f => f.body === fruitA)
  const fruitBExists = fruits.value.find(f => f.body === fruitB)

  if (!fruitAExists || !fruitBExists) {
    console.log('⚠️ Merge cancelled: One fruit already removed')
    return
  }

  // Markiere als merged BEVOR wir sie aus der Physics-Welt entfernen
  fruitA.fruitData.hasBeenMerged = true
  fruitB.fruitData.hasBeenMerged = true

  const fruitType = fruitA.fruitType
  const nextType = getNextFruitType(fruitType)

  if (!nextType) {
    console.log(`🏆 Max fruit reached: ${fruitType}`)
    return
  }

  // Berechne Merge-Position
  const mergeX = (fruitA.position.x + fruitB.position.x) / 2
  const mergeY = (fruitA.position.y + fruitB.position.y) / 2

  // SOFORT aus Physics World und Tracking entfernen
  Matter.World.remove(physicsWorld.value, [fruitA, fruitB])

  // Entferne aus unserem Tracking Array
  const indexA = fruits.value.findIndex(f => f.body === fruitA)
  const indexB = fruits.value.findIndex(f => f.body === fruitB)

  if (indexA > -1) fruits.value.splice(indexA, 1)
  if (indexB > -1) {
    // Nach dem ersten splice könnte sich der Index geändert haben
    const newIndexB = fruits.value.findIndex(f => f.body === fruitB)
    if (newIndexB > -1) fruits.value.splice(newIndexB, 1)
  }

  // Visueller Effekt
  createMergeEffect(mergeX, mergeY, nextType)

  // Erstelle neues Fruit mit leichtem Delay für bessere Physik
  setTimeout(() => {
    const newFruit = createFruit(mergeX, mergeY, nextType, {
      velocity: { x: 0, y: -2 }
    })

    if (newFruit) {
      Matter.World.add(physicsWorld.value, newFruit)

      // Score berechnen
      const baseScore = FRUIT_TYPES[nextType].scoreValue
      console.log(`🎉 Merged ${fruitType} → ${nextType} (+${baseScore} points)`)

      // Emit score update if needed
      // emit('score-update', baseScore)
    }
  }, 100) // Kurzes Delay für stabilere Physik
}

// Game Logic and Fruit Type System (T2.4)
const dropNextFruit = (x) => {
  if (!physicsWorld.value) return null

  const dropY = 50
  const fruitType = nextFruitType.value

  // Create and drop fruit
  const newFruit = createFruit(x, dropY, fruitType, {
    isSleeping: false
  })

  if (newFruit) {
    Matter.World.add(physicsWorld.value, newFruit)

    // Generate next fruit type
    nextFruitType.value = getRandomFruitType()

    // Update moves counter
    if (props.currentSession) {
      emit('move-made')
    }

    console.log(`🎯 Dropped ${fruitType} at x:${x}, next: ${nextFruitType.value}`)
    return newFruit
  }

  return null
}

// Check for game over condition
const checkGameOver = () => {
  if (!physicsWorld.value) return false

  // Check if any fruits are above the game over line
  const gameOverFruits = fruits.value.filter(fruit => {
    return fruit.body.position.y <= gameOverHeight
  })

  if (gameOverFruits.length > 0) {
    // Give a grace period for fruits to settle
    setTimeout(() => {
      const stillAbove = fruits.value.filter(fruit => {
        return fruit.body.position.y <= gameOverHeight &&
          Math.abs(fruit.body.velocity.y) < 0.1 // Not moving much
      })

      if (stillAbove.length > 0) {
        handleGameOver()
      }
    }, 2000) // 2 second grace period

    return true
  }

  return false
}

// Handle game over
const handleGameOver = () => {
  console.log('💀 GAME OVER!')

  // Stop physics
  stopPhysics()

  // Emit game over event
  emit('game-over', {
    finalScore: props.currentSession?.score || 0,
    totalMoves: props.currentSession?.moves || 0,
    fruits: fruits.value.length
  })
}

// Get fruit statistics
const getFruitStatistics = () => {
  const stats = {}

  Object.keys(FRUIT_TYPES).forEach(type => {
    stats[type] = fruits.value.filter(f => f.type === type).length
  })

  return {
    totalFruits: fruits.value.length,
    byType: stats,
    highestType: getHighestFruitType(),
    nextDrop: nextFruitType.value
  }
}

// Get highest fruit type currently in game
const getHighestFruitType = () => {
  if (fruits.value.length === 0) return null

  let highest = null
  let highestId = 0

  fruits.value.forEach(fruit => {
    const typeId = FRUIT_TYPES[fruit.type]?.id || 0
    if (typeId > highestId) {
      highestId = typeId
      highest = fruit.type
    }
  })

  return highest
}

// Stop physics simulation
const stopPhysics = () => {
  if (physicsRender.value) {
    Matter.Render.stop(physicsRender.value)
  }
  if (physicsRunner.value) {
    Matter.Runner.stop(physicsRunner.value)
  }

  // STOPPE PERFORMANCE MONITORING
  console.log('📊 Performance monitoring stopped')
  console.log('⏹️ Physics simulation stopped')
}

// Cleanup physics resources
const cleanupPhysics = () => {
  // STOPPE PERFORMANCE MONITORING
  performanceRunning = false

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
  'move-made',
  'debug-add-test-objects',
  'debug-clear-objects',
  'debug-physics-info'
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

// Debug Functions (DEV only)
const handleDebugAddTestObjects = () => {
  if (props.isDev) {
    createTestObjects()
    emit('debug-add-test-objects') // Benachrichtige DebugPanel
  }
}

const handleDebugClearObjects = () => {
  if (props.isDev) {
    removeTestObjects()
    emit('debug-clear-objects') // Benachrichtige DebugPanel
  }
}


const handleDebugPhysicsInfo = () => {
  if (props.isDev && physicsEngine.value) {
    const bodies = Matter.Composite.allBodies(physicsWorld.value)

    const debugInfo = {
      engine: !!physicsEngine.value,
      world: !!physicsWorld.value,
      render: !!physicsRender.value,
      runner: !!physicsRunner.value,
      totalBodies: bodies.length,
      staticBodies: bodies.filter(b => b.isStatic).length,
      dynamicBodies: bodies.filter(b => !b.isStatic).length,
      gravity: physicsEngine.value.world.gravity,
      fruits: fruits.value.length,
      performanceRunning: performanceRunning
    }

    console.log('🔧 Physics Debug Info:', debugInfo)
    emit('debug-physics-info', debugInfo) // Sende Info an DebugPanel
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

defineExpose({
  // Physics state
  physicsEngine,
  physicsWorld,
  physicsRender,
  physicsRunner,
  canDrop,
  dropPreviewPosition,

  // Debug functions
  handleDebugAddTestObjects,
  handleDebugClearObjects,
  handleDebugPhysicsInfo,
  getPhysicsState
})
</script>

<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">

      <!-- Fruit Drop Preview -->
      <FruitDropPreview
        :next-fruit-type="nextFruitType"
        :canvas-width="PHYSICS_CONFIG.canvas.width"
        :is-game-active="isGameActive"
        :drop-position="dropPreviewPosition"
      />

      <!-- Physics Game Area -->
      <div class="game-play-area__game-physics">
        <!-- Physics Canvas Container -->
        <div
          ref="gameCanvas"
          class="game-play-area__canvas-container"
          :class="{
            'game-play-area__canvas-container--paused': isGamePaused,
            'game-play-area__canvas-container--active': isGameActive && canDrop,
            'game-play-area__canvas-container--cooldown': !canDrop
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
          <!-- Drop Zone Indicator -->
          <div
            v-if="isGameActive"
            class="game-play-area__drop-zone"
          ></div>

          <!-- Canvas wird von Matter.js hier eingefügt -->
        </div>

        <!-- Touch Feedback -->
        <div
          v-if="isPointerDown && dropPreviewPosition"
          class="game-play-area__touch-feedback"
          :style="{
            left: `${dropPreviewPosition}px`,
            top: '50px'
          }"
        ></div>

        <!-- Drop Cooldown Indicator -->
        <div
          v-if="!canDrop"
          class="game-play-area__cooldown-indicator"
        >
          <span>⏳ Wait {{ Math.ceil(dropCooldown / 1000) }}s...</span>
        </div>
      </div>

      <!-- Fallback für nicht-initialisierte Physics -->
      <div v-if="!physicsEngine" class="game-play-area__game-placeholder">
        <p class="game-play-area__placeholder-text">
          Initializing Physics Engine...
        </p>
        <p class="game-play-area__placeholder-subtitle">
          {{ gameStatusSubtitle }}
        </p>

        <!-- Basic Game Controls -->
        <div class="game-play-area__game-controls">
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

          <button
            @click="handleBackToLevelSelection"
            class="btn btn--ghost"
          >
            🔙 Back to Level Selection
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

  // Game Placeholder Element (fallback während Physics-Init)
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

  // Game Controls Element - VEREINFACHT
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
    position: relative;
  }

  // Canvas Container Element
  &__canvas-container {
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

    canvas {
      display: block;
      border-radius: var(--border-radius-lg);
    }

    &--paused {
      opacity: 0.7;
      filter: grayscale(0.3);
      cursor: not-allowed;
    }

    &--cooldown {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &--active {
      box-shadow: 0 0 20px rgba(0, 184, 148, 0.3);
      cursor: crosshair;
    }
  }

  // Drop zone indicator
  &__drop-zone {
    position: absolute;
    top: 0;
    left: 30px;
    right: 30px;
    height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--accent-color) 50%,
      transparent 100%
    );
    opacity: 0.6;
    pointer-events: none;
    z-index: 5;
  }

  // Touch feedback
  &__touch-feedback {
    position: absolute;
    width: 20px;
    height: 20px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.8;
    pointer-events: none;
    transform: translate(-50%, -50%);
    animation: touch-pulse 0.3s ease-out;
    z-index: 10;
  }

  // Drop cooldown indicator
  &__cooldown-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(253, 203, 110, 0.9);
    color: var(--text-color);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-xs);
    font-weight: bold;
    z-index: 15;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    span {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
  }
}

// Animations
@keyframes touch-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
}

// Responsive adjustments
@media (min-width: vars.$breakpoint-md) {
  .game-play-area {
    padding: var(--space-8);

    &__game-status {
      padding: var(--space-6);
    }

    &__game-placeholder {
      padding: var(--space-8);
    }
  }
}

// Game state specific styling
.game-play-area__game-container {
  // Paused state styling
  &[data-game-paused="true"] {
    .game-play-area__canvas-container {
      filter: grayscale(0.5);
    }
  }

  // Active state styling
  &[data-game-active="true"] {
    .game-play-area__canvas-container {
      border-color: var(--accent-color);
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .game-play-area__touch-feedback {
    animation: none;
  }

  .game-play-area__canvas-container:hover {
    transform: none;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .game-play-area {
    &__canvas-container {
      border-width: 3px;
    }

    &__drop-zone {
      height: 3px;
      opacity: 1;
    }

    &__cooldown-indicator {
      border: 2px solid var(--text-color);
    }
  }
}
</style>