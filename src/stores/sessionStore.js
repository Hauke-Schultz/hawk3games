import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { GAME_STATUS, createDefaultGameSession } from '../types/game.js'

// Game Session Store - Manages current game session state
export const useSessionStore = defineStore('session', () => {
	// Current session state
	const currentSession = ref(createDefaultGameSession())

	// Session history (for analytics)
	const sessionHistory = ref([])
	const maxHistoryLength = 50

	// Timing state
	const startTime = ref(null)
	const pausedTime = ref(0) // Total time spent paused
	const pauseStartTime = ref(null)

	// Game mechanics state
	const currentCombo = ref(0)
	const maxCombo = ref(0)
	const specialMovesUsed = ref(0)
	const hintsUsed = ref(0)

	// Performance tracking
	const frameCount = ref(0)
	const averageFPS = ref(60)

	// Computed values
	const isGameActive = computed(() => {
		return currentSession.value.status === GAME_STATUS.PLAYING
	})

	const isGamePaused = computed(() => {
		return currentSession.value.status === GAME_STATUS.PAUSED
	})

	const isGameCompleted = computed(() => {
		return currentSession.value.status === GAME_STATUS.COMPLETED
	})

	const gameElapsedTime = computed(() => {
		if (!startTime.value) return 0

		const now = Date.now()
		const totalElapsed = now - startTime.value
		const activeTime = totalElapsed - pausedTime.value

		return Math.max(0, activeTime)
	})

	const gameElapsedSeconds = computed(() => {
		return Math.floor(gameElapsedTime.value / 1000)
	})

	const gameElapsedMinutes = computed(() => {
		return Math.floor(gameElapsedSeconds.value / 60)
	})

	const formattedGameTime = computed(() => {
		const minutes = gameElapsedMinutes.value
		const seconds = gameElapsedSeconds.value % 60
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	})

	const movesPerMinute = computed(() => {
		const minutes = gameElapsedMinutes.value
		if (minutes === 0) return 0
		return Math.round((currentSession.value.moves / minutes) * 100) / 100
	})

	const scorePerMove = computed(() => {
		if (currentSession.value.moves === 0) return 0
		return Math.round((currentSession.value.score / currentSession.value.moves) * 100) / 100
	})

	// Session management actions
	const startNewSession = (levelId) => {
		// Save previous session if it exists
		if (currentSession.value.status !== GAME_STATUS.NOT_STARTED) {
			saveSessionToHistory()
		}

		// Reset session state
		currentSession.value = createDefaultGameSession(levelId)
		currentSession.value.status = GAME_STATUS.PLAYING

		// Reset timing
		startTime.value = Date.now()
		pausedTime.value = 0
		pauseStartTime.value = null

		// Reset game mechanics
		currentCombo.value = 0
		maxCombo.value = 0
		specialMovesUsed.value = 0
		hintsUsed.value = 0

		// Reset performance tracking
		frameCount.value = 0
		averageFPS.value = 60

		console.log(`🎮 New game session started for level ${levelId}`)
		return true
	}

	const pauseSession = () => {
		if (currentSession.value.status !== GAME_STATUS.PLAYING) {
			console.warn('Cannot pause - game is not currently playing')
			return false
		}

		currentSession.value.status = GAME_STATUS.PAUSED
		pauseStartTime.value = Date.now()

		console.log('⏸️ Game session paused')
		return true
	}

	const resumeSession = () => {
		if (currentSession.value.status !== GAME_STATUS.PAUSED) {
			console.warn('Cannot resume - game is not currently paused')
			return false
		}

		// Add paused time to total
		if (pauseStartTime.value) {
			pausedTime.value += Date.now() - pauseStartTime.value
			pauseStartTime.value = null
		}

		currentSession.value.status = GAME_STATUS.PLAYING

		console.log('▶️ Game session resumed')
		return true
	}

	const completeSession = (finalScore = null, success = true) => {
		if (!isGameActive.value && !isGamePaused.value) {
			console.warn('Cannot complete - no active session')
			return false
		}

		// Update final score if provided
		if (finalScore !== null) {
			currentSession.value.score = finalScore
		}

		// Set final timing
		currentSession.value.endTime = Date.now()

		// Set status
		currentSession.value.status = success ? GAME_STATUS.COMPLETED : GAME_STATUS.GAME_OVER

		// Save to history
		saveSessionToHistory()

		console.log(`🏁 Game session completed: Level ${currentSession.value.level}, Score: ${currentSession.value.score}`)
		return true
	}

	const abortSession = () => {
		if (currentSession.value.status === GAME_STATUS.NOT_STARTED) {
			console.warn('No session to abort')
			return false
		}

		currentSession.value.status = GAME_STATUS.GAME_OVER
		currentSession.value.endTime = Date.now()

		saveSessionToHistory()

		console.log('❌ Game session aborted')
		return true
	}

	// Game state updates
	const updateScore = (newScore) => {
		if (!isGameActive.value) return false

		const oldScore = currentSession.value.score
		currentSession.value.score = Math.max(0, newScore)

		console.log(`📊 Score updated: ${oldScore} → ${currentSession.value.score}`)
		return true
	}

	const addToScore = (points) => {
		if (!isGameActive.value) return false

		currentSession.value.score += Math.max(0, points)
		console.log(`📊 +${points} points! Total: ${currentSession.value.score}`)
		return true
	}

	const updateMoves = (newMoves) => {
		if (!isGameActive.value) return false

		currentSession.value.moves = Math.max(0, newMoves)
		return true
	}

	const incrementMoves = () => {
		if (!isGameActive.value) return false

		currentSession.value.moves++
		console.log(`🎯 Move ${currentSession.value.moves}`)
		return currentSession.value.moves
	}

	const updateCombo = (comboCount) => {
		if (!isGameActive.value) return false

		currentCombo.value = Math.max(0, comboCount)
		maxCombo.value = Math.max(maxCombo.value, currentCombo.value)

		if (currentCombo.value > 1) {
			console.log(`🔥 Combo x${currentCombo.value}!`)
		}

		return currentCombo.value
	}

	const resetCombo = () => {
		currentCombo.value = 0
	}

	const useSpecialMove = () => {
		if (!isGameActive.value) return false

		specialMovesUsed.value++
		console.log(`⭐ Special move used! Total: ${specialMovesUsed.value}`)
		return true
	}

	const useHint = () => {
		if (!isGameActive.value) return false

		hintsUsed.value++
		console.log(`💡 Hint used! Total: ${hintsUsed.value}`)
		return true
	}

	// Performance tracking
	const updateFPS = (fps) => {
		frameCount.value++

		// Simple moving average for FPS
		const alpha = 0.1 // Smoothing factor
		averageFPS.value = averageFPS.value * (1 - alpha) + fps * alpha
	}

	// Session history management
	const saveSessionToHistory = () => {
		const sessionToSave = {
			...currentSession.value,
			actualEndTime: Date.now(),
			totalElapsedTime: gameElapsedTime.value,
			maxComboAchieved: maxCombo.value,
			specialMovesUsed: specialMovesUsed.value,
			hintsUsed: hintsUsed.value,
			averageFPS: Math.round(averageFPS.value),
			movesPerMinute: movesPerMinute.value,
			scorePerMove: scorePerMove.value
		}

		sessionHistory.value.unshift(sessionToSave)

		// Keep history within limits
		if (sessionHistory.value.length > maxHistoryLength) {
			sessionHistory.value = sessionHistory.value.slice(0, maxHistoryLength)
		}

		console.log('💾 Session saved to history')
	}

	const getSessionHistory = (levelId = null) => {
		if (levelId) {
			return sessionHistory.value.filter(session => session.level === levelId)
		}
		return sessionHistory.value
	}

	const clearSessionHistory = () => {
		sessionHistory.value = []
		console.log('🗑️ Session history cleared')
	}

	// Statistics and analytics
	const getSessionStatistics = () => {
		const completedSessions = sessionHistory.value.filter(s => s.status === GAME_STATUS.COMPLETED)
		const failedSessions = sessionHistory.value.filter(s => s.status === GAME_STATUS.GAME_OVER)

		let totalScore = 0
		let totalMoves = 0
		let totalTime = 0
		let totalCombos = 0

		completedSessions.forEach(session => {
			totalScore += session.score || 0
			totalMoves += session.moves || 0
			totalTime += session.totalElapsedTime || 0
			totalCombos += session.maxComboAchieved || 0
		})

		const avgScore = completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0
		const avgMoves = completedSessions.length > 0 ? Math.round(totalMoves / completedSessions.length) : 0
		const avgTime = completedSessions.length > 0 ? Math.round(totalTime / completedSessions.length) : 0
		const avgCombo = completedSessions.length > 0 ? Math.round((totalCombos / completedSessions.length) * 100) / 100 : 0

		return {
			current: {
				level: currentSession.value.level,
				status: currentSession.value.status,
				score: currentSession.value.score,
				moves: currentSession.value.moves,
				elapsedTime: gameElapsedTime.value,
				combo: currentCombo.value,
				maxCombo: maxCombo.value
			},
			history: {
				totalSessions: sessionHistory.value.length,
				completedSessions: completedSessions.length,
				failedSessions: failedSessions.length,
				successRate: sessionHistory.value.length > 0 ?
					Math.round((completedSessions.length / sessionHistory.value.length) * 100) : 0
			},
			averages: {
				score: avgScore,
				moves: avgMoves,
				timeMs: avgTime,
				combo: avgCombo
			},
			totals: {
				score: totalScore,
				moves: totalMoves,
				timeMs: totalTime,
				playTimeHours: Math.round((totalTime / (1000 * 60 * 60)) * 100) / 100
			},
			performance: {
				averageFPS: Math.round(averageFPS.value),
				frameCount: frameCount.value,
				movesPerMinute: movesPerMinute.value,
				scorePerMove: scorePerMove.value
			}
		}
	}

	const getBestSession = (levelId = null) => {
		let sessions = sessionHistory.value.filter(s => s.status === GAME_STATUS.COMPLETED)

		if (levelId) {
			sessions = sessions.filter(s => s.level === levelId)
		}

		if (sessions.length === 0) return null

		// Sort by score (descending), then by moves (ascending), then by time (ascending)
		sessions.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score
			if (a.moves !== b.moves) return a.moves - b.moves
			return (a.totalElapsedTime || 0) - (b.totalElapsedTime || 0)
		})

		return sessions[0]
	}

	// Reset functions
	const resetCurrentSession = () => {
		currentSession.value = createDefaultGameSession()
		startTime.value = null
		pausedTime.value = 0
		pauseStartTime.value = null
		currentCombo.value = 0
		maxCombo.value = 0
		specialMovesUsed.value = 0
		hintsUsed.value = 0

		console.log('🔄 Current session reset')
	}

	const resetAllSessions = () => {
		resetCurrentSession()
		clearSessionHistory()

		console.log('🔄 All sessions reset')
	}

	return {
		// State
		currentSession,
		sessionHistory,
		startTime,
		pausedTime,
		currentCombo,
		maxCombo,
		specialMovesUsed,
		hintsUsed,
		frameCount,
		averageFPS,

		// Computed
		isGameActive,
		isGamePaused,
		isGameCompleted,
		gameElapsedTime,
		gameElapsedSeconds,
		gameElapsedMinutes,
		formattedGameTime,
		movesPerMinute,
		scorePerMove,

		// Session Management
		startNewSession,
		pauseSession,
		resumeSession,
		completeSession,
		abortSession,

		// Game State Updates
		updateScore,
		addToScore,
		updateMoves,
		incrementMoves,
		updateCombo,
		resetCombo,
		useSpecialMove,
		useHint,

		// Performance
		updateFPS,

		// History Management
		getSessionHistory,
		clearSessionHistory,

		// Analytics
		getSessionStatistics,
		getBestSession,

		// Reset Functions
		resetCurrentSession,
		resetAllSessions
	}
})