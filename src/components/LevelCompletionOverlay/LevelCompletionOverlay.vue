<script setup>
import { computed } from 'vue'
import { useLevelCompletionUI } from '../../composables/useLevelCompletionUI.js'
import LevelRewardDisplay from '../LevelRewardDisplay/LevelRewardDisplay.vue'

const props = defineProps({
  levelCompletionState: {
    type: Object,
    required: true
  },
  currentSession: {
    type: Object,
    required: true
  },
  currentLevel: {
    type: Number,
    required: true
  },
  maxLevel: {
    type: Number,
    default: 9
  }
})

const emit = defineEmits(['start-next-level', 'back-to-levels'])

// Bestehende UI Logic
const {
  shouldShowCompletion,
  completionStars,
  completionTitle,
  getStarAnimationDelay
} = useLevelCompletionUI(props.levelCompletionState)

const { rewardData, achievements, completionData } = props.levelCompletionState

// Next Level Logic
const hasNextLevel = computed(() => {
  return props.currentLevel < props.maxLevel
})

const nextLevelNumber = computed(() => {
  return props.currentLevel + 1
})

// Button Actions
const handleNextLevel = () => {
  emit('start-next-level', nextLevelNumber.value)
}

const handleBackToLevels = () => {
  emit('back-to-levels')
}
</script>

<template>
  <Transition name="completion-overlay">
    <div
      v-if="shouldShowCompletion"
      class="level-completion-overlay"
    >
      <div class="completion">
        <div class="completion__content">
          <h3 class="completion__title">{{ completionTitle }}</h3>

          <!-- Stars Display -->
          <div class="completion__stars">
            <span
              v-for="star in completionStars"
              :key="star.index"
              class="completion__star"
              :class="{ 'completion__star--filled': star.filled }"
              :style="{ animationDelay: getStarAnimationDelay(star.index) }"
            >
              ⭐
            </span>
          </div>

          <!-- Statistics -->
          <div class="completion__stats">
            <div class="completion__stat">
              <span class="completion__stat-label">Final Score</span>
              <span class="completion__stat-value">{{ currentSession?.score || 0 }}</span>
            </div>

            <div class="completion__stat">
              <span class="completion__stat-label">Moves Used</span>
              <span class="completion__stat-value">{{ currentSession?.moves || 0 }}</span>
            </div>
          </div>

          <!-- Rewards Display -->
          <LevelRewardDisplay
            :reward-data="rewardData"
            :achievements="achievements"
            :visible="true"
          />

          <!-- Action Buttons -->
          <div class="completion__actions">
            <button
              v-if="hasNextLevel"
              class="btn"
              @click="handleNextLevel"
            >
              Start Level {{ nextLevelNumber }}
            </button>

            <button
              class="btn btn--small btn--ghost"
              @click="handleBackToLevels"
            >
              {{ hasNextLevel ? 'Level Selection' : 'Back to Levels' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.level-completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.completion {
  &__content {
    background: var(--card-bg);
    border-radius: var(--border-radius-lg);
    padding: var(--space-6);
    text-align: center;
    box-shadow: var(--card-shadow);
    min-width: 320px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  &__title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--success-color);
  }

  // Action Buttons
  &__actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: var(--space-3);

    .btn {
      width: 100%;
    }
  }

  &__stars {
    display: flex;
    justify-content: center;
    gap: var(--space-1);
  }

  &__star {
    font-size: var(--font-size-2xl);
    opacity: 0.3;
    transition: opacity 0.3s ease;

    &--filled {
      opacity: 1;
      animation: star-sparkle 0.6s ease-out;
    }
  }

  &__stats {
    display: flex;
    justify-content: space-between;
    gap: var(--space-1);
    margin-top: var(--space-2);
  }

  &__stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);

    &:last-child {
      border-bottom: none;
    }
  }

  &__stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  &__stat-value {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    line-height: var(--font-line-height-small);
    color: var(--text-color);
  }
}

// Transitions
.completion-overlay-enter-active,
.completion-overlay-leave-active {
  transition: opacity 0.5s ease;

  .completion__content {
    transition: transform 0.5s ease;
  }
}

.completion-overlay-enter-from,
.completion-overlay-leave-to {
  opacity: 0;

  .completion__content {
    transform: scale(0.8) translateY(20px);
  }
}

// Animations
@keyframes star-sparkle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes next-level-pulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0, 184, 148, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(0, 184, 148, 0.5);
  }
}

// Mobile optimizations
@media (max-width: 480px) {
  .completion {
    &__content {
      padding: var(--space-4);
      max-width: 95%;
    }

    &__actions {
      gap: var(--space-2);
    }

    &__action-btn {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
      min-height: 44px;
    }
  }
}
</style>