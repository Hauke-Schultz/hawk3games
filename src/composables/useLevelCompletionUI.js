import { computed } from 'vue'

export function useLevelCompletionUI(levelCompletionState) {
	const shouldShowCompletion = computed(() => {
		return levelCompletionState
	})

	const completionStars = computed(() => {
		if (!levelCompletionState) return []

		const stars = levelCompletionState.stars || 0

		return Array.from({ length: 3 }, (_, index) => ({
			index: index + 1,
			filled: index < stars
		}))
	})

	const completionTitle = computed(() => {
		if (!levelCompletionState) return 'Level Complete!'

		const stars = levelCompletionState.stars || 0
		const type = levelCompletionState.type

		// Game Over spezifische Titel
		if (type === 'game_over') {
			return 'Game Over!'
		}

		// Level Completion Titel basierend auf Sternen
		switch (stars) {
			case 3: return 'Perfect!'
			case 2: return 'Great Job!'
			case 1: return 'Level Complete!'
			default: return 'Level Complete!'
		}
	})

	const getStarAnimationDelay = (starIndex) => {
		if (!starIndex || typeof starIndex !== 'number') return '0s'
		return `${(starIndex - 1) * 0.2}s`
	}

	return {
		shouldShowCompletion,
		completionStars,
		completionTitle,
		getStarAnimationDelay
	}
}