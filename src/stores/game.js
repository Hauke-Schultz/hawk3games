// Game Type Definitions and Default State Creators
// Defines the structure of game state objects and provides factory functions

/**
 * Level difficulty enum
 */
export const LEVEL_DIFFICULTY = {
	EASY: 'easy',
	MEDIUM: 'medium',
	HARD: 'hard',
	EXPERT: 'expert'
}

/**
 * Game session status enum
 */
export const GAME_STATUS = {
	NOT_STARTED: 'not_started',
	PLAYING: 'playing',
	PAUSED: 'paused',
	COMPLETED: 'completed',
	GAME_OVER: 'game_over'
}

/**
 * Achievement types enum
 */
export const ACHIEVEMENT_TYPE = {
	LEVEL_COMPLETION: 'level_completion',
	SCORE_MILESTONE: 'score_milestone',
	CURRENCY_MILESTONE: 'currency_milestone',
	STREAK_MILESTONE: 'streak_milestone',
	SPECIAL_CONDITION: 'special_condition'
}

/**
 * Create default player object
 * @returns {object} Default player state
 */
export const createDefaultPlayer = () => ({
	id: crypto.randomUUID(),
	name: 'Player',
	createdAt: Date.now(),
	lastPlayed: Date.now(),
	totalPlayTime: 0, // in milliseconds
	gamesPlayed: 0,
	highestScore: 0
})

/**
 * Create default level object
 * @param {number} id - Level ID
 * @param {string} name - Level name
 * @param {string} description - Level description
 * @param {string} difficulty - Level difficulty
 * @returns {object} Default level state
 */
export const createDefaultLevel = (id, name, description, difficulty = LEVEL_DIFFICULTY.EASY) => ({
	id,
	name,
	description,
	difficulty,
	unlocked: id === 1, // First level is always unlocked
	completed: false,
	stars: 0,
	bestScore: 0,
	bestMoves: null,
	bestTime: null,
	attempts: 0,
	firstCompletedAt: null,
	lastPlayedAt: null
})

/**
 * Create default game session object
 * @param {number} levelId - Current level ID
 * @returns {object} Default game session state
 */
export const createDefaultGameSession = (levelId = 1) => ({
	level: levelId,
	status: GAME_STATUS.NOT_STARTED,
	score: 0,
	moves: 0,
	startTime: null,
	endTime: null,
	pausedTime: 0, // Total time paused
	isPaused: false,
	combo: 0,
	maxCombo: 0,
	specialMoves: 0
})

/**
 * Create default currency object
 * @returns {object} Default currency state
 */
export const createDefaultCurrency = () => ({
	coins: 1251,
	diamonds: 251,
	totalCoinsEarned: 1251,
	totalDiamondsEarned: 251,
	totalCoinsSpent: 0,
	totalDiamondsSpent: 0
})

/**
 * Create default settings object
 * @returns {object} Default settings state
 */
export const createDefaultSettings = () => ({
	soundEnabled: true,
	musicEnabled: true,
	hapticEnabled: true,
	musicVolume: 0.7,
	soundVolume: 0.8,
	difficulty: LEVEL_DIFFICULTY.MEDIUM,
	autoSave: true,
	notifications: true,
	analytics: true
})

/**
 * Create default progress object
 * @returns {object} Default progress state
 */
export const createDefaultProgress = () => ({
	unlockedLevels: [1],
	completedLevels: [],
	levelStars: {}, // { levelId: starCount }
	totalStars: 0,
	currentStreak: 0,
	bestStreak: 0,
	totalScore: 0,
	perfectLevels: [], // Levels completed with 3 stars
	achievements: [],
	statistics: {
		gamesPlayed: 0,
		totalPlayTime: 0,
		averageScore: 0,
		totalMoves: 0,
		perfectGames: 0
	}
})

/**
 * Create default achievement object
 * @param {string} id - Achievement ID
 * @param {string} name - Achievement name
 * @param {string} description - Achievement description
 * @param {string} type - Achievement type
 * @param {any} target - Target value to unlock
 * @returns {object} Default achievement state
 */
export const createDefaultAchievement = (id, name, description, type, target) => ({
	id,
	name,
	description,
	type,
	target,
	unlocked: false,
	unlockedAt: null,
	progress: 0,
	icon: '🏆',
	rarity: 'common' // common, rare, epic, legendary
})

/**
 * Create default complete game state
 * @returns {object} Complete default game state
 */
export const createDefaultGameState = () => ({
	version: '1.0.0',
	player: createDefaultPlayer(),
	progress: createDefaultProgress(),
	currency: createDefaultCurrency(),
	settings: createDefaultSettings(),
	currentSession: createDefaultGameSession(),
	achievements: [],
	statistics: {
		sessionCount: 0,
		totalPlayTime: 0,
		averageSessionTime: 0,
		lastSaveTime: Date.now()
	}
})

/**
 * Level configuration for FruitMerge game
 * @returns {array} Array of all level configurations
 */
export const createLevelConfigurations = () => [
	createDefaultLevel(1, "Getting Started", "Learn the basics", LEVEL_DIFFICULTY.EASY),
	createDefaultLevel(2, "Apple Merge", "Combine red apples", LEVEL_DIFFICULTY.EASY),
	createDefaultLevel(3, "Citrus Rush", "Orange challenge", LEVEL_DIFFICULTY.EASY),
	createDefaultLevel(4, "Berry Blast", "Purple berry fun", LEVEL_DIFFICULTY.MEDIUM),
	createDefaultLevel(5, "Tropical Mix", "Exotic fruits", LEVEL_DIFFICULTY.MEDIUM),
	createDefaultLevel(6, "Melon Madness", "Big fruit merge", LEVEL_DIFFICULTY.MEDIUM),
	createDefaultLevel(7, "Fruit Salad", "Mix everything", LEVEL_DIFFICULTY.HARD),
	createDefaultLevel(8, "Super Combo", "Advanced merging", LEVEL_DIFFICULTY.HARD),
	createDefaultLevel(9, "Master Level", "Ultimate challenge", LEVEL_DIFFICULTY.EXPERT)
]

/**
 * Validate game state structure
 * @param {object} gameState - Game state to validate
 * @returns {boolean} Whether the game state is valid
 */
export const validateGameState = (gameState) => {
	try {
		return (
			gameState &&
			typeof gameState === 'object' &&
			gameState.player &&
			gameState.progress &&
			gameState.currency &&
			gameState.settings &&
			gameState.currentSession &&
			Array.isArray(gameState.achievements)
		)
	} catch (error) {
		console.error('Game state validation failed:', error)
		return false
	}
}