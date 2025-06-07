<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Matter from 'matter-js'
import {PHYSICS_CONFIG, FRUIT_TYPES} from '../../config/fruitMergeGameConfig.js'
import { useLevelGoals } from '../../composables/useLevelGoals.js'
import LevelCompletionOverlay from '../LevelCompletionOverlay/LevelCompletionOverlay.vue'

const props = defineProps({
  currentLevel: { type: Number, required: true },
  currentSession: { type: Object, required: true },
  isGameActive: { type: Boolean, default: false },
  isGamePaused: { type: Boolean, default: false }
})

const emit = defineEmits([
  'move-made',
  'score-update',
  'game-over',
  'level-completed'
])

// Game Board Constants
const BOARD_WIDTH = 300
const BOARD_HEIGHT = 400
const WALL_THICKNESS = 10
const GAME_OVER_LINE = 80

const fruitTypes = Object.values(FRUIT_TYPES).map(fruit => ({
  size: fruit.radius * 2, // Config verwendet radius, wir brauchen size
  color: fruit.color,
  level: fruit.id,
  name: fruit.emoji.split(' ')[0], // Fallback für Name
  points: fruit.scoreValue,
  gradient: fruit.gradient,
  svg: fruit.svg
}))

const levelCompletionState = ref(null)
const showCompletionOverlay = ref(false)
const dangerZoneHeight = ref(BOARD_HEIGHT - GAME_OVER_LINE)

// Level Goals Integration
const { getLevelGoal, calculateStars, getLevelCompletionData } = useLevelGoals()

// Nach den bestehenden Funktionen hinzufügen:
function checkLevelCompletion() {
  const goal = getLevelGoal(props.currentLevel)
  if (!goal) return false

  const currentScore = props.currentSession?.score || 0
  const currentMoves = props.currentSession?.moves || 0
  const gameTime = Date.now() - (props.currentSession?.startTime || Date.now())

  // Prüfe ob Level-Ziel erreicht wurde
  if (currentScore >= goal.targetScore) {
    completeLevelWithRewards(currentScore, currentMoves, gameTime)
    return true
  }

  return false
}

function completeLevelWithRewards(finalScore, totalMoves, timeMs) {
  console.log(`🎉 Level ${props.currentLevel} completed!`)

  // Berechne Sterne basierend auf Performance
  const stars = calculateStars(props.currentLevel, finalScore, totalMoves, timeMs)

  // Erstelle Belohnungsdaten
  const rewardData = {
    totalCoins: calculateCoinReward(stars),
    totalDiamonds: calculateDiamondReward(stars),
    bonusCoins: 0,
    bonusDiamonds: 0,
    breakdown: {
      baseReward: calculateCoinReward(1),
      starBonus: calculateCoinReward(stars) - calculateCoinReward(1),
      perfectBonus: stars === 3 ? calculateDiamondReward(3) : 0
    }
  }

  // Erfolge (falls vorhanden)
  const achievements = []
  if (stars === 3) {
    achievements.push({
      type: 'perfect_level',
      title: 'Perfect Clear!',
      description: `Completed Level ${props.currentLevel} with 3 stars!`
    })
  }

  // Level-Abschlussdaten
  const completionData = getLevelCompletionData(props.currentLevel, finalScore, totalMoves, timeMs)

  // Completion State setzen
  levelCompletionState.value = {
    rewardData,
    achievements,
    completionData,
    stars,
    levelId: props.currentLevel
  }

  // Overlay anzeigen
  showCompletionOverlay.value = true

  // Level als abgeschlossen markieren
  emit('level-completed', {
    levelId: props.currentLevel,
    stars,
    score: finalScore,
    moves: totalMoves,
    timeMs
  })
}

function calculateCoinReward(stars) {
  const baseReward = Math.max(50, props.currentLevel * 25)
  return baseReward + ((stars - 1) * 25)
}

