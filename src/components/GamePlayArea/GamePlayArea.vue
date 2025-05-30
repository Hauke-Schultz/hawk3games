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
const dropPreviewPosition = ref(null)
const isPointerDown = ref(false)
const canDrop = ref(true)
const activeFruit = ref(null)
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
    minX: 35,
    maxX: 365,
    dropY: 50
  },
  engine: {
    gravity: { x: 0, y: 0.8 },
    enableSleeping: true,
    velocityIterations: 4,
    positionIterations: 2,
    constraintIterations: 1
  },
  render: {
    wireframes: false,
    background: 'transparent',
    showVelocity: false,
    showAngleIndicator: false,
    pixelRatio: 1,
    hasBounds: true
  },
  mobile: {
    touchTargetSize: 44,
    doubleTapDelay: 300,
    longPressDelay: 500,
    dragThreshold: 10,
    hapticEnabled: true,
    swipeVelocityThreshold: 0.5
  }
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
    bounceScale: 1.1,
    sparkleColor: '#c5dbff'
  },
  STRAWBERRY: {
    id: 2,
    emoji: '🍓',
    radius: 18,
    nextType: 'GRAPE',
    color: '#ff8787',
    scoreValue: 25,
    gradient: ['#ffab91', '#ff8787', '#f4511e'],
    shadow: '0 2px 8px rgba(244, 81, 30, 0.4)',
    glowColor: 'rgba(255, 135, 135, 0.6)',
    bounceScale: 1.1,
    sparkleColor: '#ffccbc'
  },
  GRAPE: {
    id: 3,
    emoji: '🍇',
    radius: 22,
    nextType: 'ORANGE',
    color: '#845ec2',
    scoreValue: 50,
    gradient: ['#b39ddb', '#845ec2', '#5e35b1'],
    shadow: '0 2px 8px rgba(94, 53, 177, 0.4)',
    glowColor: 'rgba(132, 94, 194, 0.6)',
    bounceScale: 1.15,
    sparkleColor: '#d1c4e9'
  },
  ORANGE: {
    id: 4,
    emoji: '🍊',
    radius: 26,
    nextType: 'APPLE',
    color: '#ffa726',
    scoreValue: 100,
    gradient: ['#ffcc02', '#ffa726', '#ff9800'],
    shadow: '0 2px 8px rgba(255, 152, 0, 0.4)',
    glowColor: 'rgba(255, 167, 38, 0.6)',
    bounceScale: 1.15,
    sparkleColor: '#ffe0b2'
  },
  APPLE: {
    id: 5,
    emoji: '🍎',
    radius: 30,
    nextType: 'PEAR',
    color: '#e53e3e',
    scoreValue: 200,
    gradient: ['#ef5350', '#e53e3e', '#c62828'],
    shadow: '0 3px 12px rgba(198, 40, 40, 0.5)',
    glowColor: 'rgba(229, 62, 62, 0.7)',
    bounceScale: 1.2,
    sparkleColor: '#ffcdd2'
  },
  PEAR: {
    id: 6,
    emoji: '🍐',
    radius: 34,
    nextType: 'PINEAPPLE',
    color: '#38a169',
    scoreValue: 400,
    gradient: ['#66bb6a', '#38a169', '#2e7d32'],
    shadow: '0 3px 12px rgba(46, 125, 50, 0.5)',
    glowColor: 'rgba(56, 161, 105, 0.7)',
    bounceScale: 1.2,
    sparkleColor: '#c8e6c9'
  },
  PINEAPPLE: {
    id: 7,
    emoji: '🍍',
    radius: 38,
    nextType: 'MELON',
    color: '#d69e2e',
    scoreValue: 800,
    gradient: ['#ffd54f', '#d69e2e', '#f57f17'],
    shadow: '0 4px 16px rgba(245, 127, 23, 0.6)',
    glowColor: 'rgba(214, 158, 46, 0.8)',
    bounceScale: 1.25,
    sparkleColor: '#fff9c4'
  },
  MELON: {
    id: 8,
    emoji: '🍉',
    radius: 42,
    nextType: 'COCONUT',
    color: '#38b2ac',
    scoreValue: 1600,
    gradient: ['#4db6ac', '#38b2ac', '#00695c'],
    shadow: '0 4px 16px rgba(0, 105, 92, 0.6)',
    glowColor: 'rgba(56, 178, 172, 0.8)',
    bounceScale: 1.25,
    sparkleColor: '#b2dfdb'
  },
  COCONUT: {
    id: 9,
    emoji: '🥥',
    radius: 46,
    nextType: null,
    color: '#8b4513',
    scoreValue: 3200,
    gradient: ['#a1887f', '#8b4513', '#5d4037'],
    shadow: '0 5px 20px rgba(93, 64, 55, 0.7)',
    glowColor: 'rgba(139, 69, 19, 0.9)',
    bounceScale: 1.3,
    sparkleColor: '#d7ccc8'
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

// Mobile Performance Optimization
const mobileOptimizations = {
  reducedParticles: window.innerWidth < 768,
  lowPowerMode: navigator.hardwareConcurrency < 4,
  touchOptimized: 'ontouchstart' in window
}

// Adaptive particle count based on device
const getParticleCount = (baseCount) => {
  if (mobileOptimizations.reducedParticles) {
    return Math.max(3, Math.floor(baseCount * 0.6))
  }
  if (mobileOptimizations.lowPowerMode) {
    return Math.max(5, Math.floor(baseCount * 0.8))
  }
  return baseCount
}

// Preview position change effect
const createPreviewUpdateEffect = (x) => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let rippleRadius = 0
  const maxRadius = 15
  let opacity = 0.8

  const animatePreview = () => {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.strokeStyle = '#00cec9'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, PHYSICS_CONFIG.dropZone.dropY, rippleRadius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    rippleRadius += 2
    opacity -= 0.1

    if (rippleRadius < maxRadius && opacity > 0) {
      requestAnimationFrame(animatePreview)
    }
  }

  animatePreview()
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

// Enhanced Touch/Click Event Handlers - Immediate fruit creation on pointer down
const handlePointerDown = (event) => {
  if (!props.isGameActive || !canDrop.value) return

  event.preventDefault()
  isPointerDown.value = true

  const position = getCanvasPosition(event)
  if (position) {
    // Store the position where user wants to drop
    dropPreviewPosition.value = position.x
    lastTouchPosition.value = position

    // Visual feedback for touch start
    createTouchStartEffect(position.x, PHYSICS_CONFIG.dropZone.dropY)

    // Haptic feedback for modern browsers
    if (navigator.vibrate) {
      navigator.vibrate(5) // Short vibration
    }

    console.log(`👆 Fruit ready to drop at x: ${position.x}`)
  }
}

const handlePointerMove = (event) => {
  if (!props.isGameActive) return

  const position = getCanvasPosition(event)
  if (!position) return

  // Always update preview position (whether pressed or not)
  const oldPosition = dropPreviewPosition.value
  dropPreviewPosition.value = position.x
  lastTouchPosition.value = position

  // Smooth preview animation on position change
  if (oldPosition !== null && Math.abs(oldPosition - position.x) > 5) {
    createPreviewUpdateEffect(position.x)
  }

  // Create touch trail effect during drag
  if (isPointerDown.value) {
    createTouchTrailEffect(position.x, PHYSICS_CONFIG.dropZone.dropY)
  }
}

const handlePointerUp = (event) => {
  if (!props.isGameActive || !canDrop.value || !isPointerDown.value) return

  event.preventDefault()
  isPointerDown.value = false

  const position = getCanvasPosition(event)
  if (position && dropPreviewPosition.value) {
    // Create and drop the actual fruit at the preview position
    const droppedFruit = dropNextFruit(dropPreviewPosition.value)

    if (droppedFruit) {
      // Enhanced haptic feedback for successful drop
      if (navigator.vibrate) {
        navigator.vibrate([10, 5, 10]) // Pattern vibration
      }

      // Visual feedback for the drop
      createDropFeedback(dropPreviewPosition.value)

      // Emit move event for session tracking
      emit('move-made')

      // Check for game over after a delay
      setTimeout(() => {
        checkGameOver()
      }, 1000)

      console.log(`🎯 Dropped ${nextFruitType.value} at x: ${dropPreviewPosition.value}`)
    }

    // Start cooldown
    canDrop.value = false
    if (dropCooldownTimer) clearTimeout(dropCooldownTimer)
    dropCooldownTimer = setTimeout(() => {
      canDrop.value = true
    }, dropCooldown)
  }

  // Reset touch state
  isDragging.value = false
}

const handlePointerLeave = () => {
  //dropPreviewPosition.value = null
  isPointerDown.value = false
  isDragging.value = false
}

// Touch-specific handlers for mobile optimization

// Enhanced touch start with haptic feedback
const handleTouchStart = (event) => {
  if (preventMultiTouch(event) || !props.isGameActive || !canDrop.value) return

  event.preventDefault()

  const touch = event.touches[0]
  const position = getCanvasPosition(event)

  if (position) {
    touchState.value = {
      isActive: true,
      startTime: Date.now(),
      startPosition: position,
      currentPosition: position,
      hasMoved: false,
      tapCount: touchState.value.tapCount + 1,
      lastTapTime: Date.now()
    }

    // Haptic feedback für moderne Browser
    if (navigator.vibrate) {
      navigator.vibrate(5) // Kurze Vibration
    }

    // Visual feedback
    dropPreviewPosition.value = position.x
    createTouchStartEffect(position.x, position.y)
  }
}

// Enhanced touch move with gesture recognition
const handleTouchMove = (event) => {
  if (preventMultiTouch(event) || !touchState.value.isActive) return

  event.preventDefault()

  const position = getCanvasPosition(event)
  if (!position) return

  const deltaX = Math.abs(position.x - touchState.value.startPosition.x)
  const deltaY = Math.abs(position.y - touchState.value.startPosition.y)

  // Detect if user has moved enough to cancel tap
  if (deltaX > 10 || deltaY > 10) {
    touchState.value.hasMoved = true
  }

  touchState.value.currentPosition = position
  dropPreviewPosition.value = position.x

  // Smooth trail effect
  createTouchTrailEffect(position.x, position.y)
}

// Enhanced touch end with gesture completion
const handleTouchEnd = (event) => {
  if (!touchState.value.isActive) return

  event.preventDefault()

  const touchDuration = Date.now() - touchState.value.startTime
  const position = touchState.value.currentPosition

  // Quick tap detection (< 200ms, minimal movement)
  const isQuickTap = touchDuration < 200 && !touchState.value.hasMoved

  // Double tap detection
  const isDoubleTap = touchState.value.tapCount > 1 &&
    (Date.now() - touchState.value.lastTapTime) < 300

  if (isQuickTap || (!touchState.value.hasMoved && touchDuration < 500)) {
    // Execute drop
    performDrop(position.x)

    // Enhanced haptic feedback for successful drop
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]) // Pattern vibration
    }

    // Special effect for double tap
    if (isDoubleTap) {
      createDoubleTapEffect(position.x, position.y)
    }
  }

  // Reset touch state
  touchState.value.isActive = false
  touchState.value.hasMoved = false

  // Clear preview after delay
  setTimeout(() => {
    if (!touchState.value.isActive) {
      //dropPreviewPosition.value = null
    }
  }, 100)
}

