<script setup>
import { computed } from 'vue'
import GameIcon from '../GameIcon/GameIcon.vue'

// Props for game state data
const props = defineProps({
  currentLevel: {
    type: Number,
    required: true
  },
  coins: {
    type: Number,
    required: true
  },
  diamonds: {
    type: Number,
    required: true
  },
  isGameActive: {
    type: Boolean,
    default: false
  },
  formattedGameTime: {
    type: String,
    default: '00:00'
  },
  formatNumber: {
    type: Function,
    required: true
  }
})

// Computed properties for display
const currentLevelPadded = computed(() => {
  return props.currentLevel.toString().padStart(2, '0')
})

const formattedCoins = computed(() => {
  return props.formatNumber(props.coins)
})

const formattedDiamonds = computed(() => {
  return props.formatNumber(props.diamonds)
})
</script>

<template>
  <div class="game-stats-header">
    <!-- Level Display -->
    <div class="game-stats-header__level-display">
      <span class="game-stats-header__level-text">LEVEL {{ currentLevelPadded }}</span>
      <span
        v-if="isGameActive"
        class="game-stats-header__time-display"
      >
        {{ formattedGameTime }}
      </span>
    </div>

    <!-- Currency Display -->
    <div class="game-stats-header__currency-container">
      <div class="game-stats-header__currency game-stats-header__currency--coins">
        <span class="game-stats-header__currency-value">{{ formattedCoins }}</span>
        <GameIcon
          name="coin"
          :size="16"
          class="game-stats-header__currency-icon"
        />
      </div>
      <div class="game-stats-header__currency game-stats-header__currency--diamonds">
        <span class="game-stats-header__currency-value">{{ formattedDiamonds }}</span>
        <GameIcon
          name="diamond"
          :size="19"
          class="game-stats-header__currency-icon"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Game Stats Header Block
.game-stats-header {
  background-color: var(--card-bg);
  padding: var(--space-3) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--card-border);

  @media (min-width: vars.$breakpoint-md) {
    padding: var(--space-4) var(--space-8);
  }

  // Level Display Element
  &__level-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: var(--space-1);
  }

  &__level-text {
    background-color: var(--accent-color);
    color: var(--white);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: bold;
    letter-spacing: 0.5px;
    align-self: flex-start;
    transition: all 0.2s ease;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-base);
      padding: var(--space-2) var(--space-6);
    }
  }

  &__time-display {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: 500;
    margin-left: var(--space-1);

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-sm);
    }
  }

  // Currency Container Element
  &__currency-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);

    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-2);
    }
  }

  &__currency {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-base);
      gap: var(--space-2);
    }
  }

  &__currency-value {
    font-size: var(--font-size-base);
    min-width: 40px;
    text-align: right;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-lg);
      min-width: 50px;
    }
  }

  &__currency-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    @media (min-width: vars.$breakpoint-md) {
      width: 20px;
      height: 20px;
    }
  }

  // Currency Type Modifiers
  &__currency--coins {
    .game-stats-header__currency-value {
      color: #f39c12;
    }
  }

  &__currency--diamonds {
    .game-stats-header__currency-value {
      color: #e84393;
    }
  }
}

// Animation for active game state
.game-stats-header__level-text {
  animation: subtle-pulse 3s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, 100% {
    box-shadow: 0 0 0 rgba(0, 184, 148, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 184, 148, 0.2);
  }
}

// Responsive adjustments for smaller screens
@media (max-width: vars.$breakpoint-sm) {
  .game-stats-header {
    padding: var(--space-2) var(--space-3);

    &__level-text {
      font-size: var(--font-size-xs);
      padding: var(--space-1) var(--space-3);
    }

    &__currency {
      font-size: var(--font-size-xs);
    }

    &__currency-value {
      font-size: var(--font-size-sm);
      min-width: 35px;
    }

    &__currency-icon {
      width: 14px;
      height: 14px;
    }
  }
}
</style>