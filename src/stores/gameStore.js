import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { saveToStorage, loadFromStorage } from '../utils/storage.js'
import { createDefaultGameState } from '../types/game.js'

// Main Game Store - Central state management for FruitMerge game
export const useGameStore = defineStore('game', () => {
	// Core game state - reactive refs
	const gameState = ref(createDefaultGameState())

	// Player progress state
	const unlockedLevels = ref([1]) // Array of unlocked level IDs
	const completedLevels = ref([]) // Array of completed level IDs
	const levelStars = ref({}) // Object: { levelId: starCount }
	const totalStars = computed(() => Object.values(levelStars.value).reduce((sum, stars) => sum + stars, 0))

	// Currency state
	const coins = ref(1251)
	const diamonds = ref(251)

	// Game settings
	const settings = ref({
		soundEnabled: true,
		musicEnabled: true,
		hapticEnabled: true
	})

	// Current session state
	const currentSession = ref({
		level: 1,
		score: 0,
		moves: 0,
		startTime: null,
		isPaused: false
	})

	// Player profile
	const player = ref({
		id: crypto.randomUUID(),
		name: 'Player',
		createdAt: Date.now(),
		lastPlayed: Date.now()
	})

	// Computed getters
	const isLevelUnlocked = computed(() => (levelId) => {
		return unlockedLevels.value.includes(levelId)
	})

	const isLevelCompleted = computed(() => (levelId) => {
		return completedLevels.value.includes(levelId)
	})

	const getLevelStars = computed(() => (levelId) => {
		return levelStars.value[levelId] || 0
	})

	// Actions
	const unlockLevel = (levelId) => {
		if (!unlockedLevels.value.includes(levelId)) {
			unlockedLevels.value.push(levelId)
			console.log(`Level ${levelId} unlocked!`)
		}
	}

	const completeLevel = (levelId, stars = 1) => {
		// Mark level as completed
		if (!completedLevels.value.includes(levelId)) {
			completedLevels.value.push(levelId)
		}

		// Update stars (keep highest score)
		const currentStars = levelStars.value[levelId] || 0
		if (stars > currentStars) {
			levelStars.value[levelId] = stars
		}

		// Unlock next level
		const nextLevel = levelId + 1
		if (nextLevel <= 9) { // Max 9 levels
			unlockLevel(nextLevel)
		}

		console.log(`Level ${levelId} completed with ${stars} stars!`)
	}

	const addCoins = (amount) => {
		coins.value += amount
		console.log(`Added ${amount} coins. Total: ${coins.value}`)
	}

	const spendCoins = (amount) => {
		if (coins.value >= amount) {
			coins.value -= amount
			console.log(`Spent ${amount} coins. Remaining: ${coins.value}`)
			return true
		}
		console.warn(`Not enough coins. Need ${amount}, have ${coins.value}`)
		return false
	}

	const addDiamonds = (amount) => {
		diamonds.value += amount
		console.log(`Added ${amount} diamonds. Total: ${diamonds.value}`)
	}

	const spendDiamonds = (amount) => {
		if (diamonds.value >= amount) {
			diamonds.value -= amount
			console.log(`Spent ${amount} diamonds. Remaining: ${diamonds.value}`)
			return true
		}
		console.warn(`Not enough diamonds. Need ${amount}, have ${diamonds.value}`)
		return false
	}

	const startGameSession = (levelId) => {
		currentSession.value = {
			level: levelId,
			score: 0,
			moves: 0,
			startTime: Date.now(),
			isPaused: false
		}
		player.value.lastPlayed = Date.now()
		console.log(`Game session started for level ${levelId}`)
	}

	const pauseGame = () => {
		currentSession.value.isPaused = true
		console.log('Game paused')
	}

	const resumeGame = () => {
		currentSession.value.isPaused = false
		console.log('Game resumed')
	}

	const updateScore = (newScore) => {
		currentSession.value.score = newScore
	}

	const updateMoves = (moves) => {
		currentSession.value.moves = moves
	}

	const updateSettings = (newSettings) => {
		settings.value = { ...settings.value, ...newSettings }
		console.log('Settings updated:', newSettings)
	}

	// Auto-save functionality
	const saveGameState = () => {
		const stateToSave = {
			unlockedLevels: unlockedLevels.value,
			completedLevels: completedLevels.value,
			levelStars: levelStars.value,
			coins: coins.value,
			diamonds: diamonds.value,
			settings: settings.value,
			player: player.value
		}

		saveToStorage('gameState', stateToSave)
		console.log('Game state saved to localStorage')
	}

	const loadGameState = () => {
		const savedState = loadFromStorage('gameState')

		if (savedState) {
			unlockedLevels.value = savedState.unlockedLevels || [1]
			completedLevels.value = savedState.completedLevels || []
			levelStars.value = savedState.levelStars || {}
			coins.value = savedState.coins || 1251
			diamonds.value = savedState.diamonds || 251
			settings.value = { ...settings.value, ...savedState.settings }

			if (savedState.player) {
				player.value = { ...player.value, ...savedState.player }
			}

			console.log('Game state loaded from localStorage')
		} else {
			console.log('No saved game state found, using defaults')
		}
	}

	const resetProgress = () => {
		unlockedLevels.value = [1]
		completedLevels.value = []
		levelStars.value = {}
		coins.value = 1251
		diamonds.value = 251
		currentSession.value = {
			level: 1,
			score: 0,
			moves: 0,
			startTime: null,
			isPaused: false
		}
		console.log('Game progress reset')
	}

	// Watch for changes and auto-save (debounced)
	let saveTimeout = null
	const debouncedSave = () => {
		if (saveTimeout) clearTimeout(saveTimeout)
		saveTimeout = setTimeout(() => {
			saveGameState()
		}, 1000) // Save after 1 second of inactivity
	}

	// Watch important state changes for auto-save
	watch([unlockedLevels, completedLevels, levelStars, coins, diamonds, settings], debouncedSave, { deep: true })

	return {
		// State
		gameState,
		unlockedLevels,
		completedLevels,
		levelStars,
		totalStars,
		coins,
		diamonds,
		settings,
		currentSession,
		player,

		// Computed
		isLevelUnlocked,
		isLevelCompleted,
		getLevelStars,

		// Actions
		unlockLevel,
		completeLevel,
		addCoins,
		spendCoins,
		addDiamonds,
		spendDiamonds,
		startGameSession,
		pauseGame,
		resumeGame,
		updateScore,
		updateMoves,
		updateSettings,
		saveGameState,
		loadGameState,
		resetProgress
	}
})