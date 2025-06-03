// src/composables/useGameRules.js - Game Rules and Logic Composable
import { ref, computed } from 'vue'
import { PHYSICS_CONFIG } from '../config/fruitMergeGameConfig.js'

export function useGameRules(droppedFruits, emit) {
	// Game state
	const isNearGameOver = ref(false)
	const topViolations = ref({})
	const gameOverDelay = 4000 // 4 seconds

	// Game over detection
	const gameOverHeight = PHYSICS_CONFIG.gameOverHeight

	const checkGameOver = () => {
		const currentTime = Date.now()
		const currentTopBoundary = gameOverHeight

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

					emit('game-over', {
						reason: 'height_limit',
						finalScore: 0 // Will be updated by parent
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

	// Level completion detection
	const checkLevelCompletion = (currentLevel, sessionScore) => {
		// Simple completion logic - could be expanded
		if (sessionScore >= getLevelTargetScore(currentLevel)) {
			emit('level-completed', {
				levelId: currentLevel,
				score: sessionScore,
				reason: 'target_score_reached'
			})
			return true
		}
		return false
	}

	// Score requirements for levels
	const getLevelTargetScore = (levelId) => {
		const baseScore = 500
		return baseScore + (levelId - 1) * 300 // Increasing difficulty
	}

	// Validation helpers
	const isValidMove = (position, fruitType) => {
		// Check if drop position is within bounds
		const { minX, maxX } = PHYSICS_CONFIG.dropZone
		return position.x >= minX && position.x <= maxX
	}

	const isGameStateValid = (gameState) => {
		return gameState.isGameActive && !gameState.isGamePaused
	}

	// Scoring logic
	const calculateLevelStars = (score, moves, timeMs, levelId) => {
		const targetScore = getLevelTargetScore(levelId)
		const targetMoves = 20 + levelId * 2 // Ideal moves per level
		const targetTime = 60000 + levelId * 30000 // Target time in ms

		let stars = 1 // Base star for completion

		// Score-based star
		if (score >= targetScore * 1.5) {
			stars = Math.max(stars, 2)
		}
		if (score >= targetScore * 2) {
			stars = Math.max(stars, 3)
		}

		// Efficiency-based star
		if (moves <= targetMoves) {
			stars = Math.max(stars, 2)
		}

		// Time-based star
		if (timeMs <= targetTime) {
			stars = Math.max(stars, 2)
		}

		// Perfect performance = 3 stars
		if (score >= targetScore * 1.8 && moves <= targetMoves && timeMs <= targetTime) {
			stars = 3
		}

		return Math.min(3, Math.max(1, stars))
	}

	// Performance metrics
	const getPerformanceMetrics = (score, moves, timeMs, levelId) => {
		const targetScore = getLevelTargetScore(levelId)

		return {
			scoreEfficiency: Math.round((score / targetScore) * 100),
			moveEfficiency: moves > 0 ? Math.round((score / moves) * 10) / 10 : 0,
			timeEfficiency: timeMs > 0 ? Math.round((score / (timeMs / 1000)) * 10) / 10 : 0,
			overallRating: calculateLevelStars(score, moves, timeMs, levelId)
		}
	}

	// Clean up violations for removed fruits
	const cleanupViolations = () => {
		const existingFruitIds = new Set(droppedFruits.value.map(f => f.id))

		for (const id in topViolations.value) {
			if (!existingFruitIds.has(parseInt(id))) {
				delete topViolations.value[id]
			}
		}
	}

	// Reset game rules state
	const resetGameRules = () => {
		isNearGameOver.value = false
		topViolations.value = {}
		console.log('🔄 Game rules reset')
	}

	// Power-up validation (for future use)
	const canUsePowerUp = (powerUpType, gameState) => {
		switch (powerUpType) {
			case 'hammer':
				return gameState.isGameActive && droppedFruits.value.length > 0
			case 'rocket':
				return gameState.isGameActive && droppedFruits.value.length > 0
			case 'bomb':
				return gameState.isGameActive && droppedFruits.value.length >= 3
			default:
				return false
		}
	}

	// Computed properties
	const dangerZoneHeight = computed(() => gameOverHeight)

	const hasActiveViolations = computed(() => {
		return Object.keys(topViolations.value).length > 0
	})

	const violationWarningLevel = computed(() => {
		if (!hasActiveViolations.value) return 'none'

		const oldestViolation = Math.min(...Object.values(topViolations.value))
		const timeElapsed = Date.now() - oldestViolation

		if (timeElapsed > gameOverDelay * 0.75) return 'critical'
		if (timeElapsed > gameOverDelay * 0.5) return 'warning'
		return 'caution'
	})

	return {
		// State
		isNearGameOver,
		topViolations,
		gameOverHeight,

		// Computed
		dangerZoneHeight,
		hasActiveViolations,
		violationWarningLevel,

		// Game Over Logic
		checkGameOver,
		cleanupViolations,

		// Level Logic
		checkLevelCompletion,
		getLevelTargetScore,
		calculateLevelStars,
		getPerformanceMetrics,

		// Validation
		isValidMove,
		isGameStateValid,
		canUsePowerUp,

		// Reset
		resetGameRules
	}
}