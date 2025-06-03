<script setup>
import { computed } from 'vue'
import GameIcon from '../GameIcon/GameIcon.vue'
import StatCircle from '../StatCircle/StatCircle.vue'

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
  },
  isGameOver: {
    type: Boolean,
    default: false
  },
  onBackToLevels: {
    type: Function,
    default: null
  },
  comboMessage: {
    type: Object,
    default: null,
    validator: (message) => {
      return !message || (message.message && message.type && typeof message.combo === 'number')
    }
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

const showGameOverMessage = computed(() => {
  return props.isGameOver && props.currentSession?.status === 'game_over'
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
    <!-- First Row: Level, Message, Score, Diamonds -->
    <div class="game-stats-header__top-row">
      <!-- Level Display -->
      <div class="game-stats-header__level">
        <span class="game-stats-header__level-text">LEVEL {{ currentLevelPadded }}</span>
      </div>

      <!-- Message Area (Game Over, Success, etc.) -->
      <div class="game-stats-header__message">
        <!-- Game Over Message -->
        <div
          v-if="showGameOverMessage"
          class="game-stats-header__game-over-container"
        >
          <div class="game-stats-header__game-over">
            <span class="game-stats-header__message-text game-stats-header__message-text--danger">
              GAME OVER
            </span>
          </div>
          <button
            v-if="onBackToLevels"
            class="btn"
            @click="onBackToLevels"
          >
            Back to Levels
          </button>
        </div>
        <Transition name="combo-message">
        <span
          v-if="comboMessage && !isGameOver"
          class="game-stats-header__message-text"
          :class="{
            'game-stats-header__message-text--combo': comboMessage.type === 'combo',
            'game-stats-header__message-text--achievement': comboMessage.type === 'achievement',
            'game-stats-header__message-text--legendary': comboMessage.combo >= 10
          }"
        >
          {{ comboMessage.message }}
        </span>
        </Transition>
      </div>
    </div>

    <!-- Second Row: Combo, Score Circle, Moves Circle -->
    <div class="game-stats-header__bottom-row">
      <!-- Combo Circle -->
      <div class="game-stats-header__stat">
        <StatCircle
          :value="currentCombo"
          label="COMBO"
          type="combo"
          :time-left="comboTimeLeft"
          :max-time="comboResetDelay"
          :size="70"
          color="var(--accent-color)"
        />
      </div>

      <!-- Score Circle -->
      <div class="game-stats-header__stat">
        <StatCircle
          :value="currentSession.score"
          label="SCORE"
          type="basic"
          :size="80"
          color="var(--accent-color)"
        />
      </div>

      <!-- Moves Circle -->
      <div class="game-stats-header__stat">
        <StatCircle
          :value="currentSession.moves"
          label="MOVES"
          type="basic"
          :size="80"
          color="var(--info-color)"
        />
      </div>

      <!-- Coins and Diamonds -->
      <div class="game-stats-header__stat game-stats-header__profile">
        <!-- Coins Display -->
        <div class="game-stats-header__coins">
          <span class="game-stats-header__coins-value">{{ coins }}</span>
          <GameIcon name="coin" :size="14" class="game-stats-header__coins-icon" />
        </div>

        <!-- Diamonds -->
        <div class="game-stats-header__diamonds">
          <span class="game-stats-header__diamonds-value">{{ diamonds }}</span>
          <GameIcon name="diamond" :size="16" class="game-stats-header__diamonds-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Game Stats Header Block
.game-stats-header {
  display: flex;
  flex-direction: column;

  // Top Row - Level, Message, Score, Diamonds
  &__top-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: var(--space-4);
    align-items: center;

    @media (max-width: vars.$breakpoint-sm) {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);

      .game-stats-header__message {
        grid-column: 1 / -1; // Full width for message on mobile
        order: -1; // Message on top on mobile
      }
    }
  }

  // Bottom Row - Circles
  &__bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-6);

    @media (max-width: vars.$breakpoint-sm) {
      gap: var(--space-4);
    }
  }

  // Level Element
  &__level {
    display: flex;
    align-items: center;
  }

  &__level-text {
    font-size: var(--font-size-sm);
    font-weight: bold;
    color: var(--accent-color);
    padding: var(--space-1) var(--space-3);
    background: rgba(0, 184, 148, 0.1);
    border-radius: var(--border-radius-md);
    animation: subtle-pulse 3s ease-in-out infinite;
    white-space: nowrap;
  }

  // Message Element
  &__message {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: var(--space-10);

    @media (max-width: vars.$breakpoint-sm) {
      text-align: center;
    }
  }

  &__message-text {
    font-size: var(--font-size-base);
    font-weight: bold;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--border-radius-md);
    white-space: nowrap;

    &--danger {
      color: var(--error-color);
      background: rgba(225, 112, 85, 0.1);
      border: 1px solid var(--error-color);
      animation: danger-pulse 1s ease-in-out infinite;
    }

    &--success {
      color: var(--success-color);
      background: rgba(0, 184, 148, 0.1);
      border: 1px solid var(--success-color);
    }

    &--warning {
      color: var(--warning-color);
      background: rgba(253, 203, 110, 0.1);
      border: 1px solid var(--warning-color);
    }

    &--combo {
      color: var(--accent-color);
      background: rgba(0, 184, 148, 0.1);
      border: 1px solid var(--accent-color);
      animation: combo-pulse 0.6s ease-in-out;
    }

    &--achievement {
      color: var(--warning-color);
      background: rgba(253, 203, 110, 0.1);
      border: 1px solid var(--warning-color);
      animation: achievement-bounce 0.8s ease-in-out;
    }

    &--legendary {
      color: #e84393;
      background: linear-gradient(45deg, #531633, #421f2d);
      border: 1px solid #e84393;
      animation: legendary-glow 1s ease-in-out infinite alternate;
    }
  }

  // Score Element (top row)
  &__score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  &__score-value {
    font-size: var(--font-size-lg);
    font-weight: bold;
    color: var(--accent-color);
    line-height: 1;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-xl);
    }
  }

  &__score-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height: 1;
  }

  // Diamonds Element
  &__coins,
  &__diamonds {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__coins-value,
  &__diamonds-value {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);
    min-width: 30px;
    text-align: right;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-base);
      min-width: 40px;
    }
  }

  &__diamonds-icon {
    flex-shrink: 0;
  }

  // Stat Element (for circles)
  &__stat {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__profile {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;
  }

  .combo-message-enter-active,
  .combo-message-leave-active {
    transition: all 0.4s ease-out;
  }

  .combo-message-enter-from {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }

  .combo-message-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(1.1);
  }

  &__game-over-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
  }

  &__game-over {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
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

@keyframes danger-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes combo-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes achievement-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

@keyframes legendary-glow {
  0% {
    box-shadow: 0 0 5px rgba(232, 67, 147, 0.5);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 20px rgba(232, 67, 147, 0.8);
    transform: scale(1.02);
  }
}


// Mobile specific adjustments
@media (max-width: vars.$breakpoint-sm) {
  .game-stats-header {
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);

    &__level-text {
      font-size: var(--font-size-xs);
      padding: var(--space-1) var(--space-2);
    }

    &__message-text {
      font-size: var(--font-size-sm);
    }

    &__score-value {
      font-size: var(--font-size-base);
    }

    &__diamonds-value {
      font-size: var(--font-size-xs);
      min-width: 25px;
    }

    &__diamonds-icon {
      width: 14px;
      height: 14px;
    }
  }
}
</style>