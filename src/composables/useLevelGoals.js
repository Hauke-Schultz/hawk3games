import { LEVEL_GOALS, FRUIT_TYPES } from '../config/fruitMergeGameConfig.js'

export function useLevelGoals() {
	// Get level goal configuration
	const getLevelGoal = (levelId) => {
		return LEVEL_GOALS[levelId] || null
	}

	// Calculate stars based on performance
	const calculateStars = (levelId, achievedFruit, moves, timeMs = null, fruitCount = 1) => {
		const goal = getLevelGoal(levelId)
		if (!goal) return 0

		const targetFruitType = FRUIT_TYPES[goal.targetFruit]
		const achievedFruitType = FRUIT_TYPES[achievedFruit]

		if (!targetFruitType || !achievedFruitType) return 0

		// Prüfe ob Zielfrucht erreicht wurde
		if (achievedFruitType.id < targetFruitType.id) return 0

		// Prüfe ob genug Früchte erstellt wurden (für Level 9)
		const requiredCount = goal.starThresholds[1]?.targetCount || 1
		if (fruitCount < requiredCount) return 0

		const thresholds = goal.starThresholds

		// Check für 3 Sterne (beste Performance)
		if (moves <= thresholds[3].maxMoves &&
			(thresholds[3].time === null || timeMs <= thresholds[3].time)) {
			return 3
		}

		// Check für 2 Sterne
		if (moves <= thresholds[2].maxMoves &&
			(thresholds[2].time === null || timeMs <= thresholds[2].time)) {
			return 2
		}

		// Check für 1 Stern (Grundanforderung erfüllt)
		if (moves <= thresholds[1].maxMoves) {
			return 1
		}

		return 0 // Level nicht geschafft
	}

	// Check if level is completed
	const isLevelCompleted = (levelId, achievedFruit, fruitCount = 1) => {
		const goal = getLevelGoal(levelId)
		if (!goal) return false

		const targetFruitType = FRUIT_TYPES[goal.targetFruit]
		const achievedFruitType = FRUIT_TYPES[achievedFruit]

		if (!targetFruitType || !achievedFruitType) return false

		// Prüfe ob Zielfrucht erreicht wurde
		const fruitReached = achievedFruitType.id >= targetFruitType.id

		// Prüfe Anzahl (für spätere Level)
		const requiredCount = goal.starThresholds[1]?.targetCount || 1
		const countReached = fruitCount >= requiredCount

		return fruitReached && countReached
	}

	// Get completion progress percentage
	const getLevelProgress = (levelId, highestFruitAchieved) => {
		const goal = getLevelGoal(levelId)
		if (!goal) return 0

		const targetFruitType = FRUIT_TYPES[goal.targetFruit]
		const achievedFruitType = FRUIT_TYPES[highestFruitAchieved]

		if (!targetFruitType || !achievedFruitType) return 0

		// Progress basiert auf erreichte Frucht-Stufe
		const progress = (achievedFruitType.id / targetFruitType.id) * 100
		return Math.min(100, Math.round(progress))
	}

	// Get progress toward next star
	const getStarProgress = (levelId, currentScore, currentMoves) => {
		const goal = getLevelGoal(levelId)
		if (!goal) return { currentStars: 0, nextStarProgress: 0, nextStarRequirement: null }

		const currentStars = calculateStars(levelId, currentScore, currentMoves)

		if (currentStars >= 3) {
			return {
				currentStars: 3,
				nextStarProgress: 100,
				nextStarRequirement: null
			}
		}

		const nextStarLevel = currentStars + 1
		const nextThreshold = goal.starThresholds[nextStarLevel]

		if (!nextThreshold) {
			return {
				currentStars,
				nextStarProgress: 0,
				nextStarRequirement: null
			}
		}

		// Calculate progress to next star based on score
		const scoreProgress = Math.min(100, (currentScore / nextThreshold.score) * 100)

		return {
			currentStars,
			nextStarProgress: scoreProgress,
			nextStarRequirement: {
				score: nextThreshold.score,
				moves: nextThreshold.moves,
				time: nextThreshold.time
			}
		}
	}

	// Get level completion status and rewards
	const getLevelCompletionData = (levelId, finalScore, totalMoves, timeMs) => {
		const goal = getLevelGoal(levelId)
		if (!goal) {
			return {
				completed: false,
				stars: 0,
				progress: 0,
				message: 'Level configuration not found'
			}
		}

		const stars = calculateStars(levelId, finalScore, totalMoves, timeMs)
		const completed = stars > 0
		const progress = getLevelProgress(levelId, finalScore)

		let message = ''
		if (completed) {
			if (stars === 3) message = 'Perfect! 3 Stars!'
			else if (stars === 2) message = 'Great! 2 Stars!'
			else message = 'Level Complete! 1 Star!'
		} else {
			const remaining = goal.targetScore - finalScore
			message = `Need ${remaining} more points to complete`
		}

		return {
			completed,
			stars,
			progress,
			message,
			targetScore: goal.targetScore,
			description: goal.description
		}
	}

	// Validate if a score/move combination would complete the level
	const wouldCompleteLevel = (levelId, score) => {
		return isLevelCompleted(levelId, score)
	}

	// Get all level goals (for debugging/overview)
	const getAllLevelGoals = () => {
		return LEVEL_GOALS
	}

	return {
		// Core functions
		getLevelGoal,
		calculateStars,
		isLevelCompleted,
		getLevelProgress,
		getStarProgress,
		getLevelCompletionData,
		wouldCompleteLevel,
		getAllLevelGoals
	}
}