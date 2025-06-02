// src/composables/useComboSystem.js
import { ref } from 'vue'
import { COMBO_CONFIG } from '../config/fruitMergeGameConfig.js'

export function useComboSystem(emit) {
	// Combo state
	const comboState = ref({
		current: 0,
		maxThisSession: 0,
		lastMergeTime: null,
		timeoutId: null,
		resetDelay: COMBO_CONFIG.resetDelay, // 6 seconds
		comboTimeLeft: 0,
		comboTimerInterval: null
	})

	// Helper functions
	const getComboMultiplier = (comboLevel) => {
		if (comboLevel <= 10) {
			return COMBO_CONFIG.scoreMultipliers[comboLevel] || 1.0
		}
		// For combos > 10: 3.5 + 0.2 for each additional combo
		return 3.5 + ((comboLevel - 10) * 0.2)
	}

	const calculateComboScore = (baseScore, comboLevel) => {
		const multiplier = getComboMultiplier(comboLevel)
		const bonusScore = Math.floor(baseScore * multiplier)

		if (comboLevel > 1) {
			console.log(`🔥 Combo x${comboLevel}! Score: ${baseScore} → ${bonusScore} (${multiplier}x multiplier)`)
		}

		return bonusScore
	}

	// Emit combo message - jetzt mit emit parameter
	const emitComboMessage = (comboLevel, type) => {
		if (emit) {
			emit('combo-message', {
				message: COMBO_CONFIG.comboMessage[comboLevel] || `${comboLevel}x Combo!`,
				combo: comboLevel,
				type: type,
				duration: 2000,
				color: COMBO_CONFIG.comboColor[comboLevel] || '#fdcb6e'
			})
		}
	}

	// Create combo visual effect
	const createComboEffect = (comboLevel) => {
		// Visual effect logic hier - oder später implementieren
		console.log(`✨ Combo effect for level ${comboLevel}`)
	}

	// Main combo merge handler
	const handleComboMerge = (baseScore) => {
		const now = Date.now()

		// Increment combo
		comboState.value.current++
		comboState.value.lastMergeTime = now

		// Update max combo for session
		comboState.value.maxThisSession = Math.max(
			comboState.value.maxThisSession,
			comboState.value.current
		)

		// Calculate final score with combo bonus
		const finalScore = calculateComboScore(baseScore, comboState.value.current)

		// Emit combo messages
		if (comboState.value.current >= 2) {
			emitComboMessage(comboState.value.current, 'combo')
		}

		if (comboState.value.current === 5 || comboState.value.current === 10) {
			setTimeout(() => {
				emitComboMessage(comboState.value.current, 'achievement')
			}, 500)
		}

		// Start/reset combo timer
		startComboTimer()

		if (comboState.value.current >= 3) {
			createComboEffect(comboState.value.current)
		}

		// Haptic feedback for high combos
		if (comboState.value.current >= 5 && navigator.vibrate) {
			navigator.vibrate([50, 25, 50])
		}

		console.log(`🎯 Combo x${comboState.value.current} achieved! Max this session: ${comboState.value.maxThisSession}`)

		return finalScore
	}

	// Start combo countdown timer
	const startComboTimer = () => {
		// Clear existing timers
		if (comboState.value.timeoutId) {
			clearTimeout(comboState.value.timeoutId)
		}
		if (comboState.value.comboTimerInterval) {
			clearInterval(comboState.value.comboTimerInterval)
		}

		// Reset combo time left
		comboState.value.comboTimeLeft = COMBO_CONFIG.resetDelay

		// Visual countdown timer (updates every 100ms)
		comboState.value.comboTimerInterval = setInterval(() => {
			comboState.value.comboTimeLeft -= 100

			if (comboState.value.comboTimeLeft <= 0) {
				clearInterval(comboState.value.comboTimerInterval)
				comboState.value.comboTimerInterval = null
			}
		}, 100)

		// Combo reset timeout
		comboState.value.timeoutId = setTimeout(() => {
			resetCombo()
		}, COMBO_CONFIG.resetDelay)
	}

	// Reset combo state
	const resetCombo = () => {
		if (comboState.value.current > 1) {
			console.log(`💫 Combo ended at x${comboState.value.current}`)
		}

		comboState.value.current = 0
		comboState.value.comboTimeLeft = 0

		// Clear timers
		if (comboState.value.timeoutId) {
			clearTimeout(comboState.value.timeoutId)
			comboState.value.timeoutId = null
		}
		if (comboState.value.comboTimerInterval) {
			clearInterval(comboState.value.comboTimerInterval)
			comboState.value.comboTimerInterval = null
		}

		// Emit null to clear combo message
		if (emit) {
			emit('combo-message', null)
		}
	}

	// Return all functions and state
	return {
		comboState,
		getComboMultiplier,
		calculateComboScore,
		handleComboMerge,
		startComboTimer,
		resetCombo,
		emitComboMessage,
		createComboEffect
	}
}