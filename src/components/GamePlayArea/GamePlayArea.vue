<script setup>
import { computed } from 'vue'

// Props for game state and session data
const props = defineProps({
  currentLevel: {
    type: Number,
    required: true
  },
  currentSession: {
    type: Object,
    required: true,
    validator: (session) => {
      return session && typeof session.score === 'number' && typeof session.moves === 'number'
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
  formattedGameTime: {
    type: String,
    default: '00:00'
  },
  isDev: {
    type: Boolean,
    default: false
  }
})

// Events emitted to parent component
const emit = defineEmits([
  'pause-game',
  'resume-game',
  'back-to-level-selection',
  'debug-complete-level'
])

// Format numbers for display
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${Math.floor(num / 100) / 10}k`
  }
  return num.toString()
}

// Event handlers
const handlePauseGame = () => {
  console.log('🎮 Pause game requested from GamePlayArea')
  emit('pause-game')
}

const handleResumeGame = () => {
  console.log('🎮 Resume game requested from GamePlayArea')
  emit('resume-game')
}

const handleBackToLevelSelection = () => {
  console.log('🔙 Back to level selection requested from GamePlayArea')
  emit('back-to-level-selection')
}

const handleDebugCompleteLevel = () => {
  console.log('🏁 Debug complete level requested from GamePlayArea')
  emit('debug-complete-level')
}

// Computed game status text
const gameStatusTitle = computed(() => {
  if (props.isGamePaused) {
    return '⏸️ Game Paused'
  }
  return `🎮 Playing Level ${props.currentLevel}`
})

const gameStatusSubtitle = computed(() => {
  if (props.isGamePaused) {
    return 'Game is paused'
  }
  return 'Game is active'
})

// Show game info when game is active or paused
const showGameInfo = computed(() => {
  return props.isGameActive || props.isGamePaused
})
</script>

<template>
  <div class="game-play-area">
    <div class="game-play-area__game-container">
      <!-- Game Status Display -->
      <div class="game-play-area__game-status">
        <h3 class="game-play-area__status-title">
          {{ gameStatusTitle }}
        </h3>
        <div v-if="showGameInfo" class="game-play-area__game-info">
          <p>Score: {{ formatNumber(currentSession.score) }}</p>
          <p>Moves: {{ currentSession.moves }}</p>
          <p>Time: {{ formattedGameTime }}</p>
        </div>
      </div>

      <!-- Actual Game Area Placeholder -->
      <div class="game-play-area__game-placeholder">
        <p class="game-play-area__placeholder-text">
          Game Level {{ currentLevel }} implementation will go here
        </p>
        <p class="game-play-area__placeholder-subtitle">
          {{ gameStatusSubtitle }}
        </p>

        <!-- Game Controls -->
        <div class="game-play-area__game-controls">
          <!-- Pause/Resume Controls -->
          <button
            v-if="!isGamePaused"
            @click="handlePauseGame"
            class="btn"
            :disabled="!isGameActive"
          >
            ⏸️ Pause Game
          </button>
          <button
            v-else
            @click="handleResumeGame"
            class="btn"
          >
            ▶️ Resume Game
          </button>

          <!-- Navigation Control -->
          <button
            @click="handleBackToLevelSelection"
            class="btn btn--ghost"
          >
            🔙 Back to Level Selection
          </button>

          <!-- Debug complete button (DEV only) -->
          <button
            v-if="isDev"
            @click="handleDebugCompleteLevel"
            class="btn btn--small"
            style="margin-top: 1rem;"
          >
            🏁 Complete Level (DEBUG)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as vars;

// Game Play Area Block
.game-play-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;
  padding: var(--space-4);

  // Game Container Element
  &__game-container {
    width: 100%;
    max-width: 500px;
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--card-shadow);
    overflow: hidden;

    @media (min-width: vars.$breakpoint-md) {
      max-width: 600px;
    }
  }

  // Game Status Element
  &__game-status {
    background-color: var(--bg-secondary);
    padding: var(--space-4);
    border-bottom: 1px solid var(--card-border);
    text-align: center;
  }

  &__status-title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-lg);
    font-weight: bold;
    color: var(--text-color);
  }

  &__game-info {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);

    p {
      margin: 0;
    }

    @media (max-width: vars.$breakpoint-sm) {
      flex-direction: column;
      gap: var(--space-1);
    }
  }

  // Game Placeholder Element (will be replaced with actual game)
  &__game-placeholder {
    padding: var(--space-6);
    text-align: center;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__placeholder-text {
    margin-bottom: var(--space-2);
    font-size: var(--font-size-lg);
    color: var(--text-color);
    font-weight: 600;
  }

  &__placeholder-subtitle {
    margin-bottom: var(--space-4);
    font-size: var(--font-size-base);
    color: var(--text-secondary);
  }

  // Game Controls Element
  &__game-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    align-items: center;
    width: 100%;
    max-width: 200px;

    @media (min-width: vars.$breakpoint-md) {
      flex-direction: row;
      max-width: none;
      gap: var(--space-4);
    }
  }
}

// Responsive adjustments
@media (min-width: vars.$breakpoint-md) {
  .game-play-area {
    padding: var(--space-8);
  }
}

// Game state specific styling
.game-play-area__game-container {
  // Paused state styling
  &[data-game-paused="true"] {
    opacity: 0.8;

    .game-play-area__game-placeholder {
      filter: grayscale(0.3);
    }
  }
}
</style>