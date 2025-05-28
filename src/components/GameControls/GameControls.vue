<script setup>
import { computed } from 'vue'

// Props for game state and configuration
const props = defineProps({
  isGameActive: {
    type: Boolean,
    default: false
  },
  isGamePaused: {
    type: Boolean,
    default: false
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  isDev: {
    type: Boolean,
    default: false
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  showDebugControls: {
    type: Boolean,
    default: true
  }
})

// Events emitted to parent component
const emit = defineEmits([
  'back-to-level-selection',
  'pause-game',
  'resume-game',
  'debug-complete-level'
])

// Computed properties
const canPause = computed(() => {
  return props.isGameActive && !props.isGamePaused
})

const canResume = computed(() => {
  return props.isGamePaused
})

const showPauseResume = computed(() => {
  return props.isGameActive || props.isGamePaused
})

const showDebugComplete = computed(() => {
  return props.isDev && props.showDebugControls && props.isGameActive
})

const backButtonText = computed(() => {
  if (props.isGameActive || props.isGamePaused) {
    return '🔙 Exit Game'
  }
  return '🔙 Back to Levels'
})

const backButtonAriaLabel = computed(() => {
  if (props.isGameActive || props.isGamePaused) {
    return 'Exit current game and return to level selection'
  }
  return 'Return to level selection'
})

// Event handlers
const handleBackClick = () => {
  console.log('🔙 Back to level selection requested from GameControls')
  emit('back-to-level-selection')
}

const handlePauseClick = () => {
  console.log('⏸️ Pause game requested from GameControls')
  emit('pause-game')
}

const handleResumeClick = () => {
  console.log('▶️ Resume game requested from GameControls')
  emit('resume-game')
}

const handleDebugCompleteClick = () => {
  console.log('🏁 Debug complete level requested from GameControls')
  emit('debug-complete-level')
}
</script>

<template>
  <div class="game-controls">
    <!-- Primary Controls -->
    <div class="game-controls__primary">
      <!-- Back Button -->
      <button
        v-if="showBackButton"
        @click="handleBackClick"
        class="btn btn--ghost game-controls__back-btn"
        :aria-label="backButtonAriaLabel"
      >
        {{ backButtonText }}
      </button>

      <!-- Pause/Resume Controls -->
      <div v-if="showPauseResume" class="game-controls__pause-resume">
        <!-- Pause Button -->
        <button
          v-if="canPause"
          @click="handlePauseClick"
          class="btn game-controls__pause-btn"
          aria-label="Pause current game"
        >
          ⏸️ Pause Game
        </button>

        <!-- Resume Button -->
        <button
          v-else-if="canResume"
          @click="handleResumeClick"
          class="btn game-controls__resume-btn"
          aria-label="Resume paused game"
        >
          ▶️ Resume Game
        </button>
      </div>
    </div>

    <!-- Debug Controls (DEV only) -->
    <div
      v-if="isDev && showDebugControls"
      class="game-controls__debug"
    >
      <span class="game-controls__debug-label">DEBUG:</span>

      <!-- Debug Complete Level -->
      <button
        v-if="showDebugComplete"
        @click="handleDebugCompleteClick"
        class="btn btn--small game-controls__debug-btn"
        aria-label="Debug: Complete current level instantly"
      >
        🏁 Complete Level
      </button>

      <!-- Debug Info Display -->
      <span class="game-controls__debug-info">
        Level {{ currentLevel }} |
        {{ isGameActive ? (isGamePaused ? 'Paused' : 'Active') : 'Inactive' }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Game Controls Block
.game-controls {
  background-color: var(--card-bg);
  padding: var(--space-4);
  border-top: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @media (min-width: vars.$breakpoint-md) {
    padding: var(--space-6) var(--space-8);
    gap: var(--space-4);
  }

  // Primary Controls Element
  &__primary {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    align-items: center;
    width: 100%;

    @media (min-width: vars.$breakpoint-md) {
      flex-direction: row;
      justify-content: space-between;
      gap: var(--space-4);
    }
  }

  &__back-btn {
    min-width: 160px;
    order: 2;

    @media (min-width: vars.$breakpoint-md) {
      order: 1;
      min-width: 180px;
    }
  }

  &__pause-resume {
    display: flex;
    justify-content: center;
    order: 1;

    @media (min-width: vars.$breakpoint-md) {
      order: 2;
    }
  }

  &__pause-btn,
  &__resume-btn {
    min-width: 140px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow-hover);
    }

    @media (min-width: vars.$breakpoint-md) {
      min-width: 160px;
    }
  }

  &__pause-btn {
    background-color: var(--warning-color);
    border-color: var(--warning-color);

    &:hover {
      background-color: #f39c12;
    }
  }

  &__resume-btn {
    background-color: var(--success-color);
    border-color: var(--success-color);

    &:hover {
      background-color: var(--accent-hover);
    }
  }

  // Debug Controls Element (DEV only)
  &__debug {
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--border-radius-md);
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-xs);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid rgba(255, 255, 255, 0.2);

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-sm);
      padding: var(--space-3) var(--space-4);
      gap: var(--space-3);
    }
  }

  &__debug-label {
    color: #00b894;
    font-weight: bold;
    font-size: var(--font-size-xs);

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-sm);
    }
  }

  &__debug-btn {
    background-color: #e17055;
    border-color: #e17055;
    color: white;
    font-size: 10px;
    padding: var(--space-1) var(--space-2);

    &:hover {
      background-color: #d63031;
      transform: scale(1.05);
    }

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-xs);
      padding: var(--space-2) var(--space-3);
    }
  }

  &__debug-info {
    color: rgba(255, 255, 255, 0.7);
    font-size: 10px;
    margin-left: auto;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-xs);
    }
  }
}

// State-specific styling
.game-controls {
  // When game is active
  &[data-game-active="true"] {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 1px var(--accent-color);
  }

  // When game is paused
  &[data-game-paused="true"] {
    background-color: var(--warning-light);
    border-color: var(--warning-color);
  }
}

// Responsive improvements for very small screens
@media (max-width: 360px) {
  .game-controls {
    padding: var(--space-3);

    &__primary {
      gap: var(--space-2);
    }

    &__back-btn,
    &__pause-btn,
    &__resume-btn {
      width: 100%;
      min-width: auto;
    }

    &__debug {
      flex-direction: column;
      align-items: stretch;
      text-align: center;

      &-info {
        margin-left: 0;
        margin-top: var(--space-1);
      }
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .game-controls__pause-btn:hover,
  .game-controls__resume-btn:hover,
  .game-controls__debug-btn:hover {
    transform: none;
  }
}

// Focus improvements
.game-controls {
  button:focus-visible {
    outline-offset: 2px;
    z-index: 1;
  }
}

// Loading/disabled states
.game-controls__pause-btn:disabled,
.game-controls__resume-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
</style>