function calculateDiamondReward(stars) {
  return stars === 3 ? Math.floor(props.currentLevel / 3) + 1 : 0
}

// Generate New Fruit Function ZUERST definieren
function generateFruit() {
  const maxStartingLevel = Math.min(5, Math.floor(props.currentLevel / 2) + 3)
  const randomIndex = Math.floor(Math.random() * maxStartingLevel)
  const fruitType = fruitTypes[randomIndex]

  return {
    id: nextFruitId.value++,
    level: fruitType.level,
    size: fruitType.size,
    color: fruitType.color,
    name: fruitType.name,
    points: fruitType.points,
    x: 0,
    y: 0,
    rotation: 0,
    body: null,
    merging: false,
    isNew: false
  }
}

// Game State - JETZT mit initial Wert
const gameBoard = ref(null)
const fruits = ref([])
const nextFruitId = ref(0)
const nextFruit = ref(generateFruit()) // ✅ SOFORT initialisieren
const dropPosition = ref(BOARD_WIDTH / 2)
const canDropFruit = ref(true)
const dropCooldown = ref(false)
const gameOver = ref(false)
const isDragging = ref(false)
const gameOverCheckInterval = ref(null)

// Physics Engine
let engine = null
let runner = null
let walls = []

const getFruitSvg = (level) => {
  const fruitType = Object.values(FRUIT_TYPES).find(fruit => fruit.id === level)
  if (!fruitType) return ''

  // SVG direkt von der Config laden
  return fruitType.svg || `<circle cx="32" cy="32" r="30" fill="${fruitType.color}"/>`
}

// Rest der Funktionen bleibt gleich...
function initPhysics() {
  engine = Matter.Engine.create({
    gravity: { x: 0, y: 0.8, scale: 0.001 },
    constraintIterations: 2,
    positionIterations: 6,
    velocityIterations: 4
  })

  runner = Matter.Runner.create({
    delta: 1000 / 60,
    isFixed: true
  })

  walls = [
    Matter.Bodies.rectangle(
      BOARD_WIDTH / 2,
      BOARD_HEIGHT + WALL_THICKNESS / 2,
      BOARD_WIDTH,
      WALL_THICKNESS,
      {
        isStatic: true,
        label: 'wall-bottom',
        restitution: 0.3,
        friction: 0.8
      }
    ),
    Matter.Bodies.rectangle(
      -WALL_THICKNESS / 2,
      BOARD_HEIGHT / 2,
      WALL_THICKNESS,
      BOARD_HEIGHT,
      {
        isStatic: true,
        label: 'wall-left',
        restitution: 0.3,
        friction: 0.8
      }
    ),
    Matter.Bodies.rectangle(
      BOARD_WIDTH + WALL_THICKNESS / 2,
      BOARD_HEIGHT / 2,
      WALL_THICKNESS,
      BOARD_HEIGHT,
      {
        isStatic: true,
        label: 'wall-right',
        restitution: 0.3,
        friction: 0.8
      }
    )
  ]

  Matter.Composite.add(engine.world, walls)
  Matter.Events.on(engine, 'collisionStart', handleCollision)
  Matter.Runner.run(runner, engine)

  updateFruitPositions()
  startGameOverCheck()
}

// Alle anderen Funktionen bleiben unverändert...
function updateFruitPositions() {
  if (!engine || gameOver.value) return

  const fruitsToUpdate = fruits.value.filter(fruit => fruit.body)

  fruitsToUpdate.forEach(fruit => {
    const pos = fruit.body.position
    const newX = pos.x - fruit.size / 2
    const newY = pos.y - fruit.size / 2
    const newRotation = fruit.body.angle * (180 / Math.PI)

    if (Math.abs(fruit.x - newX) > 0.1 ||
      Math.abs(fruit.y - newY) > 0.1 ||
      Math.abs(fruit.rotation - newRotation) > 0.5) {
      fruit.x = newX
      fruit.y = newY
      fruit.rotation = newRotation
    }
  })

  requestAnimationFrame(updateFruitPositions)
}

