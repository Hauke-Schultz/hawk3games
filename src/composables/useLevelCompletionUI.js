import { computed } from 'vue'

export function useLevelCompletionUI(levelCompletionState) {
	const { levelCompleted, completionData, currentLevelGoal, levelProgress } = levelCompletionState

	// Progress display logic
	const shouldShowProgress = computed(() => {
		return currentLevelGoal.value && !levelCompleted.value
	})

	const progressBarStyle = computed(() => ({
		width: `${levelProgress.value}%`
	}))

	const progressText = computed(() => {
		if (!currentLevelGoal.value) return ''
		return `${levelProgress.value}%`
	})

	// Completion overlay logic
	const shouldShowCompletion = computed(() => {
		return levelCompleted.value && completionData.value
	})

	const completionStars = computed(() => {
		if (!completionData.value) return []
		return Array.from({ length: 3 }, (_, i) => ({
			filled: i < completionData.value.stars,
			index: i + 1
		}))
	})

	const completionTitle = computed(() => {
		return 'Level Complete!'
	})

	// Animation timing helpers
	const getStarAnimationDelay = (starIndex) => {
		return `${0.3 + (starIndex * 0.2)}s`
	}

	const getOverlayAnimationClass = () => {
		return shouldShowCompletion.value ? 'completion-overlay--visible' : ''
	}

	return {
		// Progress UI
		shouldShowProgress,
		progressBarStyle,
		progressText,

		// Completion UI
		shouldShowCompletion,
		completionStars,
		completionTitle,

		// Animation helpers
		getStarAnimationDelay,
		getOverlayAnimationClass
	}
}