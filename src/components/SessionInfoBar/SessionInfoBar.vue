<script setup>
import { computed } from 'vue'

// Props for session data and state
const props = defineProps({
  currentSession: {
    type: Object,
    required: true,
    validator: (session) => {
      return session &&
        typeof session.score === 'number' &&
        typeof session.moves === 'number'
    }
  },
  isGameActive: {
    type: Boolean,
    default: false
  },
  isGamePaused: {
    type: Boolean,
    default: false
  },
  formatNumber: {
    type: Function,
    required: true
  }
})

// Events emitted to parent component
const emit = defineEmits([
  'pause-game',
  'resume-game'
])

// Computed properties for display
const formattedScore = computed(() => {
  return props.formatNumber(props.currentSession.score)
})

const showCombo = computed(() => {
  return props.currentSession.combo > 1
})

const sessionStats = computed(() => {
  return [
    {
      icon: '🎯',
      label: 'moves',
      value: props.currentSession.moves
    },
    {
      icon: '📊',
      label: 'points',
      value: formattedScore.value
    }
  ]
})

// Event handlers
const handlePauseClick = () => {
  console.log('🎮 Pause requested from SessionInfoBar')
  emit('pause-game')
}

const handleResumeClick = () => {
  console.log('🎮 Resume requested from SessionInfoBar')
  emit('resume-game')
}
</script>

<template>
  <div class="session-info-bar">
    <!-- Session Statistics -->
    <div class="session-info-bar__stats">
      <span
        v-for="stat in sessionStats"
        :key="stat.label"
        class="session-info-bar__stat"
      >
        {{ stat.icon }} {{ stat.value }} {{ stat.label }}
      </span>

      <!-- Combo Display (only when combo > 1) -->
      <span
        v-if="showCombo"
        class="session-info-bar__stat session-info-bar__stat--combo"
      >
        🔥 {{ currentSession.combo }}x combo
      </span>
    </div>

    <!-- Session Controls -->
    <div class="session-info-bar__controls">
      <!-- Pause Button -->
      <button
        v-if="isGameActive && !isGamePaused"
        @click="handlePauseClick"
        class="btn btn--small btn--ghost session-info-bar__control-btn"
        aria-label="Pause game"
      >
        ⏸️ Pause
      </button>

      <!-- Resume Button -->
      <button
        v-else-if="isGamePaused"
        @click="handleResumeClick"
        class="btn btn--small session-info-bar__control-btn"
        aria-label="Resume game"
      >
        ▶️ Resume
      </button>

      <!-- No controls when game not active -->
      <span
        v-else-if="!isGameActive"
        class="session-info-bar__status"
      >
        Game Ready
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Session Info Bar Block
.session-info-bar {
  background-color: var(--bg-secondary);
  padding: var(--space-2) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--card-border);
  font-size: var(--font-size-sm);
  min-height: 50px;

  @media (min-width: vars.$breakpoint-md) {
    padding: var(--space-3) var(--space-8);
    font-size: var(--font-size-base);
  }

  // Stats Element
  &__stats {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    align-items: center;

    @media (max-width: vars.$breakpoint-sm) {
      gap: var(--space-2);
      flex-direction: column;
      align-items: flex-start;
    }

    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-6);
    }
  }

  &__stat {
    color: var(--text-secondary);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    transition: color 0.2s ease;

    @media (max-width: vars.$breakpoint-sm) {
      font-size: var(--font-size-xs);
    }

    // Combo modifier
    &--combo {
      color: var(--accent-color);
      font-weight: bold;
      animation: pulse-combo 0.5s ease-in-out;

      @media (min-width: vars.$breakpoint-md) {
        font-size: var(--font-size-lg);
      }
    }
  }

  // Controls Element
  &__controls {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    flex-shrink: 0;

    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-3);
    }
  }

  &__control-btn {
    min-width: 80px;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }

    @media (min-width: vars.$breakpoint-md) {
      min-width: 100px;
      padding: var(--space-2) var(--space-4);
    }
  }

  &__status {
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
    font-style: italic;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-sm);
    }
  }
}

// Animations
@keyframes pulse-combo {
  0% {
    transform: scale(1);
    text-shadow: none;
  }
  50% {
    transform: scale(1.1);
    text-shadow: 0 0 10px rgba(0, 184, 148, 0.5);
  }
  100% {
    transform: scale(1);
    text-shadow: none;
  }
}

// State-specific styling
.session-info-bar {
  // When game is paused
  &[data-game-paused="true"] {
    background-color: var(--warning-light);
    border-color: var(--warning-color);

    .session-info-bar__stats {
      opacity: 0.7;
    }
  }

  // When game is active
  &[data-game-active="true"] {
    border-color: var(--accent-color);

    .session-info-bar__stat {
      color: var(--text-color);
    }
  }
}

// Responsive improvements for very small screens
@media (max-width: 360px) {
  .session-info-bar {
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);

    &__stats {
      order: 2;
      justify-content: center;
      width: 100%;
    }

    &__controls {
      order: 1;
      justify-content: center;
      width: 100%;
    }

    &__control-btn {
      min-width: 120px;
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .session-info-bar__stat--combo {
    animation: none;
  }

  .session-info-bar__control-btn:hover {
    transform: none;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .session-info-bar {
    border-width: 2px;

    &__stat--combo {
      text-shadow: none;
      outline: 1px solid var(--accent-color);
      padding: var(--space-1);
      border-radius: var(--border-radius-sm);
    }
  }
}
</style>