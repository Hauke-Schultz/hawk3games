import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createLevelConfigurations, LEVEL_DIFFICULTY } from '../types/game.js'
import { saveToStorage, loadFromStorage } from '../utils/storage.js'

// Level Management Store - Specialized store for level progression and management
export const useLevelStore = defineStore('levels', () => {
	// Level configuration - static data
	const levelConfigurations = ref(createLevelConfigurations())

	// Player progress for levels
	const unlockedLevels = ref([1])
	const completedLevels = ref([])
	const levelStars = ref({}) // { levelId: starCount }
	const levelScores = ref({}) // { levelId: bestScore }
	const levelAttempts = ref({}) // { levelId: attemptCount }
	const levelTimes = ref({}) // { levelId: bestTimeInMs }

	// Current level state
	const currentLevel = ref(1)
	const levelInProgress = ref(false)

	// Computed getters
	const totalStars = computed(() => {
		return Object.values(levelStars.value).reduce((sum, stars) => sum + stars, 0)
	})

	const completionPercentage = computed(() => {
		const totalLevels = levelConfigurations.value.length
		const completed = completedLevels.value.length
		return Math.round((completed / totalLevels) * 100)
	})

	const perfectLevels = computed(() => {
		return completedLevels.value.filter(levelId => levelStars.value[levelId] === 3)
	})

	const isLevelUnlocked = computed(() => (levelId) => {
		return unlockedLevels.value.includes(levelId)
	})

	const isLevelCompleted = computed(() => (levelId) => {
		return completedLevels.value.includes(levelId)
	})

	const getLevelStars = computed(() => (levelId) => {
		return levelStars.value[levelId] || 0
	})

	const getLevelScore = computed(() => (levelId) => {
		return levelScores.value[levelId] || 0
	})

	const getLevelAttempts = computed(() => (levelId) => {
		return levelAttempts.value[levelId] || 0
	})

	const getLevelTime = computed(() => (levelId) => {
		return levelTimes.value[levelId] || null
	})

	const getLevelConfig = computed(() => (levelId) => {
		return levelConfigurations.value.find(level => level.id === levelId)
	})

	const getNextLevel = computed(() => {
		const maxUnlocked = Math.max(...unlockedLevels.value)
		const nextLevel = maxUnlocked + 1
		return nextLevel <= levelConfigurations.value.length ? nextLevel : null
	})

	const getLevelsByDifficulty = computed(() => (difficulty) => {
		return levelConfigurations.value.filter(level => level.difficulty === difficulty)
	})

	// Actions for level management
	const unlockLevel = (levelId) => {
		if (levelId < 1 || levelId > levelConfigurations.value.length) {
			console.warn(`Invalid level ID: ${levelId}`)
			return false
		}

		if (!unlockedLevels.value.includes(levelId)) {
			unlockedLevels.value.push(levelId)
			unlockedLevels.value.sort((a, b) => a - b) // Keep sorted
			console.log(`🔓 Level ${levelId} unlocked!`)
			return true
		}
		return false
	}

	const completeLevel = (levelId, stars = 1, score = 0, timeMs = null) => {
		if (!isLevelUnlocked.value(levelId)) {
			console.warn(`Cannot complete locked level: ${levelId}`)
			return false
		}

		// Validate stars (1-3)
		stars = Math.max(1, Math.min(3, stars))

		// Mark as completed if not already
		if (!completedLevels.value.includes(levelId)) {
			completedLevels.value.push(levelId)
		}

		// Update best stars (only if better)
		const currentStars = levelStars.value[levelId] || 0
		if (stars > currentStars) {
			levelStars.value[levelId] = stars
		}

		// Update best score (only if better)
		const currentScore = levelScores.value[levelId] || 0
		if (score > currentScore) {
			levelScores.value[levelId] = score
		}

		// Update best time (only if better/first time)
		if (timeMs && timeMs > 0) {
			const currentTime = levelTimes.value[levelId]
			if (!currentTime || timeMs < currentTime) {
				levelTimes.value[levelId] = timeMs
			}
		}

		// Increment attempts
		levelAttempts.value[levelId] = (levelAttempts.value[levelId] || 0) + 1

		// Auto-unlock next level
		const nextLevel = levelId + 1
		if (nextLevel <= levelConfigurations.value.length) {
			unlockLevel(nextLevel)
		}

		console.log(`🎉 Level ${levelId} completed! Stars: ${stars}, Score: ${score}`)
		return true
	}

	const startLevel = (levelId) => {
		if (!isLevelUnlocked.value(levelId)) {
			console.warn(`Cannot start locked level: ${levelId}`)
			return false
		}

		currentLevel.value = levelId
		levelInProgress.value = true

		// Increment attempt counter when starting
		levelAttempts.value[levelId] = (levelAttempts.value[levelId] || 0) + 1

		console.log(`🎮 Starting level ${levelId}`)
		return true
	}

	const finishLevel = () => {
		levelInProgress.value = false
		console.log(`✅ Finished level ${currentLevel.value}`)
	}

	const resetLevel = (levelId) => {
		if (levelId === 1) {
			console.warn('Cannot reset level 1')
			return false
		}

		// Remove from completed levels
		const completedIndex = completedLevels.value.indexOf(levelId)
		if (completedIndex > -1) {
			completedLevels.value.splice(completedIndex, 1)
		}

		// Reset progress data
		delete levelStars.value[levelId]
		delete levelScores.value[levelId]
		delete levelAttempts.value[levelId]
		delete levelTimes.value[levelId]

		console.log(`🔄 Reset progress for level ${levelId}`)
		return true
	}

	const resetAllProgress = () => {
		unlockedLevels.value = [1]
		completedLevels.value = []
		levelStars.value = {}
		levelScores.value = {}
		levelAttempts.value = {}
		levelTimes.value = {}
		currentLevel.value = 1
		levelInProgress.value = false

		console.log('🔄 All level progress reset')
	}

	const unlockAllLevels = () => {
		unlockedLevels.value = levelConfigurations.value.map(level => level.id)
		console.log('🔓 All levels unlocked!')
	}

	// Statistics and analytics
	const getLevelStatistics = () => {
		const stats = {
			totalLevels: levelConfigurations.value.length,
			unlockedCount: unlockedLevels.value.length,
			completedCount: completedLevels.value.length,
			perfectCount: perfectLevels.value.length,
			totalStars: totalStars.value,
			maxPossibleStars: levelConfigurations.value.length * 3,
			completionPercentage: completionPercentage.value,
			totalAttempts: Object.values(levelAttempts.value).reduce((sum, attempts) => sum + attempts, 0),
			averageAttemptsPerLevel: 0,
			totalScore: Object.values(levelScores.value).reduce((sum, score) => sum + score, 0),
			difficultyBreakdown: {}
		}

		// Calculate average attempts
		if (stats.completedCount > 0) {
			stats.averageAttemptsPerLevel = Math.round(stats.totalAttempts / stats.completedCount * 100) / 100
		}

		// Difficulty breakdown
		Object.values(LEVEL_DIFFICULTY).forEach(difficulty => {
			const levelsOfDifficulty = getLevelsByDifficulty.value(difficulty)
			const completedOfDifficulty = levelsOfDifficulty.filter(level =>
				isLevelCompleted.value(level.id)
			).length

			stats.difficultyBreakdown[difficulty] = {
				total: levelsOfDifficulty.length,
				completed: completedOfDifficulty,
				percentage: levelsOfDifficulty.length > 0 ?
					Math.round((completedOfDifficulty / levelsOfDifficulty.length) * 100) : 0
			}
		})

		return stats
	}

	// Persistence
	const saveLevelData = () => {
		const dataToSave = {
			unlockedLevels: unlockedLevels.value,
			completedLevels: completedLevels.value,
			levelStars: levelStars.value,
			levelScores: levelScores.value,
			levelAttempts: levelAttempts.value,
			levelTimes: levelTimes.value,
			currentLevel: currentLevel.value
		}

		return saveToStorage('levelData', dataToSave)
	}

	const loadLevelData = () => {
		const savedData = loadFromStorage('levelData')

		if (savedData) {
			unlockedLevels.value = savedData.unlockedLevels || [1]
			completedLevels.value = savedData.completedLevels || []
			levelStars.value = savedData.levelStars || {}
			levelScores.value = savedData.levelScores || {}
			levelAttempts.value = savedData.levelAttempts || {}
			levelTimes.value = savedData.levelTimes || {}
			currentLevel.value = savedData.currentLevel || 1

			console.log('📊 Level data loaded from storage')
			return true
		}

		console.log('📊 No saved level data found, using defaults')
		return false
	}

	return {
		// State
		levelConfigurations,
		unlockedLevels,
		completedLevels,
		levelStars,
		levelScores,
		levelAttempts,
		levelTimes,
		currentLevel,
		levelInProgress,

		// Computed
		totalStars,
		completionPercentage,
		perfectLevels,
		isLevelUnlocked,
		isLevelCompleted,
		getLevelStars,
		getLevelScore,
		getLevelAttempts,
		getLevelTime,
		getLevelConfig,
		getNextLevel,
		getLevelsByDifficulty,

		// Actions
		unlockLevel,
		completeLevel,
		startLevel,
		finishLevel,
		resetLevel,
		resetAllProgress,
		unlockAllLevels,
		getLevelStatistics,
		saveLevelData,
		loadLevelData
	}
})