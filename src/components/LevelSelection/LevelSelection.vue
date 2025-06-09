<script setup>
import { computed } from 'vue'
import { useLevelGoals } from '../../composables/useLevelGoals.js'
import GameIcon from "../GameIcon/GameIcon.vue";
import { FRUIT_TYPES } from "../../config/fruitMergeGameConfig.js";

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

    // NEU: Ziel-Frucht Informationen
    const targetFruit = goal ? FRUIT_TYPES[goal.targetFruit] : null
    const requiredCount = goal?.starThresholds?.[1]?.targetCount || 1

    return {
      ...level,
      goal,
      progress,
      bestScore,
      targetScore: goal?.targetScore || 0,
      targetFruit,           // NEU
      requiredCount,         // NEU
      isInProgress: level.unlocked && !level.completed && bestScore > 0,
      isPerfect: level.stars === 3,
      hasHighScore: bestScore > 0,
      formattedScore: formatScore(bestScore)
    }
  })
})

const formatScore = (score) => {
  return score.toString()
}

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
            'level-selection__level-tile--perfect': level.isPerfect
          }"
          role="button"
          tabindex="0"
          @click="selectLevel(level)"
          @keydown.enter="selectLevel(level)"
          :disabled="!level.unlocked"
          :aria-label="`Level ${level.id}: Target ${level.targetScore} points${level.unlocked ? '' : ' (locked)'}`"
        >
          <!-- Stars Display -->
          <div class="level-selection__level-stars">
            <template
              v-for="star in 3"
            >
              <GameIcon
                v-if="star <= level.stars"
                key="star"
                name="star"
                :size="20"
                class="level-selection__star-svg level-selection__star-svg--filled"
              />
              <GameIcon
                v-else
                key="star-empty"
                name="star-empty"
                :size="20"
                class="level-selection__star-svg"
              />
            </template>
          </div>

          <!-- Level Number -->
          <div class="level-selection__level-number">
            <span v-if="level.unlocked">{{ level.id }}</span>
            <GameIcon name="lock" v-else :size="24" class="level-selection__level-lock" />
          </div>

          <!-- High Score Display -->
          <div class="level-selection__level-score" v-if="level.hasHighScore">
            <span class="level-selection__score-label">Best</span>
            <span class="level-selection__score-value">{{ level.formattedScore }}</span>
          </div>

          <div class="level-selection__level-goal">
            <span class="level-selection__goal-label" v-if="level.unlocked && level.targetFruit">Goal</span>
            <div class="level-selection__goal-content" v-if="level.unlocked && level.targetFruit">
              <span class="level-selection__goal-fruit">{{ level.targetFruit.emoji.split(' ')[0] }}</span>
              <span v-if="level.requiredCount > 1" class="level-selection__goal-count">×{{ level.requiredCount }}</span>
            </div>
            <span v-else-if="!level.unlocked" class="level-selection__goal-locked">Locked</span>
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
    padding: var(--space-2); // Reduced padding for more content
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 100px;
    position: relative; // For potential badges

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
      color: var(--black);
      border-color: transparent;

      &:hover {
        box-shadow: var(--level-unlocked-hover);
      }
    }

    &--locked {
      background: var(--level-locked);
      color: var(--white);
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    &--completed {
      background: var(--level-completed);
      color: var(--black);
      border-color: transparent;

      &:hover {
        box-shadow: var(--level-completed-hover);
      }
    }

    &--perfect {
      background: var(--level-perfect);
      color: var(--black);
      border-color: transparent;
      animation: perfect-glow 2s ease-in-out infinite;
    }
  }

  &__level-number {
    font-size: var(--font-size-2xl);
    font-weight: bold;
    display: flex;
  }

  &__level-target {
    font-size: var(--font-size-xs);
    text-align: center;
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

  &__level-score {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
  }

  &__score-label {
    font-size: var(--font-size-xs);
  }

  &__score-value {
    font-size: var(--font-size-xs);
  }

  &__level-goal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__goal-label {
    font-size: var(--font-size-xs);
  }

  &__goal-content {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &__goal-fruit {
    font-size: var(--font-size-sm);
  }

  &__goal-count {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  &__goal-locked {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
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

</style>