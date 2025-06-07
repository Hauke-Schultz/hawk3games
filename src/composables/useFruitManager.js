// src/composables/useFruitManager.js - Memory-Optimized Fruit Management Composable
import { ref, computed } from 'vue'
import Matter from 'matter-js'
import { FRUIT_TYPES, FRUIT_SPAWN_WEIGHTS, PHYSICS_CONFIG } from '../config/fruitMergeGameConfig.js'

export function useFruitManager(emit, physicsEngine) {
	// Fruit state
	const droppedFruits = ref([])
	const currentDropFruitType = ref('BLUEBERRY')
	const nextFruitId = ref(1)
	const canDrop = ref(true)
	const gameOverState = ref(false)
	const gameOverTriggered = ref(false)
	const levelCompletedState = ref(false)
	const levelCompletedTriggered = ref(false)

	// Memory optimization: Object pools
	const updateObjectPool = []
	const settledObjectPool = []

	// Performance monitoring
	let frameCount = 0
	let averageUpdateTime = 0
	let lastPerformanceCheck = 0

	// Object pool helpers
	const getUpdateObject = () => {
		return updateObjectPool.pop() || {
			index: 0,
			fruit: null,
			position: { x: 0, y: 0 },
			rotation: 0
		}
	}

	const returnUpdateObject = (obj) => {
		obj.fruit = null // Clear reference to prevent memory leaks
		updateObjectPool.push(obj)
	}

	const getSettledObject = () => {
		return settledObjectPool.pop() || { index: 0 }
	}

	const returnSettledObject = (obj) => {
		settledObjectPool.push(obj)
	}

	// Fruit generation
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

	const generateNextDropFruit = () => {
		currentDropFruitType.value = getRandomSpawnFruit()
		console.log(`🎲 Next drop fruit: ${currentDropFruitType.value}`)
	}

	// Fruit dropping
	const dropFruit = (x) => {
		if (!canDrop.value || !physicsEngine.world.value || gameOverState.value || levelCompletedState.value) {
			console.log('🚫 Drop blocked - game inactive or game over')
			return
		}

		console.log(`🎯 Dropping ${currentDropFruitType.value} at x: ${x}`)

		// Create Matter.js body using physics engine
		const fruitConfig = FRUIT_TYPES[currentDropFruitType.value]
		const fruitBody = physicsEngine.createFruitBody(
			x,
			PHYSICS_CONFIG.dropZone.dropY,
			fruitConfig.radius,
			nextFruitId.value,
			currentDropFruitType.value
		)

		// Add slight random initial rotation
		const initialSpin = (Math.random() - 0.5) * 0.1
		Matter.Body.setAngularVelocity(fruitBody, initialSpin)

		// Add to world
		physicsEngine.addBodyToWorld(fruitBody)

		// Create visual fruit data
		const visualFruit = {
			id: nextFruitId.value,
			type: currentDropFruitType.value,
			body: fruitBody,
			position: { x: x, y: PHYSICS_CONFIG.dropZone.dropY },
			rotation: 0,
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

		console.log(`🍎 Fruit dropped! Total fruits: ${droppedFruits.value.length}`)
	}

	// Fruit merging
	const handleFruitMerge = (fruitA, fruitB, handleComboMerge) => {
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
				physicsEngine.removeBodyFromWorld(fruitA.body)
			}
			if (fruitB.body) {
				physicsEngine.removeBodyFromWorld(fruitB.body)
			}

			// Remove fruits from the array
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
		const fruitBody = physicsEngine.createFruitBody(
			x,
			y,
			fruitConfig.radius,
			nextFruitId.value,
			fruitType
		)

		// Add slight upward impulse for visual effect
		Matter.Body.setVelocity(fruitBody, { x: 0, y: -2 })

		// Add to world
		physicsEngine.addBodyToWorld(fruitBody)

		// Create visual fruit data
		const visualFruit = {
			id: nextFruitId.value,
			type: fruitType,
			body: fruitBody,
			position: { x: x, y: y },
			rotation: 0,
			isDropping: true,
			isMerged: true // Mark as merged for special effects
		}

		// Add to visual fruits array
		droppedFruits.value.push(visualFruit)

		// Increment ID for next fruit
		nextFruitId.value++

		console.log(`🍎 Merged fruit created: ${fruitType}`)
	}

	// OPTIMIZED: Memory-optimized physics update with Object Pooling
	const updateFruitPositions = () => {
		if (!droppedFruits.value.length || gameOverState.value || levelCompletedState.value) return

		const startTime = performance.now()

		const updates = []
		const settled = []

		// Pre-allocate arrays for better performance
		const fruitsLength = droppedFruits.value.length

		for (let i = 0; i < fruitsLength; i++) {
			const fruit = droppedFruits.value[i]
			if (!fruit.body) continue

			const body = fruit.body
			const newX = body.position.x
			const newY = body.position.y
			const newRotation = body.angle

			// Threshold-based update - only update when significant change
			const positionDelta = Math.abs(newX - fruit.position.x) + Math.abs(newY - fruit.position.y)
			const rotationDelta = Math.abs(newRotation - fruit.rotation)

			if (positionDelta > 0.2 || rotationDelta > 0.02) {
				const updateObj = getUpdateObject()
				updateObj.index = i
				updateObj.fruit = fruit
				updateObj.position.x = newX
				updateObj.position.y = newY
				updateObj.rotation = newRotation
				updates.push(updateObj)
			}

			// Settlement check only for moving fruits
			if (fruit.isDropping && body.speed < 0.1 && Math.abs(body.angularSpeed) < 0.05) {
				const settledObj = getSettledObject()
				settledObj.index = i
				settled.push(settledObj)
			}
		}

		// Batch position updates
		for (let i = 0; i < updates.length; i++) {
			const update = updates[i]
			update.fruit.position.x = update.position.x
			update.fruit.position.y = update.position.y
			update.fruit.rotation = update.rotation
			returnUpdateObject(update)
		}

		// Batch settlement updates
		for (let i = 0; i < settled.length; i++) {
			const settledObj = settled[i]
			droppedFruits.value[settledObj.index].isDropping = false
			returnSettledObject(settledObj)
		}

		// Log settlement if any occurred
		if (settled.length > 0) {
			console.log(`🍎 ${settled.length} fruits settled`)
		}

		// Clear arrays for next frame (reuse arrays)
		updates.length = 0
		settled.length = 0

		// Performance monitoring
		const endTime = performance.now()
		const updateTime = endTime - startTime

		// Rolling average of update time
		averageUpdateTime = (averageUpdateTime * 0.9) + (updateTime * 0.1)
		frameCount++

		// Performance warning for slow updates
		if (frameCount % 300 === 0) { // Every 5 seconds at 60fps
			if (averageUpdateTime > 2) { // > 2ms is problematic
				console.warn(`🐌 updateFruitPositions is slow: ${averageUpdateTime.toFixed(2)}ms avg`)
			}

			if (import.meta.env.DEV) {
				console.log(`📊 Update performance: ${averageUpdateTime.toFixed(2)}ms avg, ${droppedFruits.value.length} fruits`)
			}
		}
	}

	// Collision detection for merges
	const checkForMerges = (bodyA, bodyB, handleComboMerge) => {
		// Check if both bodies are fruits
		const fruitA = droppedFruits.value.find(f => f.body === bodyA)
		const fruitB = droppedFruits.value.find(f => f.body === bodyB)

		if (fruitA && fruitB && fruitA.type === fruitB.type && !fruitA.merging && !fruitB.merging) {
			console.log(`🔄 Merging: ${fruitA.type} + ${fruitB.type}`)
			handleFruitMerge(fruitA, fruitB, handleComboMerge)
			return true
		}

		return false
	}

	// Cleanup
	const clearAllFruits = () => {
		// Remove all fruit bodies from physics world
		droppedFruits.value.forEach(fruit => {
			if (fruit.body) {
				physicsEngine.removeBodyFromWorld(fruit.body)
			}
		})

		// Clear visual fruits array
		droppedFruits.value = []
		nextFruitId.value = 1

		console.log('🧹 All fruits cleared')
	}

	const setGameOverState = (isGameOver) => {
		gameOverState.value = isGameOver
		if (isGameOver) {
			canDrop.value = false

			// Stop all fruits immediately
			droppedFruits.value.forEach(fruit => {
				if (fruit.body) {
					Matter.Body.setVelocity(fruit.body, { x: 0, y: 0 })
					Matter.Body.setAngularVelocity(fruit.body, 0)
					Matter.Body.setStatic(fruit.body, true)
				}
			})

			console.log('💀 Fruit manager: Game Over - dropping disabled, all fruits stopped')
		}
	}

	const setLevelCompletedState = (isCompleted) => {
		levelCompletedState.value = isCompleted
		if (isCompleted) {
			canDrop.value = false

			// Stop all fruits immediately (same logic as Game Over)
			droppedFruits.value.forEach(fruit => {
				if (fruit.body) {
					Matter.Body.setVelocity(fruit.body, { x: 0, y: 0 })
					Matter.Body.setAngularVelocity(fruit.body, 0)
					Matter.Body.setStatic(fruit.body, true)
				}
			})

			console.log('🎉 Fruit manager: Level Completed - dropping disabled, all fruits stopped')
		}
	}

	const handleGameOverState = (finalScore, moves, level) => {
		setGameOverState(true)
		gameOverTriggered.value = true

		// Emit comprehensive game over data
		emit('game-over', {
			reason: 'height_limit',
			finalScore,
			moves,
			level,
			timestamp: Date.now()
		})

		console.log('💀 Fruit manager triggered game over')
	}

	// Reset for new game
	const resetFruitManager = () => {
		clearAllFruits()
		currentDropFruitType.value = getRandomSpawnFruit()
		canDrop.value = true
		gameOverState.value = false
		levelCompletedState.value = false
		levelCompletedTriggered.value = false

		// Reset performance counters
		frameCount = 0
		averageUpdateTime = 0
		lastPerformanceCheck = 0

		// Clear object pools
		updateObjectPool.length = 0
		settledObjectPool.length = 0

		console.log('🔄 Fruit manager reset')
	}

	const freezeAllFruits = () => {
		droppedFruits.value.forEach(fruit => {
			if (fruit.body && !fruit.body.isStatic) {
				// Stop velocity
				Matter.Body.setVelocity(fruit.body, { x: 0, y: 0 })
				Matter.Body.setAngularVelocity(fruit.body, 0)

				// Make fruit static (freeze)
				Matter.Body.setStatic(fruit.body, true)

				// Visual marker for frozen fruits
				fruit.isFrozen = true
			}
		})

		console.log(`🧊 Froze ${droppedFruits.value.length} fruits`)
	}

	const unfreezeAllFruits = () => {
		droppedFruits.value.forEach(fruit => {
			if (fruit.body && fruit.body.isStatic && fruit.isFrozen) {
				// Make fruits dynamic again
				Matter.Body.setStatic(fruit.body, false)
				fruit.isFrozen = false
			}
		})

		console.log(`🔥 Unfroze fruits`)
	}

	// Performance utilities
	const getUpdatePerformanceStats = () => {
		return {
			averageUpdateTime,
			frameCount,
			fruitCount: droppedFruits.value.length,
			poolSizes: {
				updatePool: updateObjectPool.length,
				settledPool: settledObjectPool.length
			}
		}
	}

	// Alternative throttled update for high fruit counts
	let updateQueued = false
	let lastUpdateTime = 0
	const UPDATE_INTERVAL = 16.67 // ~60 FPS

	const updateFruitPositionsThrottled = () => {
		if (updateQueued) return

		const now = performance.now()
		if (now - lastUpdateTime < UPDATE_INTERVAL) {
			updateQueued = true
			requestAnimationFrame(() => {
				updateQueued = false
				updateFruitPositions()
			})
			return
		}

		lastUpdateTime = now
		updateFruitPositions()
	}

	return {
		// State
		droppedFruits,
		currentDropFruitType,
		nextFruitId,
		canDrop,

		// Actions
		dropFruit,
		generateNextDropFruit,
		handleFruitMerge,
		createMergedFruit,
		updateFruitPositions,
		updateFruitPositionsThrottled,
		checkForMerges,
		clearAllFruits,
		resetFruitManager,

		setGameOverState,
		gameOverState,
		gameOverTriggered,
		handleGameOverState,
		freezeAllFruits,
		unfreezeAllFruits,

		setLevelCompletedState,
		levelCompletedState,
		levelCompletedTriggered,

		// Performance utilities
		getUpdatePerformanceStats,

		// Utilities
		getRandomSpawnFruit
	}
}