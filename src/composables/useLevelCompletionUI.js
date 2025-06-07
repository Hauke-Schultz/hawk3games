// src/composables/useLevelCompletionUI.js
import { computed } from 'vue'

export function useLevelCompletionUI(levelCompletionState) {
	const shouldShowCompletion = computed(() => {
		return levelCompletionState && levelCompletionState.value !== null
	})

	const completionStars = computed(() => {
		if (!levelCompletionState?.value) return []

		const stars = levelCompletionState.value.stars || 0
		return Array.from({ length: 3 }, (_, index) => ({
			index: index + 1,
			filled: index < stars
		}))
	})

	const completionTitle = computed(() => {
		if (!levelCompletionState?.value) return 'Level Complete!'

		const stars = levelCompletionState.value.stars || 0
		switch (stars) {
			case 3: return 'Perfect! 🌟'
			case 2: return 'Great Job! ⭐'
			case 1: return 'Level Complete! ⭐'
			default: return 'Level Complete!'
		}
	})

	const getStarAnimationDelay = (starIndex) => {
		return `${(starIndex - 1) * 0.2}s`
	}

	return {
		shouldShowCompletion,
		completionStars,
		completionTitle,
		getStarAnimationDelay
	}
}