// Touch Start Visual Effect
const createTouchStartEffect = (x, y) => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let scale = 0
  const maxScale = 1.5
  let opacity = 1

  const animate = () => {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = '#00b894'
    ctx.beginPath()
    ctx.arc(x, y, 15 * scale, 0, Math.PI * 2)
    ctx.fill()

    // Inner circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.arc(x, y, 8 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    scale += 0.1
    opacity -= 0.1

    if (scale < maxScale && opacity > 0) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Touch Trail Effect
const createTouchTrailEffect = (x, y) => {
  if (Math.random() > 0.7) return // Don't create trail every frame

  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let life = 1.0

  const animate = () => {
    ctx.save()
    ctx.globalAlpha = life * 0.3
    ctx.fillStyle = '#00cec9'
    ctx.beginPath()
    ctx.arc(x + (Math.random() - 0.5) * 5, y + (Math.random() - 0.5) * 5, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    life -= 0.05

    if (life > 0) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Double Tap Special Effect
const createDoubleTapEffect = (x, y) => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rings = []
  for (let i = 0; i < 3; i++) {
    rings.push({
      radius: 0,
      maxRadius: 30 + (i * 15),
      opacity: 1 - (i * 0.2),
      delay: i * 100
    })
  }

  let startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    ctx.save()

    rings.forEach(ring => {
      if (elapsed > ring.delay) {
        const progress = Math.min((elapsed - ring.delay) / 500, 1)
        const currentRadius = ring.maxRadius * progress
        const currentOpacity = ring.opacity * (1 - progress)

        ctx.globalAlpha = currentOpacity
        ctx.strokeStyle = '#e74c3c'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, currentRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    ctx.restore()

    if (elapsed < 800) {
      requestAnimationFrame(animate)
    }
  }

  animate()
  console.log('🔥 Double tap effect triggered!')
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
  //dropPreviewPosition.value = null
}

// Visual drop feedback
// Enhanced Visual Drop Feedback with Juice Effects
const createDropFeedback = (x) => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Ring ripple effect
  let ringRadius = 5
  const maxRingRadius = 40
  const ringOpacity = { value: 1 }

  // Impact particles
  const impactParticles = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6
    impactParticles.push({
      x: x,
      y: PHYSICS_CONFIG.dropZone.dropY,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      life: 1.0,
      size: 2 + Math.random()
    })
  }

  const animateDropFeedback = () => {
    ctx.save()

    // Draw expanding ring
    if (ringRadius <= maxRingRadius) {
      ctx.globalAlpha = ringOpacity.value
      ctx.strokeStyle = '#00b894'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, PHYSICS_CONFIG.dropZone.dropY, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      ringRadius += 3
      ringOpacity.value -= 0.05
    }

    // Draw impact particles
    impactParticles.forEach(particle => {
      if (particle.life <= 0) return

      ctx.globalAlpha = particle.life
      ctx.fillStyle = '#00cec9'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.2 // Gravity
      particle.life -= 0.08
    })

    ctx.restore()

    // Continue animation
    if (ringRadius <= maxRingRadius || impactParticles.some(p => p.life > 0)) {
      requestAnimationFrame(animateDropFeedback)
    }
  }

  animateDropFeedback()
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

  return 'BLUEBERRY'
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

// Visual Fruit Rendering with Gradients and Animations
const renderFruitEmojis = (ctx) => {
  if (!ctx) return

  ctx.save()

  // 1. Render all existing fruits in the physics world
  if (fruits.value.length > 0) {
    fruits.value.forEach(fruit => {
      const body = fruit.body

      // Skip if fruit is sleeping (Performance!)
      if (body.isSleeping) return

      const { x, y } = body.position
      const { emoji, type } = fruit.data
      const fruitType = FRUIT_TYPES[type]

      if (!fruitType) return

      const isMoving = Math.abs(body.velocity.x) > 0.1 || Math.abs(body.velocity.y) > 0.1
      const isVisible = y < PHYSICS_CONFIG.canvas.height + 50 && y > -50

      if (!isVisible) return

      // Render real fruit with full effects
      renderSingleFruit(ctx, x, y, fruitType, body, 1.0) // Full opacity
    })
  }

  // 2. Render preview fruit at mouse position (always visible when game active)
  if (dropPreviewPosition.value && props.isGameActive && nextFruitType.value) {
    const previewType = FRUIT_TYPES[nextFruitType.value]
    if (previewType) {
      const previewX = dropPreviewPosition.value
      const previewY = PHYSICS_CONFIG.dropZone.dropY

      // Render preview fruit with same effects but slightly transparent
      const previewOpacity = isPointerDown.value ? 0.9 : 0.7 // More solid when dragging
      renderSingleFruit(ctx, previewX, previewY, previewType, null, previewOpacity)
    }
  }

  ctx.restore()
}

// Helper function to render a single fruit with all effects
const renderSingleFruit = (ctx, x, y, fruitType, body = null, opacity = 1.0) => {
  const radius = fruitType.radius
  const fontSize = radius * 1.2

  // Animation properties (only for real physics bodies)
  const animationScale = body?.animationScale || 1
  const animationOpacity = body?.animationOpacity !== undefined ? body.animationOpacity : 1
  const isMoving = body ? (Math.abs(body.velocity.x) > 0.1 || Math.abs(body.velocity.y) > 0.1) : false
  const bounceScale = isMoving ? fruitType.bounceScale : 1
  const finalScale = animationScale * bounceScale
  const finalOpacity = opacity * animationOpacity

  ctx.save()
  ctx.translate(x, y)
  if (body) ctx.rotate(body.angle) // Only rotate real physics bodies
  ctx.scale(finalScale, finalScale)
  ctx.globalAlpha = finalOpacity

  // 1. Glow effect for moving fruits
  if (isMoving) {
    ctx.shadowColor = fruitType.glowColor
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // 2. Gradient background circle
  const gradient = ctx.createRadialGradient(
    -radius * 0.3, -radius * 0.3, 0,
    0, 0, radius
  )

  gradient.addColorStop(0, fruitType.gradient[0])
  gradient.addColorStop(0.6, fruitType.gradient[1])
  gradient.addColorStop(1, fruitType.gradient[2])

  // 3. Draw gradient circle
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()

  // 4. Subtle border
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  // 5. Highlight spot for depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // 6. Secondary highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.beginPath()
  ctx.arc(-radius * 0.4, -radius * 0.4, radius * 0.08, 0, Math.PI * 2)
  ctx.fill()

  // 7. Emoji overlay with enhanced shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 3
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  ctx.fillStyle = 'transparent'
  ctx.font = `${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(fruitType.emoji, 0, fontSize * 0.05)

  // 8. Sparkle effect for high-value preview fruits
  if (fruitType.id >= 6 && Math.random() > 0.95) {
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = fruitType.sparkleColor
    const sparkleX = (Math.random() - 0.5) * radius * 1.5
    const sparkleY = (Math.random() - 0.5) * radius * 1.5
    ctx.beginPath()
    ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// Visual effect for merging
// Enhanced Merge Effects with Advanced Particle System
const createMergeEffect = (x, y, fruitType) => {
  if (!physicsRender.value) return

  const ctx = physicsRender.value.canvas.getContext('2d')
  if (!ctx) return

  const type = FRUIT_TYPES[fruitType]
  if (!type) return

  // Create different particle types
  const particles = []
  const particleCount = getParticleCount(Math.min(15 + (type.id * 2), 25))

  // Explosion particles
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
    const speed = 3 + Math.random() * 4
    const size = 2 + Math.random() * 3

    particles.push({
      type: 'explosion',
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1, // Slight upward bias
      life: 1.0,
      maxLife: 1.0,
      size: size,
      color: type.gradient[Math.floor(Math.random() * type.gradient.length)],
      gravity: 0.1,
      fadeSpeed: 0.02
    })
  }

  // Sparkle particles for higher-level fruits
  if (type.id >= 4) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        type: 'sparkle',
        x: x + (Math.random() - 0.5) * type.radius * 2,
        y: y + (Math.random() - 0.5) * type.radius * 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0,
        maxLife: 1.0,
        size: 1 + Math.random() * 2,
        color: type.sparkleColor,
        gravity: 0.05,
        fadeSpeed: 0.015,
        twinkle: Math.random() * Math.PI * 2
      })
    }
  }

  // Score popup particle
  particles.push({
    type: 'score',
    x: x,
    y: y - type.radius - 10,
    vx: 0,
    vy: -2,
    life: 1.0,
    maxLife: 1.0,
    size: 16 + (type.id * 2),
    text: `+${type.scoreValue}`,
    color: type.gradient[1],
    gravity: 0,
    fadeSpeed: 0.01
  })

  // Ring wave effect
  particles.push({
    type: 'ring',
    x: x,
    y: y,
    life: 1.0,
    maxLife: 1.0,
    size: 0,
    maxSize: type.radius * 3,
    color: type.glowColor,
    gravity: 0,
    fadeSpeed: 0.03
  })

  // Animate all particles
  const animateParticles = () => {
    ctx.save()

    particles.forEach((particle, index) => {
      if (particle.life <= 0) return

      const alpha = particle.life / particle.maxLife

      switch (particle.type) {
        case 'explosion':
          ctx.globalAlpha = alpha
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'sparkle':
          ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(particle.twinkle + Date.now() * 0.01))
          ctx.fillStyle = particle.color
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate(Date.now() * 0.005)
          ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size)
          ctx.fillRect(-particle.size/6, -particle.size*1.5, particle.size/3, particle.size*3)
          ctx.fillRect(-particle.size*1.5, -particle.size/6, particle.size*3, particle.size/3)
          ctx.restore()
          break

        case 'score':
          ctx.globalAlpha = alpha
          ctx.fillStyle = particle.color
          ctx.font = `bold ${particle.size}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.lineWidth = 2
          ctx.strokeText(particle.text, particle.x, particle.y)
          ctx.fillText(particle.text, particle.x, particle.y)
          break

        case 'ring':
          const ringProgress = 1 - (particle.life / particle.maxLife)
          const currentSize = particle.maxSize * ringProgress
          ctx.globalAlpha = alpha * 0.6
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2)
          ctx.stroke()
          break
      }

      // Update particle physics
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += particle.gravity
      particle.life -= particle.fadeSpeed
    })

    ctx.restore()

    // Remove dead particles and continue animation
    const aliveParticles = particles.filter(p => p.life > 0)

    if (aliveParticles.length > 0) {
      // Update particles array reference
      particles.length = 0
      particles.push(...aliveParticles)
      requestAnimationFrame(animateParticles)
    }
  }

  animateParticles()
  console.log(`✨ Enhanced merge effect created for ${fruitType} with ${particles.length} particles`)
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

// Enhanced Touch System für Mobile Optimization
const touchState = ref({
  isActive: false,
  startTime: 0,
  startPosition: { x: 0, y: 0 },
  currentPosition: { x: 0, y: 0 },
  hasMoved: false,
  tapCount: 0,
  lastTapTime: 0
})

// Multi-touch gesture prevention
const preventMultiTouch = (event) => {
  if (event.touches && event.touches.length > 1) {
    event.preventDefault()
    return true
  }
  return false
}

// Visual Game Over Warning System
const createGameOverWarning = () => {
  const canvas = gameCanvas.value?.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let flashCount = 0
  const maxFlashes = 6
  let flashOpacity = 0

  const animateWarning = () => {
    ctx.save()

    // Red warning overlay
    ctx.globalAlpha = flashOpacity
    ctx.fillStyle = 'rgba(231, 76, 60, 0.3)'
    ctx.fillRect(0, 0, PHYSICS_CONFIG.canvas.width, gameOverHeight + 20)

    // Warning line
    ctx.globalAlpha = 1
    ctx.strokeStyle = flashOpacity > 0.5 ? '#e74c3c' : '#c0392b'
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.beginPath()
    ctx.moveTo(0, gameOverHeight)
    ctx.lineTo(PHYSICS_CONFIG.canvas.width, gameOverHeight)
    ctx.stroke()
    ctx.setLineDash([])

    // Warning text
    if (flashOpacity > 0.3) {
      ctx.globalAlpha = flashOpacity
      ctx.fillStyle = '#e74c3c'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('⚠️ DANGER ZONE ⚠️', PHYSICS_CONFIG.canvas.width / 2, gameOverHeight - 10)
    }

    ctx.restore()

    // Flash animation
    flashOpacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01)
    flashCount++

    if (flashCount < maxFlashes * 10) {
      requestAnimationFrame(animateWarning)
    }
  }

  animateWarning()
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

const isMobile = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
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

// Simple UI toggle handler for canvas resize
const handleUIToggle = () => {
  if (!physicsRender.value || !gameCanvas.value) return

  console.log('🎮 Handling UI toggle for canvas resize')

  // Simple approach: trigger window resize event to recalculate layout
  nextTick(() => {
    const resizeEvent = new Event('resize')
    window.dispatchEvent(resizeEvent)
  })
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
  getPhysicsState,

  // UI toggle handler
  handleUIToggle
})
</script>

