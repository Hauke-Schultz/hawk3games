// src/composables/useLevelRewards.js
export function useLevelRewards() {
	const getRewardSummary = (rewardData) => {
		if (!rewardData) return null

		const coinBreakdown = []
		const diamondBreakdown = []

		// Coin breakdown
		if (rewardData.breakdown?.baseReward > 0) {
			coinBreakdown.push({
				source: 'Level Completion',
				amount: rewardData.breakdown.baseReward
			})
		}

		if (rewardData.breakdown?.starBonus > 0) {
			coinBreakdown.push({
				source: 'Star Bonus',
				amount: rewardData.breakdown.starBonus
			})
		}

		if (rewardData.bonusCoins > 0) {
			coinBreakdown.push({
				source: 'Special Bonus',
				amount: rewardData.bonusCoins
			})
		}

		// Diamond breakdown
		if (rewardData.breakdown?.perfectBonus > 0) {
			diamondBreakdown.push({
				source: 'Perfect Clear',
				amount: rewardData.breakdown.perfectBonus
			})
		}

		if (rewardData.bonusDiamonds > 0) {
			diamondBreakdown.push({
				source: 'Achievement Bonus',
				amount: rewardData.bonusDiamonds
			})
		}

		return {
			coinBreakdown,
			diamondBreakdown
		}
	}

	return {
		getRewardSummary
	}
}