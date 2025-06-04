import { LEVEL_GOALS } from '../config/fruitMergeGameConfig.js'

export function useLevelGoals() {
	// Get level goal configuration
	const getLevelGoal = (levelId) => {
		return LEVEL_GOALS[levelId] || null
	}

	// Calculate stars based on performance
	const calculateStars = (levelId, score, moves, timeMs = null) => {
		const goal = getLevelGoal(levelId)
		if (!goal) return 0

		const thresholds = goal.starThresholds

		// Check for 3 stars first (highest requirement)
		if (score >= thresholds[3].score &&
			moves <= thresholds[3].moves &&
			(thresholds[3].time === null || timeMs <= thresholds[3].time)) {
			return 3
		}

		// Check for 2 stars
		if (score >= thresholds[2].score &&
			moves <= thresholds[2].moves &&
			(thresholds[2].time === null || timeMs <= thresholds[2].time)) {
			return 2
		}

		// Check for 1 star (minimum completion)
		if (score >= thresholds[1].score) {
			return 1
		}

		return 0 // Level not completed
	}

	// Check if level is completed
	const isLevelCompleted = (levelId, score) => {
		const goal = getLevelGoal(levelId)
		return goal && score >= goal.targetScore
	}

	// Get completion progress percentage
	const getLevelProgress = (levelId, currentScore) => {
		const goal = getLevelGoal(levelId)
		if (!goal) return 0

		return Math.min(100, Math.round((currentScore / goal.targetScore) * 100))
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