// src/composables/useFruitManager.js - Fruit Management Composable
import { ref, computed } from 'vue'
import Matter from 'matter-js'
import { FRUIT_TYPES, FRUIT_SPAWN_WEIGHTS, PHYSICS_CONFIG } from '../config/fruitMergeGameConfig.js'

export function useFruitManager(emit, physicsEngine) {
	// Fruit state
	const droppedFruits = ref([])
	const currentDropFruitType = ref('BLUEBERRY')
	const nextFruitId = ref(1)
	const canDrop = ref(true)

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
		if (!canDrop.value || !physicsEngine.world.value) return

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

	// Reset for new game
	const resetFruitManager = () => {
		clearAllFruits()
		currentDropFruitType.value = getRandomSpawnFruit()
		canDrop.value = true
		console.log('🔄 Fruit manager reset')
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
		checkForMerges,
		clearAllFruits,
		resetFruitManager,

		// Utilities
		getRandomSpawnFruit
	}
}