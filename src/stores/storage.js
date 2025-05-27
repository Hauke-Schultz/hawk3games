// LocalStorage utilities for game state persistence
// Handles saving/loading with error handling and data validation

const STORAGE_PREFIX = 'hawk3games_'
const STORAGE_VERSION = '1.0.0'

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key (will be prefixed)
 * @param {any} data - Data to save (will be JSON.stringify'd)
 * @returns {boolean} - Success status
 */
export const saveToStorage = (key, data) => {
	try {
		const storageKey = STORAGE_PREFIX + key
		const dataWithVersion = {
			version: STORAGE_VERSION,
			timestamp: Date.now(),
			data: data
		}

		localStorage.setItem(storageKey, JSON.stringify(dataWithVersion))
		return true
	} catch (error) {
		console.error('Failed to save to localStorage:', error)
		return false
	}
}

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key (will be prefixed)
 * @returns {any|null} - Loaded data or null if not found/invalid
 */
export const loadFromStorage = (key) => {
	try {
		const storageKey = STORAGE_PREFIX + key
		const rawData = localStorage.getItem(storageKey)

		if (!rawData) {
			return null
		}

		const parsedData = JSON.parse(rawData)

		// Version check for future migrations
		if (parsedData.version !== STORAGE_VERSION) {
			console.warn(`Storage version mismatch for ${key}. Expected ${STORAGE_VERSION}, got ${parsedData.version}`)
			// Could implement migration logic here in the future
		}

		return parsedData.data
	} catch (error) {
		console.error('Failed to load from localStorage:', error)
		return null
	}
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @returns {boolean} - Success status
 */
export const removeFromStorage = (key) => {
	try {
		const storageKey = STORAGE_PREFIX + key
		localStorage.removeItem(storageKey)
		return true
	} catch (error) {
		console.error('Failed to remove from localStorage:', error)
		return false
	}
}

/**
 * Check if localStorage is available
 * @returns {boolean} - Availability status
 */
export const isStorageAvailable = () => {
	try {
		const testKey = STORAGE_PREFIX + 'test'
		localStorage.setItem(testKey, 'test')
		localStorage.removeItem(testKey)
		return true
	} catch (error) {
		console.warn('localStorage is not available:', error)
		return false
	}
}

/**
 * Get storage usage info
 * @returns {object} - Storage usage statistics
 */
export const getStorageInfo = () => {
	try {
		let totalSize = 0
		let gameDataSize = 0

		for (let key in localStorage) {
			if (localStorage.hasOwnProperty(key)) {
				const itemSize = localStorage[key].length
				totalSize += itemSize

				if (key.startsWith(STORAGE_PREFIX)) {
					gameDataSize += itemSize
				}
			}
		}

		return {
			totalSize,
			gameDataSize,
			totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
			gameDataSizeKB: Math.round(gameDataSize / 1024 * 100) / 100
		}
	} catch (error) {
		console.error('Failed to get storage info:', error)
		return null
	}
}

/**
 * Clear all game data from localStorage
 * @returns {boolean} - Success status
 */
export const clearGameData = () => {
	try {
		const keysToRemove = []

		// Find all game-related keys
		for (let key in localStorage) {
			if (key.startsWith(STORAGE_PREFIX)) {
				keysToRemove.push(key)
			}
		}

		// Remove all game keys
		keysToRemove.forEach(key => {
			localStorage.removeItem(key)
		})

		console.log(`Cleared ${keysToRemove.length} game data entries from localStorage`)
		return true
	} catch (error) {
		console.error('Failed to clear game data:', error)
		return false
	}
}

/**
 * Export game data as JSON string
 * @returns {string|null} - JSON string of all game data
 */
export const exportGameData = () => {
	try {
		const gameData = {}

		for (let key in localStorage) {
			if (key.startsWith(STORAGE_PREFIX)) {
				const cleanKey = key.replace(STORAGE_PREFIX, '')
				gameData[cleanKey] = JSON.parse(localStorage[key])
			}
		}

		return JSON.stringify(gameData, null, 2)
	} catch (error) {
		console.error('Failed to export game data:', error)
		return null
	}
}

/**
 * Import game data from JSON string
 * @param {string} jsonData - JSON string of game data
 * @returns {boolean} - Success status
 */
export const importGameData = (jsonData) => {
	try {
		const gameData = JSON.parse(jsonData)

		for (let key in gameData) {
			const storageKey = STORAGE_PREFIX + key
			localStorage.setItem(storageKey, JSON.stringify(gameData[key]))
		}

		console.log('Game data imported successfully')
		return true
	} catch (error) {
		console.error('Failed to import game data:', error)
		return false
	}
}