function handleCollision(event) {
  const pairs = event.pairs

  pairs.forEach(pair => {
    const { bodyA, bodyB } = pair

    if (bodyA.label.startsWith('fruit-') && bodyB.label.startsWith('fruit-')) {
      const fruitDataA = bodyA.label.split('-')
      const fruitDataB = bodyB.label.split('-')

      const idA = parseInt(fruitDataA[1])
      const idB = parseInt(fruitDataB[1])
      const levelA = parseInt(fruitDataA[2])
      const levelB = parseInt(fruitDataB[2])

      if (levelA === levelB && levelA < fruitTypes.length) {
        const fruitA = fruits.value.find(f => f.id === idA)
        const fruitB = fruits.value.find(f => f.id === idB)

        if (fruitA && fruitB && !fruitA.merging && !fruitB.merging) {
          mergeFruits(fruitA, fruitB, bodyA, bodyB)
        }
      }
    }
  })
}

function mergeFruits(fruitA, fruitB, bodyA, bodyB) {
  fruitA.merging = true
  fruitB.merging = true

  const centerX = (bodyA.position.x + bodyB.position.x) / 2
  const centerY = (bodyA.position.y + bodyB.position.y) / 2

  const baseScore = fruitA.points

  emit('score-update', baseScore)

  setTimeout(() => {
    Matter.Composite.remove(engine.world, bodyA)
    Matter.Composite.remove(engine.world, bodyB)

    fruits.value = fruits.value.filter(f => f.id !== fruitA.id && f.id !== fruitB.id)

    if (fruitA.level < fruitTypes.length) {
      const newFruitType = fruitTypes[fruitA.level]
      const newFruit = {
        id: nextFruitId.value++,
        level: newFruitType.level,
        size: newFruitType.size,
        color: newFruitType.color,
        name: newFruitType.name,
        points: newFruitType.points,
        x: centerX - newFruitType.size / 2,
        y: centerY - newFruitType.size / 2,
        rotation: 0,
        body: null,
        merging: false,
        isNew: true
      }

      addMergedFruit(newFruit, centerX, centerY)
    }

    checkLevelCompletion()
  }, 150)
}

function addMergedFruit(fruit, x, y) {
  const fruitBody = Matter.Bodies.circle(x, y, fruit.size / 2, {
    restitution: 0.4,
    friction: 0.6,
    frictionAir: 0.01,
    density: 0.001,
    label: `fruit-${fruit.id}-${fruit.level}`
  })

  fruit.body = fruitBody
  Matter.Body.setVelocity(fruitBody, { x: 0, y: -1 })
  Matter.Composite.add(engine.world, fruitBody)
  fruits.value.push(fruit)

  setTimeout(() => {
    fruit.isNew = false
  }, 500)

  setTimeout(() => {
    if (checkLevelCompletion()) {
      // Level completed, stop physics
      canDropFruit.value = false
      showNextFruit.value = false
    }
  }, 200)
}

function dropFruit(event) {
  if (!canDropFruit.value || dropCooldown.value || !isDragging.value) {
    isDragging.value = false
    return
  }

  event.preventDefault()
  isDragging.value = false

  const newFruit = { ...nextFruit.value }

  const safeDropX = Math.max(
    newFruit.size / 2 + WALL_THICKNESS,
    Math.min(BOARD_WIDTH - newFruit.size / 2 - WALL_THICKNESS, dropPosition.value)
  )

  addFruitToWorld(newFruit, safeDropX, -newFruit.size)
}

