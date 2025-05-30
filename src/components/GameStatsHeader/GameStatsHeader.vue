<script setup>
import { computed } from 'vue'
import GameIcon from '../GameIcon/GameIcon.vue'
import ComboCircle from '../ComboCircle/ComboCircle.vue'

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
  currentSession: {
    type: Object,
    required: true,
    validator: (session) => {
      return session && typeof session.score === 'number' && typeof session.moves === 'number'
    }
  },
  formatNumber: {
    type: Function,
    default: (num) => {
      if (num >= 1000000) {
        return `${Math.floor(num / 100000) / 10}M`
      }
      if (num >= 1000) {
        return `${Math.floor(num / 100) / 10}k`
      }
      return num.toString()
    }
  },
  comboTimeLeft: {
    type: Number,
    default: 0
  },
  comboResetDelay: {
    type: Number,
    default: 6000
  }
})

// Computed properties for live updates
const currentLevelPadded = computed(() => {
  return props.currentLevel.toString().padStart(2, '0')
})

const formattedScore = computed(() => {
  return props.formatNumber(props.currentSession?.score || 0)
})

const currentMoves = computed(() => {
  return props.currentSession?.moves || 0
})

const currentCombo = computed(() => {
  return props.currentSession?.combo || 0
})

// Debug logging for combo
if (import.meta.env.DEV && props.currentSession?.combo > 0) {
  console.log('🔥 GameStatsHeader Combo Data:', {
    combo: props.currentSession?.combo,
    comboTimeLeft: props.comboTimeLeft,
    comboResetDelay: props.comboResetDelay,
    isGameActive: props.isGameActive
  })
}
</script>

<template>
  <div class="game-stats-header">
    <!-- Combo Section (Left) -->
    <div class="game-stats-header__combo-section">
      <ComboCircle
        :combo="currentCombo"
        :combo-time-left="comboTimeLeft"
        :combo-reset-delay="comboResetDelay"
        :size="80"
      />
    </div>

    <!-- Game Stats Section (Center) -->
    <div class="game-stats-header__game-section">
      <div class="game-stats-header__stat game-stats-header__stat--score">
        <span class="game-stats-header__stat-value">{{ formattedScore }}</span>
        <span class="game-stats-header__stat-label">SCORE</span>
      </div>
      <div class="game-stats-header__stat game-stats-header__stat--moves">
        <span class="game-stats-header__stat-value">{{ currentMoves }}</span>
        <span class="game-stats-header__stat-label">MOVES</span>
      </div>
    </div>

    <!-- Currency Section (Right) -->
    <div class="game-stats-header__currency-section">
      <div class="game-stats-header__level-text">LEVEL {{ currentLevelPadded }}</div>
      <div class="game-stats-header__currency-container">
        <div class="game-stats-header__currency game-stats-header__currency--coins">
          <span class="game-stats-header__currency-value">{{ coins }}</span>
          <GameIcon name="coin" :size="16" class="game-stats-header__currency-icon" />
        </div>
        <div class="game-stats-header__currency game-stats-header__currency--diamonds">
          <span class="game-stats-header__currency-value">{{ diamonds }}</span>
          <GameIcon name="diamond" :size="19" class="game-stats-header__currency-icon" />
        </div>
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

    // Stack vertically on mobile
    .game-stats-header__combo-section {
      order: 1;
    }

    .game-stats-header__game-section {
      order: 2;
    }

    .game-stats-header__currency-section {
      order: 3;
    }
  }

  // Combo Section Element (Left)
  &__combo-section {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 80px; // Reserve space even when combo not shown

    @media (max-width: vars.$breakpoint-sm) {
      justify-content: center;
      min-height: 60px;
    }
  }

  // Level Text (moved to currency section)
  &__level-text {
    font-size: var(--font-size-sm);
    font-weight: bold;
    color: var(--accent-color);
    padding: var(--space-1) var(--space-2);
    background: rgba(0, 184, 148, 0.1);
    border-radius: var(--border-radius-md);
    animation: subtle-pulse 3s ease-in-out infinite;
    text-align: center;
    margin-bottom: var(--space-1);
  }

  // Game Section Element (Center)
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
    min-width: 60px;
  }

  &__stat-value {
    font-size: var(--font-size-lg);
    font-weight: bold;
    color: var(--text-color);
    transition: all 0.3s ease;

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

  // Currency Section Element (Right)
  &__currency-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    @media (max-width: vars.$breakpoint-sm) {
      align-items: center;
    }
  }

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
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: var(--card-bg-hover);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--card-border);
  }

  &__currency-value {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);
    min-width: 40px;
    text-align: right;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-base);
      min-width: 50px;
    }
  }

  &__currency-icon {
    flex-shrink: 0;
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

// Animations
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