import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { saveToStorage, loadFromStorage } from '../utils/storage.js'

// Currency Management Store - Handles coins, diamonds and transactions
export const useCurrencyStore = defineStore('currency', () => {
	// Currency state
	const coins = ref(1251)
	const diamonds = ref(251)

	// Currency tracking
	const totalCoinsEarned = ref(1251)
	const totalDiamondsEarned = ref(251)
	const totalCoinsSpent = ref(0)
	const totalDiamondsSpent = ref(0)

	// Transaction history (optional, for debugging/analytics)
	const transactionHistory = ref([])
	const maxHistoryLength = 100 // Keep last 100 transactions

	// Currency sources enum
	const CURRENCY_SOURCE = {
		LEVEL_COMPLETION: 'level_completion',
		DAILY_REWARD: 'daily_reward',
		ACHIEVEMENT: 'achievement',
		PURCHASE: 'purchase',
		BONUS: 'bonus',
		ADMIN: 'admin'
	}

	const CURRENCY_EXPENSE = {
		POWER_UP: 'power_up',
		HINT: 'hint',
		EXTRA_MOVES: 'extra_moves',
		UNLOCK_LEVEL: 'unlock_level',
		COSMETIC: 'cosmetic',
		OTHER: 'other'
	}

	// Computed values
	const totalWorth = computed(() => {
		return coins.value + (diamonds.value * 10) // 1 diamond = 10 coins worth
	})

	const netCoins = computed(() => {
		return totalCoinsEarned.value - totalCoinsSpent.value
	})

	const netDiamonds = computed(() => {
		return totalDiamondsEarned.value - totalDiamondsSpent.value
	})

	const spendingRatio = computed(() => {
		if (totalCoinsEarned.value === 0) return 0
		return Math.round((totalCoinsSpent.value / totalCoinsEarned.value) * 100)
	})

	// Helper functions
	const createTransaction = (type, amount, currency, source, description = '') => {
		return {
			id: crypto.randomUUID(),
			type, // 'earn' or 'spend'
			amount,
			currency, // 'coins' or 'diamonds'
			source,
			description,
			timestamp: Date.now(),
			balanceAfter: currency === 'coins' ? coins.value : diamonds.value
		}
	}

	const addTransaction = (transaction) => {
		transactionHistory.value.unshift(transaction)

		// Keep history within limits
		if (transactionHistory.value.length > maxHistoryLength) {
			transactionHistory.value = transactionHistory.value.slice(0, maxHistoryLength)
		}
	}

	// Currency earning actions
	const addCoins = (amount, source = CURRENCY_SOURCE.ADMIN, description = '') => {
		if (amount <= 0) {
			console.warn('Cannot add negative or zero coins')
			return false
		}

		const oldBalance = coins.value
		coins.value += amount
		totalCoinsEarned.value += amount

		// Record transaction
		const transaction = createTransaction('earn', amount, 'coins', source, description)
		addTransaction(transaction)

		console.log(`💰 +${amount} coins from ${source}. Balance: ${oldBalance} → ${coins.value}`)
		return true
	}

	const addDiamonds = (amount, source = CURRENCY_SOURCE.ADMIN, description = '') => {
		if (amount <= 0) {
			console.warn('Cannot add negative or zero diamonds')
			return false
		}

		const oldBalance = diamonds.value
		diamonds.value += amount
		totalDiamondsEarned.value += amount

		// Record transaction
		const transaction = createTransaction('earn', amount, 'diamonds', source, description)
		addTransaction(transaction)

		console.log(`💎 +${amount} diamonds from ${source}. Balance: ${oldBalance} → ${diamonds.value}`)
		return true
	}

	// Currency spending actions
	const spendCoins = (amount, expense = CURRENCY_EXPENSE.OTHER, description = '') => {
		if (amount <= 0) {
			console.warn('Cannot spend negative or zero coins')
			return false
		}

		if (coins.value < amount) {
			console.warn(`Insufficient coins. Need ${amount}, have ${coins.value}`)
			return false
		}

		const oldBalance = coins.value
		coins.value -= amount
		totalCoinsSpent.value += amount

		// Record transaction
		const transaction = createTransaction('spend', amount, 'coins', expense, description)
		addTransaction(transaction)

		console.log(`💰 -${amount} coins for ${expense}. Balance: ${oldBalance} → ${coins.value}`)
		return true
	}

	const spendDiamonds = (amount, expense = CURRENCY_EXPENSE.OTHER, description = '') => {
		if (amount <= 0) {
			console.warn('Cannot spend negative or zero diamonds')
			return false
		}

		if (diamonds.value < amount) {
			console.warn(`Insufficient diamonds. Need ${amount}, have ${diamonds.value}`)
			return false
		}

		const oldBalance = diamonds.value
		diamonds.value -= amount
		totalDiamondsSpent.value += amount

		// Record transaction
		const transaction = createTransaction('spend', amount, 'diamonds', expense, description)
		addTransaction(transaction)

		console.log(`💎 -${amount} diamonds for ${expense}. Balance: ${oldBalance} → ${diamonds.value}`)
		return true
	}

	// Convenience check functions
	const canAfford = (coinCost = 0, diamondCost = 0) => {
		return coins.value >= coinCost && diamonds.value >= diamondCost
	}

	const canAffordCoins = (amount) => {
		return coins.value >= amount
	}

	const canAffordDiamonds = (amount) => {
		return diamonds.value >= amount
	}

	// Batch operations
	const purchaseWithMixed = (coinCost = 0, diamondCost = 0, expense = CURRENCY_EXPENSE.OTHER, description = '') => {
		if (!canAfford(coinCost, diamondCost)) {
			console.warn(`Cannot afford purchase. Need ${coinCost} coins + ${diamondCost} diamonds`)
			return false
		}

		let success = true

		if (coinCost > 0) {
			success = success && spendCoins(coinCost, expense, description)
		}

		if (diamondCost > 0) {
			success = success && spendDiamonds(diamondCost, expense, description)
		}

		if (success) {
			console.log(`🛒 Purchase successful: ${coinCost} coins + ${diamondCost} diamonds for ${expense}`)
		}

		return success
	}

	// Level completion rewards
	const rewardForLevel = (levelId, stars = 1, bonus = false) => {
		let coinReward = 0
		let diamondReward = 0

		// Base rewards based on level
		coinReward = Math.max(50, levelId * 25)

		// Star bonuses
		coinReward += (stars - 1) * 25 // Bonus for 2-3 stars

		// Diamond rewards for perfect levels (3 stars)
		if (stars === 3) {
			diamondReward = Math.floor(levelId / 3) + 1 // More diamonds for later levels
		}

		// Bonus modifier
		if (bonus) {
			coinReward = Math.floor(coinReward * 1.5)
			diamondReward = Math.floor(diamondReward * 1.5)
		}

		// Award the currencies
		if (coinReward > 0) {
			addCoins(coinReward, CURRENCY_SOURCE.LEVEL_COMPLETION, `Level ${levelId} (${stars} stars)`)
		}

		if (diamondReward > 0) {
			addDiamonds(diamondReward, CURRENCY_SOURCE.LEVEL_COMPLETION, `Level ${levelId} perfect!`)
		}

		return { coins: coinReward, diamonds: diamondReward }
	}

	// Currency conversion (diamond to coins)
	const convertDiamondsToCoins = (diamondAmount, rate = 10) => {
		if (!canAffordDiamonds(diamondAmount)) {
			console.warn(`Cannot convert ${diamondAmount} diamonds - insufficient balance`)
			return false
		}

		const coinAmount = diamondAmount * rate

		if (spendDiamonds(diamondAmount, CURRENCY_EXPENSE.OTHER, 'Diamond to coin conversion')) {
			addCoins(coinAmount, CURRENCY_SOURCE.BONUS, 'Diamond conversion')
			console.log(`💱 Converted ${diamondAmount} diamonds to ${coinAmount} coins`)
			return true
		}

		return false
	}

	// Statistics and analytics
	const getCurrencyStatistics = () => {
		const coinTransactions = transactionHistory.value.filter(t => t.currency === 'coins')
		const diamondTransactions = transactionHistory.value.filter(t => t.currency === 'diamonds')

		return {
			currentBalance: {
				coins: coins.value,
				diamonds: diamonds.value,
				totalWorth: totalWorth.value
			},
			lifetime: {
				coinsEarned: totalCoinsEarned.value,
				diamondsEarned: totalDiamondsEarned.value,
				coinsSpent: totalCoinsSpent.value,
				diamondsSpent: totalDiamondsSpent.value,
				netCoins: netCoins.value,
				netDiamonds: netDiamonds.value
			},
			ratios: {
				spendingRatio: spendingRatio.value,
				diamondToCoinsRatio: diamonds.value > 0 ? Math.round((coins.value / diamonds.value) * 100) / 100 : 0
			},
			transactions: {
				total: transactionHistory.value.length,
				coinTransactions: coinTransactions.length,
				diamondTransactions: diamondTransactions.length,
				recentTransactions: transactionHistory.value.slice(0, 5)
			}
		}
	}

	// Admin/debug functions
	const resetCurrency = () => {
		coins.value = 1251
		diamonds.value = 251
		totalCoinsEarned.value = 1251
		totalDiamondsEarned.value = 251
		totalCoinsSpent.value = 0
		totalDiamondsSpent.value = 0
		transactionHistory.value = []

		console.log('💰 Currency reset to default values')
	}

	const addCheatCurrency = (coinAmount = 10000, diamondAmount = 1000) => {
		addCoins(coinAmount, CURRENCY_SOURCE.ADMIN, 'Cheat/Debug')
		addDiamonds(diamondAmount, CURRENCY_SOURCE.ADMIN, 'Cheat/Debug')
	}

	// Persistence
	const saveCurrencyData = () => {
		const dataToSave = {
			coins: coins.value,
			diamonds: diamonds.value,
			totalCoinsEarned: totalCoinsEarned.value,
			totalDiamondsEarned: totalDiamondsEarned.value,
			totalCoinsSpent: totalCoinsSpent.value,
			totalDiamondsSpent: totalDiamondsSpent.value,
			transactionHistory: transactionHistory.value.slice(0, 50) // Save last 50 transactions
		}

		return saveToStorage('currencyData', dataToSave)
	}

	const loadCurrencyData = () => {
		const savedData = loadFromStorage('currencyData')

		if (savedData) {
			coins.value = savedData.coins || 1251
			diamonds.value = savedData.diamonds || 251
			totalCoinsEarned.value = savedData.totalCoinsEarned || 1251
			totalDiamondsEarned.value = savedData.totalDiamondsEarned || 251
			totalCoinsSpent.value = savedData.totalCoinsSpent || 0
			totalDiamondsSpent.value = savedData.totalDiamondsSpent || 0
			transactionHistory.value = savedData.transactionHistory || []

			console.log('💰 Currency data loaded from storage')
			return true
		}

		console.log('💰 No saved currency data found, using defaults')
		return false
	}

	// Auto-save on changes
	watch([coins, diamonds], () => {
		// Debounced save will be handled by parent store
	}, { deep: true })

	return {
		// State
		coins,
		diamonds,
		totalCoinsEarned,
		totalDiamondsEarned,
		totalCoinsSpent,
		totalDiamondsSpent,
		transactionHistory,

		// Computed
		totalWorth,
		netCoins,
		netDiamonds,
		spendingRatio,

		// Constants
		CURRENCY_SOURCE,
		CURRENCY_EXPENSE,

		// Actions - Earning
		addCoins,
		addDiamonds,

		// Actions - Spending
		spendCoins,
		spendDiamonds,
		purchaseWithMixed,

		// Actions - Checks
		canAfford,
		canAffordCoins,
		canAffordDiamonds,

		// Actions - Special
		rewardForLevel,
		convertDiamondsToCoins,

		// Actions - Analytics
		getCurrencyStatistics,

		// Actions - Admin
		resetCurrency,
		addCheatCurrency,

		// Actions - Persistence
		saveCurrencyData,
		loadCurrencyData
	}
})