function addFruitToWorld(fruit, x, y) {
  dropCooldown.value = true
  canDropFruit.value = false

  const fruitBody = Matter.Bodies.circle(x, y, fruit.size / 2, {
    restitution: 0.5,
    friction: 0.7,
    frictionAir: 0.01,
    density: 0.001,
    label: `fruit-${fruit.id}-${fruit.level}`
  })

  fruit.body = fruitBody
  fruit.x = x - fruit.size / 2
  fruit.y = y - fruit.size / 2
  fruit.isNew = true

  Matter.Composite.add(engine.world, fruitBody)
  fruits.value.push(fruit)

  nextFruit.value = generateFruit()
  emit('move-made')

  setTimeout(() => {
    dropCooldown.value = false
    canDropFruit.value = true
    fruit.isNew = false
  }, 800)
}

function startDrag(event) {
  if (!canDropFruit.value || dropCooldown.value) return

  event.preventDefault()
  isDragging.value = true
  handleDrag(event)
}

function handleDrag(event) {
  if (!isDragging.value) return

  event.preventDefault()

  const clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0
  const boardRect = gameBoard.value.getBoundingClientRect()
  const relativeX = clientX - boardRect.left

  const minX = nextFruit.value.size / 2 + WALL_THICKNESS
  const maxX = BOARD_WIDTH - nextFruit.value.size / 2 - WALL_THICKNESS

  dropPosition.value = Math.max(minX, Math.min(maxX, relativeX))
}

function startGameOverCheck() {
  gameOverCheckInterval.value = setInterval(() => {
    if (gameOver.value) return

    const fruitsAboveLine = fruits.value.some(fruit =>
      fruit.y < GAME_OVER_LINE && fruit.body && fruit.body.speed < 0.1
    )

    if (fruitsAboveLine) {
      triggerGameOver()
    }
  }, 1000)
}

function triggerGameOver() {
  gameOver.value = true
  canDropFruit.value = false

  if (gameOverCheckInterval.value) {
    clearInterval(gameOverCheckInterval.value)
  }

  emit('game-over', {
    finalScore: props.currentSession.score,
    fruitsDropped: fruits.value.length,
    highestLevel: Math.max(...fruits.value.map(f => f.level))
  })
}

function handleStartNextLevel(nextLevelId) {
  showCompletionOverlay.value = false
  levelCompletionState.value = null
  emit('start-next-level', nextLevelId)
}

function handleBackToLevels() {
  showCompletionOverlay.value = false
  levelCompletionState.value = null
  emit('back-to-level-selection')
}


watch(() => props.isGamePaused, (paused) => {
  if (paused) {
    Matter.Runner.stop(runner)
    canDropFruit.value = false
  } else {
    Matter.Runner.run(runner, engine)
    canDropFruit.value = true
  }
})

watch(() => props.isGameActive, (active) => {
  if (!active) {
    canDropFruit.value = false
  }
})

onMounted(async () => {
  await nextTick()
  // nextFruit ist bereits initialisiert!
  dropPosition.value = BOARD_WIDTH / 2
  initPhysics()
})

