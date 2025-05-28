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
  },
  currentSession: {
    type: Object,
    required: true,
    validator: (session) => {
      return session && typeof session.score === 'number' && typeof session.moves === 'number'
    }
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
    <!-- Level & Time Section -->
    <div class="game-stats-header__level-section">
      <span class="game-stats-header__level-text">LEVEL {{ currentLevelPadded }}</span>
      <span
        v-if="isGameActive"
        class="game-stats-header__time-display"
      >
        {{ formattedGameTime }}
      </span>
    </div>

    <!-- Game Stats Section -->
    <div class="game-stats-header__game-section">
      <div class="game-stats-header__stat game-stats-header__stat--score">
        <span class="game-stats-header__stat-value">{{ formatNumber(currentSession.score) }}</span>
        <span class="game-stats-header__stat-label">SCORE</span>
      </div>
      <div class="game-stats-header__stat game-stats-header__stat--moves">
        <span class="game-stats-header__stat-value">{{ currentSession.moves }}</span>
        <span class="game-stats-header__stat-label">MOVES</span>
      </div>
    </div>

    <!-- Currency Section -->
    <div class="game-stats-header__currency-section">
      <div class="game-stats-header__currency game-stats-header__currency--coins">
        <span class="game-stats-header__currency-value">{{ formattedCoins }}</span>
        <GameIcon name="coin" :size="16" class="game-stats-header__currency-icon" />
      </div>
      <div class="game-stats-header__currency game-stats-header__currency--diamonds">
        <span class="game-stats-header__currency-value">{{ formattedDiamonds }}</span>
        <GameIcon name="diamond" :size="19" class="game-stats-header__currency-icon" />
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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-4);
  align-items: center;
  border-bottom: 1px solid var(--card-border);

  @media (min-width: vars.$breakpoint-md) {
    padding: var(--space-4) var(--space-8);
    gap: var(--space-6);
  }

  // Mobile Stack Layout
  @media (max-width: vars.$breakpoint-sm) {
    grid-template-columns: 1fr;
    gap: var(--space-2);
    text-align: center;
  }

  // Level Section Element
  &__level-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);

    @media (max-width: vars.$breakpoint-sm) {
      align-items: center;
    }
  }

  // Game Section Element
  &__game-section {
    display: flex;
    gap: var(--space-4);
    justify-content: center;

    @media (max-width: vars.$breakpoint-sm) {
      gap: var(--space-6);
    }
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  &__stat-value {
    font-size: var(--font-size-lg);
    font-weight: bold;
    color: var(--text-color);

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-xl);
    }
  }

  &__stat-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  // Currency Section Element
  &__currency-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    align-items: flex-end;

    @media (max-width: vars.$breakpoint-sm) {
      align-items: center;
    }

    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-2);
    }
  }

  // Stat Color Modifiers
  &__stat--score {
    .game-stats-header__stat-value {
      color: var(--accent-color);
    }
  }

  &__stat--moves {
    .game-stats-header__stat-value {
      color: var(--info-color);
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