<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">

      <!-- Physics Game Area -->
      <div class="game-play-area__game-physics">
        <!-- Physics Canvas Container -->
        <div
          ref="gameCanvas"
          class="game-play-area__canvas-container"
          :class="{
            'game-play-area__canvas-container--paused': isGamePaused,
            'game-play-area__canvas-container--active': isGameActive && canDrop,
            'game-play-area__canvas-container--cooldown': !canDrop,
            'game-play-area__canvas-container--mobile': isMobile
          }"
          @mousedown="handlePointerDown"
          @mousemove="handlePointerMove"
          @mouseup="handlePointerUp"
          @mouseleave="handlePointerLeave"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @touchcancel="handlePointerLeave"
          @contextmenu.prevent=""
        >
          <!-- Drop Zone Indicator mit Touch-Feedback -->
          <div
            v-if="isGameActive"
            class="game-play-area__drop-zone"
            :class="{ 'game-play-area__drop-zone--mobile': isMobile }"
          ></div>
          <!-- Mobile Trajectory Guide -->
          <div
            v-if="dropPreviewPosition && isGameActive && isMobile"
            class="game-play-area__mobile-trajectory"
            :style="{
              left: `${dropPreviewPosition}px`,
              height: `${PHYSICS_CONFIG.canvas.height - PHYSICS_CONFIG.dropZone.dropY}px`,
              top: `${PHYSICS_CONFIG.dropZone.dropY}px`
            }"
          ></div>
        </div>

        <!-- Drop Trajectory Line -->
        <div
          v-if="dropPreviewPosition && isGameActive"
          class="game-play-area__trajectory-line"
          :style="{
            left: `${dropPreviewPosition}px`,
            height: `${PHYSICS_CONFIG.canvas.height - PHYSICS_CONFIG.dropZone.dropY}px`,
            top: `${PHYSICS_CONFIG.dropZone.dropY}px`
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
      box-shadow:
        0 0 20px rgba(253, 203, 110, 0.4),
        inset 0 0 0 2px rgba(253, 203, 110, 0.2);
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

    &--mobile {
      // Larger touch area
      &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        z-index: -1;
      }
    }
  }

  // Drop zone indicator
  &__drop-zone {
    position: absolute;
    top: 0;
    left: 30px;
    right: 30px;
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

    &--mobile {
      height: 4px; // Thicker für bessere Sichtbarkeit
      box-shadow: 0 0 15px rgba(0, 184, 148, 0.6);

      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: 10%;
        right: 10%;
        height: 8px;
        background: rgba(0, 184, 148, 0.2);
        border-radius: 4px;
      }
    }
  }

  &__touch-inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
  }

  &__mobile-trajectory {
    position: absolute;
    width: 3px; // Thicker for mobile
    background: linear-gradient(
        to bottom,
        rgba(0, 184, 148, 0.9) 0%,
        rgba(0, 184, 148, 0.6) 50%,
        rgba(0, 184, 148, 0.2) 80%,
        transparent 100%
    );
    pointer-events: none;
    z-index: 5;
    transform: translateX(-50%);
    border-radius: 1.5px;
    box-shadow: 0 0 6px rgba(0, 184, 148, 0.4);
  }

  &__trajectory-line {
    position: absolute;
    pointer-events: none;
    z-index: 5;
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

@keyframes touch-pulse-mobile {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes ripple-expand {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

// Animations
@keyframes touch-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
}

// Enhanced animations
@keyframes touch-pulse-enhanced {
  0% {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 0 20px rgba(0, 184, 148, 0.6);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 30px rgba(0, 184, 148, 0.8);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 0 20px rgba(0, 184, 148, 0.6);
  }
}

@keyframes trajectory-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
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

// Responsive adjustments
@media (min-width: vars.$breakpoint-md) {
  .game-play-area {
    &__game-status {
      padding: var(--space-6);
    }

    &__game-placeholder {
      padding: var(--space-8);
    }
  }
}

@media (max-width: 480px) {
  .game-play-area__mobile-trajectory {
    width: 4px;
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

// High DPI displays optimization
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .game-play-area__canvas-container canvas {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style>