onUnmounted(() => {
  if (gameOverCheckInterval.value) {
    clearInterval(gameOverCheckInterval.value)
  }

  if (runner) {
    Matter.Runner.stop(runner)
  }

  if (engine) {
    Matter.Events.off(engine)
    Matter.World.clear(engine.world)
    Matter.Engine.clear(engine)
  }
})
</script>
<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">
      <div class="game-play-area__physics">
        <!-- Next Fruit Indicator - Mit Null-Check -->
        <div class="next-fruit-indicator">
          <div
            v-if="nextFruit && canDropFruit && !isDragging"
            class="next-fruit-preview"
            :style="{
              left: `${dropPosition}px`,
              width: `${nextFruit.size}px`,
              height: `${nextFruit.size}px`
            }"
          >
            <div
              class="fruit-svg-container"
              v-html="getFruitSvg(nextFruit.level)"
            />
          </div>
        </div>

        <!-- Game Board -->
        <div
          ref="gameBoard"
          class="game-board"
          @mousedown="startDrag"
          @mousemove="handleDrag"
          @mouseup="dropFruit"
          @mouseleave="dropFruit"
          @touchstart="startDrag"
          @touchmove="handleDrag"
          @touchend="dropFruit"
        >
          <div
            v-if="isDragging"
            class="drop-guide"
            :style="{ left: `${dropPosition}px` }"
          ></div>

          <!-- Next Fruit Preview - Mit Null-Check -->
          <div
            v-for="fruit in fruits"
            :key="fruit.id"
            class="fruit"
            :class="{
              'merging': fruit.merging,
              'new-fruit': fruit.isNew
            }"
            :style="{
              left: `${fruit.x}px`,
              top: `${fruit.y}px`,
              width: `${fruit.size}px`,
              height: `${fruit.size}px`,
              transform: `rotate(${fruit.rotation}deg)`
            }"
          >
            <div
              class="fruit-svg-container"
              v-html="getFruitSvg(fruit.level)"
            />
          </div>

          <!-- Game Over Line -->
          <div
            class="game-play-area__game-over-line"
            :style="{ top: `${dangerZoneHeight}px` }"
          ></div>

          <!-- Physics Fruits -->
          <div
            v-for="fruit in fruits"
            :key="fruit.id"
            class="fruit"
            :class="{
              'merging': fruit.merging,
              'new-fruit': fruit.isNew
            }"
            :style="{
              left: `${fruit.x}px`,
              top: `${fruit.y}px`,
              width: `${fruit.size}px`,
              height: `${fruit.size}px`,
              transform: `rotate(${fruit.rotation}deg)`
            }"
          >
            <span class="fruit-level">{{ fruit.level }}</span>
          </div>

          <!-- Game Over Overlay -->
          <div v-if="gameOver" class="game-over-overlay">
            <div class="game-over-content">
              <h3>Game Over!</h3>
              <p>Früchte haben die Obergrenze erreicht</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LevelCompletionOverlay
      v-if="showCompletionOverlay && levelCompletionState"
      :level-completion-state="levelCompletionState"
      :current-session="currentSession"
      :current-level="currentLevel"
      :max-level="9"
      @start-next-level="handleStartNextLevel"
      @back-to-levels="handleBackToLevels"
    />
  </div>
</template>
<style scoped lang="scss">
.game-play-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;
  user-select: none;

  &__physics {
    display: flex;
    flex-direction: column;
    align-items: center;
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

.fruit-svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }
}

.next-fruit-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  position: relative;
  width: 100%;
  min-height: 50px;

  .preview-fruit {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .fruit-svg-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.game-board {
  width: 300px;
  height: 400px;
  border: 3px solid var(--card-border, #e0e0e0);
  border-radius: 12px;
  background-color: var(--game-board-bg);
  overflow: hidden;
  position: relative;
  cursor: crosshair;
  touch-action: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(180deg, rgba(255, 0, 0, 0.1) 0%, transparent 100%);
    pointer-events: none;
    z-index: 1;
  }
}

.drop-guide {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #ff4444 0%, transparent 100%);
  transform: translateX(-1px);
  z-index: 2;
  pointer-events: none;
}

.next-fruit-preview {
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  z-index: 3;
  transition: opacity 0.2s ease;
}

.fruit {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  will-change: transform;
  overflow: hidden;

  .fruit-level {
    display: none;
  }

  &.merging {
    transform: scale(1.1);
    opacity: 0.9;
    animation: merge-pulse 0.3s ease-in-out;
  }

  &.new-fruit {
    animation: fruit-appear 0.5s ease-out;
  }
}

.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(4px);

  .game-over-content {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    h3 {
      margin: 0 0 10px 0;
      color: #d32f2f;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

@keyframes merge-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1.1); }
}

@keyframes fruit-appear {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .game-play-area__game-container {
    width: 100%;
    max-width: 320px;
    margin: 0 10px;
  }

  .game-board {
    cursor: default;
  }

  .next-fruit-preview {
    opacity: 0.6;
  }
}
</style>