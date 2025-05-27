// Pinia Store Configuration and Export
// Central hub for all game stores

// Import all stores
export { useGameStore } from './gameStore.js'
export { useLevelStore } from './levelStore.js'
export { useCurrencyStore } from './currencyStore.js'
export { useSessionStore } from './sessionStore.js'

// Store utilities and helpers
export const STORAGE_KEYS = {
	GAME_STATE: 'hawk3games_state',
	LEVEL_DATA: 'hawk3games_levels',
	CURRENCY_DATA: 'hawk3games_currency',
	PLAYER_DATA: 'hawk3games_player',
	SETTINGS: 'hawk3games_settings'
}

// Version management for state migrations
export const STATE_VERSION = '1.0.0'

// Combined store initialization function
export const initializeAllStores = () => {
	console.log('🏗️ Initializing all game stores...')

	// Initialize stores in order of dependency
	const gameStore = useGameStore()
	const levelStore = useLevelStore()
	const currencyStore = useCurrencyStore()
	const sessionStore = useSessionStore()

	// Load saved data
	gameStore.loadGameState()
	levelStore.loadLevelData()
	currencyStore.loadCurrencyData()

	console.log('✅ All stores initialized successfully')

	return {
		gameStore,
		levelStore,
		currencyStore,
		sessionStore
	}
}

// Combined save function for all stores
export const saveAllStores = () => {
	console.log('💾 Saving all store data...')

	const gameStore = useGameStore()
	const levelStore = useLevelStore()
	const currencyStore = useCurrencyStore()

	const results = {
		game: gameStore.saveGameState(),
		levels: levelStore.saveLevelData(),
		currency: currencyStore.saveCurrencyData()
	}

	console.log('✅ All stores saved:', results)
	return results
}

// Default state reset function
export const resetAllStores = () => {
	console.log('🔄 Resetting all stores...')

	// Clear localStorage
	Object.values(STORAGE_KEYS).forEach(key => {
		localStorage.removeItem(key)
	})

	// Reset individual stores
	const gameStore = useGameStore()
	const levelStore = useLevelStore()
	const currencyStore = useCurrencyStore()
	const sessionStore = useSessionStore()

	gameStore.resetProgress()
	levelStore.resetAllProgress()
	currencyStore.resetCurrency()
	sessionStore.resetAllSessions()

	console.log('✅ All stores reset to defaults')

	// Optionally reload page for fresh start
	// window.location.reload()
}

// Development/debug helper functions
export const getStoreStatistics = () => {
	const gameStore = useGameStore()
	const levelStore = useLevelStore()
	const currencyStore = useCurrencyStore()
	const sessionStore = useSessionStore()

	return {
		levels: levelStore.getLevelStatistics(),
		currency: currencyStore.getCurrencyStatistics(),
		sessions: sessionStore.getSessionStatistics(),
		gameState: {
			player: gameStore.player,
			settings: gameStore.settings
		}
	}
}

// Store health check
export const checkStoreHealth = () => {
	try {
		const stats = getStoreStatistics()
		console.log('🏥 Store Health Check:', stats)
		return true
	} catch (error) {
		console.error('❌ Store Health Check Failed:', error)
		return false
	}
}