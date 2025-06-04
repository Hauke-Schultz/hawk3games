import { computed } from 'vue'
import { useCurrencyStore } from '../stores/currencyStore.js'
import { useLevelStore } from '../stores/levelStore.js'

export function useLevelRewards() {
	const currencyStore = useCurrencyStore()
	const levelStore = useLevelStore()

	// Base reward calculation
	const calculateBaseRewards = (levelId, stars) => {
		// Progressive base rewards
		const baseCoins = Math.max(50, levelId * 30)
		const baseDiamonds = levelId >= 3 ? Math.floor(levelId / 3) : 0

		// Star multipliers
		const starMultiplier = {
			1: 1.0,   // 1 star = base reward
			2: 1.5,   // 2 stars = 50% bonus
			3: 2.0    // 3 stars = 100% bonus
		}

		const multiplier = starMultiplier[stars] || 1.0

		const finalCoins = Math.floor(baseCoins * multiplier)
		const finalDiamonds = stars === 3 ? baseDiamonds + 1 : baseDiamonds // Extra diamond for perfect

		return {
			coins: finalCoins,
			diamonds: finalDiamonds,
			multiplier,
			baseCoins,
			baseDiamonds
		}
	}

	// Bonus reward calculation
	const calculateBonusRewards = (levelId, stars, score, moves, timeMs) => {
		let bonusCoins = 0
		let bonusDiamonds = 0
		const bonuses = []

		// Perfect score bonus (3 stars)
		if (stars === 3) {
			bonusCoins += 25
			bonuses.push({ type: 'perfect', amount: 25, currency: 'coins', description: 'Perfect Level!' })
		}

		// Efficiency bonus (low moves)
		const goalMoves = 20 + (levelId * 5) // Expected moves per level
		if (moves <= goalMoves * 0.7) { // 30% under expected
			bonusCoins += 15
			bonuses.push({ type: 'efficiency', amount: 15, currency: 'coins', description: 'Efficient Play!' })
		}

		// High score bonus
		const expectedScore = levelId * 500
		if (score >= expectedScore * 2) { // Double expected score
			bonusDiamonds += 1
			bonuses.push({ type: 'highscore', amount: 1, currency: 'diamonds', description: 'High Score!' })
		}

		// First time completion bonus
		if (!levelStore.isLevelCompleted(levelId)) {
			bonusCoins += 10
			bonuses.push({ type: 'firsttime', amount: 10, currency: 'coins', description: 'First Clear!' })
		}

		return {
			bonusCoins,
			bonusDiamonds,
			bonuses
		}
	}

	// Complete reward calculation
	const calculateLevelRewards = (levelId, stars, score, moves, timeMs) => {
		const baseRewards = calculateBaseRewards(levelId, stars)
		const bonusRewards = calculateBonusRewards(levelId, stars, score, moves, timeMs)

		const totalCoins = baseRewards.coins + bonusRewards.bonusCoins
		const totalDiamonds = baseRewards.diamonds + bonusRewards.bonusDiamonds

		return {
			// Totals
			totalCoins,
			totalDiamonds,

			// Breakdown
			base: baseRewards,
			bonus: bonusRewards,

			// Summary
			summary: {
				level: levelId,
				stars,
				score,
				moves,
				timeMs,
				coinsEarned: totalCoins,
				diamondsEarned: totalDiamonds,
				bonusCount: bonusRewards.bonuses.length
			}
		}
	}

	// Award rewards to player
	const awardLevelRewards = (rewardData) => {
		const { totalCoins, totalDiamonds, summary } = rewardData

		// Award coins
		if (totalCoins > 0) {
			currencyStore.addCoins(
				totalCoins,
				currencyStore.CURRENCY_SOURCE.LEVEL_COMPLETION,
				`Level ${summary.level} (${summary.stars} stars)`
			)
		}

		// Award diamonds
		if (totalDiamonds > 0) {
			currencyStore.addDiamonds(
				totalDiamonds,
				currencyStore.CURRENCY_SOURCE.LEVEL_COMPLETION,
				`Level ${summary.level} (${summary.stars} stars)`
			)
		}

		console.log(`💰 Awarded ${totalCoins} coins + ${totalDiamonds} diamonds for level ${summary.level}`)

		return {
			success: true,
			coinsAwarded: totalCoins,
			diamondsAwarded: totalDiamonds
		}
	}

	// Preview rewards (without awarding)
	const previewLevelRewards = (levelId, stars, score, moves, timeMs) => {
		return calculateLevelRewards(levelId, stars, score, moves, timeMs)
	}

	// Get reward summary for UI display
	const getRewardSummary = (rewardData) => {
		const { base, bonus, totalCoins, totalDiamonds } = rewardData

		return {
			coinBreakdown: [
				{ source: 'Base Reward', amount: base.coins },
				...bonus.bonuses
					.filter(b => b.currency === 'coins')
					.map(b => ({ source: b.description, amount: b.amount }))
			],
			diamondBreakdown: [
				{ source: 'Base Reward', amount: base.diamonds },
				...bonus.bonuses
					.filter(b => b.currency === 'diamonds')
					.map(b => ({ source: b.description, amount: b.amount }))
			],
			totals: {
				coins: totalCoins,
				diamonds: totalDiamonds
			}
		}
	}

	// Achievement check for rewards
	const checkRewardAchievements = (rewardData) => {
		const achievements = []
		const { summary, bonus } = rewardData

		// Check for special achievements
		if (summary.stars === 3 && summary.level >= 5) {
			achievements.push({
				type: 'perfectionist',
				title: 'Perfectionist',
				description: `Perfect score on Level ${summary.level}!`,
				reward: { coins: 50, diamonds: 2 }
			})
		}

		if (bonus.bonuses.length >= 3) {
			achievements.push({
				type: 'bonus_master',
				title: 'Bonus Master',
				description: 'Earned all bonus rewards!',
				reward: { coins: 25, diamonds: 1 }
			})
		}

		return achievements
	}

	return {
		// Core functions
		calculateLevelRewards,
		awardLevelRewards,
		previewLevelRewards,

		// Helper functions
		calculateBaseRewards,
		calculateBonusRewards,
		getRewardSummary,
		checkRewardAchievements
	}
}