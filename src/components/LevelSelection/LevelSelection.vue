<script setup>
import { computed } from 'vue'
import { useLevelGoals } from '../../composables/useLevelGoals.js'

// Props for level data and configuration
const props = defineProps({
  levels: {
    type: Array,
    required: true,
    validator: (levels) => {
      return Array.isArray(levels) && levels.every(level =>
        level.id && level.name && typeof level.unlocked === 'boolean'
      )
    }
  },
  isDev: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['level-selected'])

// Level Goals Integration
const { getLevelGoal, getLevelProgress } = useLevelGoals()

const enhancedLevels = computed(() => {
  return props.levels.map(level => {
    const goal = getLevelGoal(level.id)
    const bestScore = level.bestScore || 0
    const progress = goal ? getLevelProgress(level.id, bestScore) : 0

    return {
      ...level,
      goal,
      progress,
      bestScore,
      targetScore: goal?.targetScore || 0,
      isInProgress: level.unlocked && !level.completed && bestScore > 0,
      isPerfect: level.stars === 3
    }
  })
})

// Level selection handler
const selectLevel = (level) => {
  if (level.unlocked) {
    console.log(`🎮 Level ${level.id} selected - Target: ${level.targetScore} points`)
    emit('level-selected', level)
  } else {
    console.warn(`Level ${level.id} is locked`)
  }
}
</script>

<template>
  <div class="level-selection">
    <!-- Level Selection Header -->
    <div class="level-selection__header">
      <h2 class="level-selection__title">Select a Level</h2>
    </div>

    <!-- Levels Container -->
    <div class="level-selection__levels-container">
      <div class="level-selection__levels-grid">
        <!-- Enhanced Level Cards -->
        <div
          v-for="level in enhancedLevels"
          :key="level.id"
          class="level-selection__level-tile"
          :class="{
            'level-selection__level-tile--unlocked': level.unlocked,
            'level-selection__level-tile--locked': !level.unlocked,
            'level-selection__level-tile--completed': level.completed,
            'level-selection__level-tile--perfect': level.isPerfect,
            'level-selection__level-tile--featured': level.id === 1
          }"
          role="button"
          tabindex="0"
          @click="selectLevel(level)"
          @keydown.enter="selectLevel(level)"
          :disabled="!level.unlocked"
          :aria-label="`Level ${level.id}: Target ${level.targetScore} points${level.unlocked ? '' : ' (locked)'}`"
        >
          <!-- Level Number -->
          <div class="level-selection__level-number">
            <span v-if="level.unlocked">{{ level.id }}</span>
            <svg
              v-else
              class="level-selection__level-lock"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <!-- Level Goal -->
          <div class="level-selection__level-target">
            <span v-if="level.unlocked && level.goal">{{ level.goal.targetScore }} pts</span>
            <span v-else-if="!level.unlocked">Locked</span>
          </div>

          <!-- Stars Display -->
          <div class="level-selection__level-stars">
            <svg
              v-for="star in 3"
              :key="star"
              class="level-selection__star-svg"
              :class="{ 'level-selection__star-svg--filled': star <= level.stars }"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                :fill="star <= level.stars ? '#FFD700' : 'transparent'"
                :stroke="star <= level.stars ? '#FFA500' : '#666'"
                stroke-width="1"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as vars;

// Level Selection Block
.level-selection {
  display: flex;
  flex-direction: column;
  min-height: 60vh;

  // Header Element
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  &__title {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-size-2xl);
    font-weight: bold;
    color: var(--text-color);

    // Larger title and spacing on desktop
    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-3xl);
      margin-bottom: var(--space-6);
    }
  }

  // Levels Container Element
  &__levels-container {
    background: var(--card-bg);
    border-radius: var(--border-radius-2xl);
    padding: var(--space-6);
    box-shadow: var(--card-shadow);
    max-width: 100%;
    width: 100%;

    @media (min-width: vars.$breakpoint-md) {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-8);
    }
  }

  &__levels-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);

    @media (max-width: vars.$breakpoint-sm) {
      gap: var(--space-2);
    }
  }

  // Level Tile Element - Neue kompakte Kacheln
  &__level-tile {
    aspect-ratio: 1;
    background: var(--card-bg);
    border: 2px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-3);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 100px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow-hover);
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: 2px;
    }

    &--unlocked {
      background: var(--level-unlocked);
      color: var(--white);
      border-color: transparent;

      &:hover {
        box-shadow: var(--level-unlocked-hover);
      }
    }

    &--locked {
      background: var(--level-locked);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    &--completed {
      background: var(--level-completed);
      color: var(--white);
      border-color: transparent;

      &:hover {
        box-shadow: var(--level-completed-hover);
      }
    }

    &--perfect {
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: #1a1a1a;
      border-color: transparent;
      animation: perfect-glow 2s ease-in-out infinite;
    }

    &--featured {
      background: var(--level-featured);
      color: var(--white);
      border-color: transparent;

      &:hover {
        box-shadow: var(--level-featured-hover);
      }
    }
  }

  &__level-number {
    font-size: var(--font-size-2xl);
    font-weight: bold;
    margin-bottom: var(--space-1);
  }

  &__level-target {
    font-size: var(--font-size-xs);
    text-align: center;
    margin-bottom: var(--space-2);
    opacity: 0.9;
  }

  &__level-stars {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  &__star-svg {
    transition: all 0.2s ease;

    &--filled {
      filter: drop-shadow(0 1px 3px rgba(255, 215, 0, 0.5));
    }
  }

  &__level-lock {
    opacity: 0.6;
  }
}

// Animations
@keyframes perfect-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  }
}

// Dark theme adjustments
[data-theme="dark"] {
  .level-selection__level-target {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>