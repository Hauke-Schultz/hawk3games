import { ref, computed, watch } from 'vue'
import { useLevelGoals } from './useLevelGoals.js'
import { useLevelRewards } from './useLevelRewards.js'
import { useLevelStore } from '../stores/levelStore.js'

export function useLevelCompletion(emit) {
	const { getLevelGoal, calculateStars, isLevelCompleted, getLevelProgress, getLevelCompletionData } = useLevelGoals()

	// Completion state
	const levelCompleted = ref(false)
	const completionData = ref(null)
	const completionTriggered = ref(false)

	// Track current level and session
	const currentLevel = ref(1)
	const currentSession = ref(null)

	// Computed properties
	const currentLevelGoal = computed(() => getLevelGoal(currentLevel.value))

	const levelProgress = computed(() => {
		if (!currentLevelGoal.value || !currentSession.value) return 0
		return getLevelProgress(currentLevel.value, currentSession.value.score || 0)
	})

	const isGoalReached = computed(() => {
		if (!currentLevelGoal.value || !currentSession.value) return false
		return isLevelCompleted(currentLevel.value, currentSession.value.score || 0)
	})

	// Functions
	const initializeLevel = (levelId, session) => {
		currentLevel.value = levelId
		currentSession.value = session
		levelCompleted.value = false
		completionData.value = null
		completionTriggered.value = false

		console.log(`🎯 Level completion initialized for level ${levelId}`)
	}

	const checkLevelCompletion = (score) => {
		if (completionTriggered.value || !currentLevelGoal.value) return false

		if (isLevelCompleted(currentLevel.value, score)) {
			console.log(`🎉 Level ${currentLevel.value} goal reached! Score: ${score}`)
			triggerLevelCompletion()
			return true
		}

		return false
	}

	const { calculateLevelRewards, awardLevelRewards, checkRewardAchievements } = useLevelRewards()
	const levelStore = useLevelStore()

	// Neue reactive Variablen hinzufügen:
	const rewardData = ref(null)
	const achievements = ref([])

	// triggerLevelCompletion Funktion erweitern:
	const triggerLevelCompletion = () => {
		if (completionTriggered.value) return

		completionTriggered.value = true
		levelCompleted.value = true

		// Calculate completion data
		const finalScore = currentSession.value?.score || 0
		const totalMoves = currentSession.value?.moves || 0
		const gameTime = currentSession.value?.elapsedTime || 0

		const completion = getLevelCompletionData(
			currentLevel.value,
			finalScore,
			totalMoves,
			gameTime
		)

		completionData.value = completion

		// Calculate and award rewards
		const rewards = calculateLevelRewards(
			currentLevel.value,
			completion.stars,
			finalScore,
			totalMoves,
			gameTime
		)

		rewardData.value = rewards

		// Award the rewards to player
		const awardResult = awardLevelRewards(rewards)

		// Update level progress in store
		levelStore.completeLevel(
			currentLevel.value,
			completion.stars,
			finalScore,
			gameTime
		)

		// Check for achievements
		const earnedAchievements = checkRewardAchievements(rewards)
		achievements.value = earnedAchievements

		console.log(`🏆 Level completion:`, {
			completion,
			rewards,
			awardResult,
			achievements: earnedAchievements
		})

		// Emit completion event with all data
		setTimeout(() => {
			emit('level-completed', {
				levelId: currentLevel.value,
				score: finalScore,
				moves: totalMoves,
				timeMs: gameTime,
				stars: completion.stars,
				completionData: completion,
				rewardData: rewards,
				achievements: earnedAchievements
			})
		}, 1500)
	}

	// resetCompletion erweitern:
	const resetCompletion = () => {
		levelCompleted.value = false
		completionData.value = null
		completionTriggered.value = false
		rewardData.value = null
		achievements.value = []
	}

	// Watch for automatic completion check
	watch(() => currentSession.value?.score, (newScore) => {
		if (newScore !== undefined && newScore !== null) {
			checkLevelCompletion(newScore)
		}
	})

	return {
		// State
		levelCompleted,
		completionData,
		currentLevelGoal,
		levelProgress,
		isGoalReached,
		rewardData,
		achievements,

		// Functions
		initializeLevel,
		checkLevelCompletion,
		triggerLevelCompletion,
		resetCompletion
	}
}