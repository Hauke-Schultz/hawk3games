<script setup>
import { computed } from 'vue'
import { useLevelRewards } from '../../composables/useLevelRewards.js'

const props = defineProps({
  rewardData: {
    type: Object,
    required: true
  },
  achievements: {
    type: Array,
    default: () => []
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const { getRewardSummary } = useLevelRewards()

const rewardSummary = computed(() => {
  if (!props.rewardData) return null
  return getRewardSummary(props.rewardData)
})

const hasCoins = computed(() => props.rewardData?.totalCoins > 0)
const hasDiamonds = computed(() => props.rewardData?.totalDiamonds > 0)
const hasAchievements = computed(() => props.achievements.length > 0)
</script>

<template>
  <div
    v-if="visible && rewardData"
    class="level-reward-display"
  >
    <div class="rewards">
      <h4 class="rewards__title">Level Rewards</h4>

      <!-- Coin Rewards -->
      <div v-if="hasCoins" class="rewards__section">
        <div class="rewards__currency">
          <span class="rewards__currency-icon">💰</span>
          <span class="rewards__currency-amount">{{ rewardData.totalCoins }}</span>
          <span class="rewards__currency-label">Coins</span>
        </div>

        <div class="rewards__breakdown">
          <div
            v-for="item in rewardSummary.coinBreakdown"
            :key="item.source"
            class="rewards__breakdown-item"
          >
            <span class="rewards__breakdown-source">{{ item.source }}</span>
            <span class="rewards__breakdown-amount">+{{ item.amount }}</span>
          </div>
        </div>
      </div>

      <!-- Diamond Rewards -->
      <div v-if="hasDiamonds" class="rewards__section">
        <div class="rewards__currency">
          <span class="rewards__currency-icon">💎</span>
          <span class="rewards__currency-amount">{{ rewardData.totalDiamonds }}</span>
          <span class="rewards__currency-label">Diamonds</span>
        </div>

        <div class="rewards__breakdown">
          <div
            v-for="item in rewardSummary.diamondBreakdown"
            :key="item.source"
            class="rewards__breakdown-item"
          >
            <span class="rewards__breakdown-source">{{ item.source }}</span>
            <span class="rewards__breakdown-amount">+{{ item.amount }}</span>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div v-if="hasAchievements" class="rewards__achievements">
        <h5 class="rewards__achievements-title">Achievements Unlocked!</h5>
        <div
          v-for="achievement in achievements"
          :key="achievement.type"
          class="rewards__achievement"
        >
          <span class="rewards__achievement-icon">🏆</span>
          <div class="rewards__achievement-info">
            <span class="rewards__achievement-title">{{ achievement.title }}</span>
            <span class="rewards__achievement-description">{{ achievement.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.level-reward-display {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--card-border);
}

.rewards {
  &__title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-base);
    font-weight: bold;
    color: var(--accent-color);
    text-align: center;
  }

  &__section {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    justify-content: space-between;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__currency {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    padding: var(--space-2);
    background: var(--bg-secondary);
    border-radius: var(--border-radius-md);
  }

  &__currency-icon {
    font-size: var(--font-size-lg);
  }

  &__currency-amount {
    font-size: var(--font-size-lg);
    font-weight: bold;
    color: var(--text-color);
  }

  &__currency-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  &__breakdown {
    display: flex;
    flex-direction: column;
  }

  &__breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  &__breakdown-source {
    flex: 1;
  }

  &__breakdown-amount {
    font-weight: 600;
    color: var(--success-color);
    min-width: 40px;
    text-align: right;
  }

  &__achievements {
    margin-top: var(--space-4);
    padding-top: var(--space-3);
    border-top: 1px solid var(--card-border);
  }

  &__achievements-title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-sm);
    font-weight: bold;
    color: var(--warning-color);
    text-align: center;
  }

  &__achievement {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    padding: var(--space-2);
    background: rgba(253, 203, 110, 0.1);
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--warning-color);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__achievement-icon {
    font-size: var(--font-size-base);
    flex-shrink: 0;
  }

  &__achievement-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__achievement-title {
    font-size: var(--font-size-sm);
    font-weight: bold;
    color: var(--text-color);
  }

  &__achievement-description {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }
}
</style>