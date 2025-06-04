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

// Fruit emojis for level icons
const fruitEmojis = ['🍎', '🍊', '🍇', '🍓', '🥝', '🍉', '🥭', '🍌', '🏆']

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
// Helper für Level-Status-Anzeige
const getLevelStatusClass = (level) => {
  if (!level.unlocked) return 'locked'
  if (level.isPerfect) return 'perfect'
  if (level.completed) return 'completed'
  if (level.isInProgress) return 'in-progress'
  return 'available'
}

const getLevelStatusText = (level) => {
  if (!level.unlocked) return 'Locked'
  if (level.isPerfect) return 'Perfect!'
  if (level.completed) return `${level.stars} Star${level.stars > 1 ? 's' : ''}`
  if (level.isInProgress) return `${level.progress}% Complete`
  return 'Not Started'
}

// Get card background color
const getLevelCardBg = (level) => {
  if (!level.unlocked) return 'var(--level-locked)'
  if (level.isPerfect) return 'linear-gradient(45deg, #ffd700, #ffed4e)'
  if (level.completed) return 'var(--level-completed)'
  if (level.id === 1) return 'var(--level-featured)'
  return 'var(--level-unlocked)'
}

// Convert level data to game card format for consistent display
const getLevelAsGameCard = (level) => {
  return {
    id: level.id,
    name: level.name,
    text: level.description,
    icon: fruitEmojis[level.id - 1],
    iconType: 'emoji',
    iconBg: level.unlocked
      ? (level.id === 1 ? '#e84393' : '#00b894')
      : 'var(--grey-color)',
    unlocked: level.unlocked,
    completed: level.completed,
    stars: level.stars
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
          class="level-selection__level-card"
          :class="{
            'level-selection__level-card--unlocked': level.unlocked,
            'level-selection__level-card--locked': !level.unlocked,
            'level-selection__level-card--completed': level.completed,
            'level-selection__level-card--perfect': level.isPerfect,
            'level-selection__level-card--in-progress': level.isInProgress,
            'level-selection__level-card--featured': level.id === 1
          }"
          :style="{ background: getLevelCardBg(level) }"
          role="button"
          tabindex="0"
          @click="selectLevel(level)"
          @keydown.enter="selectLevel(level)"
          :disabled="!level.unlocked"
          :aria-label="`Level ${level.id}: ${level.name}${level.unlocked ? '' : ' (locked)'}`"
        >
          <!-- Level Icon -->
          <div class="level-selection__level-icon">
            <div class="level-selection__level-icon-container">
              <!-- Lock icon for locked levels -->
              <svg
                v-if="!level.unlocked"
                class="level-selection__level-lock"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>

              <!-- Fruit emoji for unlocked levels -->
              <span
                v-else
                class="level-selection__level-emoji"
              >
                {{ fruitEmojis[level.id - 1] }}
              </span>
            </div>
          </div>

          <!-- Level Content -->
          <div class="level-selection__level-content">
            <h3 class="level-selection__level-name">{{ level.name }}</h3>

            <!-- Level Goal Display -->
            <p v-if="level.unlocked && level.goal" class="level-selection__level-goal">
              Target: {{ level.goal.targetScore }} points
            </p>

            <!-- Progress Bar for in-progress levels -->
            <div
              v-if="level.isInProgress"
              class="level-selection__progress"
            >
              <div class="level-selection__progress-bar">
                <div
                  class="level-selection__progress-fill"
                  :style="{ width: `${level.progress}%` }"
                ></div>
              </div>
              <span class="level-selection__progress-text">{{ level.progress }}%</span>
            </div>

            <!-- Best Score Display -->
            <p
              v-if="level.unlocked && level.bestScore > 0"
              class="level-selection__best-score"
            >
              Best: {{ level.bestScore }} pts
            </p>
          </div>

          <!-- Level Action/Status -->
          <div class="level-selection__level-action">
            <!-- Stars for completed levels -->
            <div
              v-if="level.completed"
              class="level-selection__level-stars"
            >
              <span
                v-for="star in 3"
                :key="star"
                class="level-selection__level-star"
                :class="{
                  'level-selection__level-star--filled': star <= level.stars,
                  'level-selection__level-star--perfect': level.isPerfect && star <= level.stars
                }"
              >
                ⭐
              </span>
            </div>

            <!-- Play button for level 1 -->
            <div
              v-else-if="level.id === 1 && level.unlocked"
              class="level-selection__play-badge"
            >
              PLAY
            </div>

            <!-- Status badge for other levels -->
            <div
              v-else-if="level.unlocked"
              class="level-selection__status-badge"
              :class="`level-selection__status-badge--${getLevelStatusClass(level)}`"
            >
              {{ getLevelStatusText(level) }}
            </div>

            <!-- Arrow for unlocked levels -->
            <svg
              v-if="level.unlocked"
              class="level-selection__level-arrow"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m9 18 6-6-6-6"/>
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
    grid-template-columns: 1fr;
    gap: var(--space-3);

    @media (min-width: vars.$breakpoint-sm) {
      gap: var(--space-4);
    }
  }

  // Level Card Element
  &__level-card {
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--card-border);
    padding: var(--space-4);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    min-height: 72px;
    position: relative;

    &:hover {
      background-color: var(--card-bg-hover);
      box-shadow: var(--card-shadow-hover);
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: 0.125rem;
      box-shadow: var(--focus-shadow);
    }

    &:active {
      transform: translateY(0.0625rem);
    }

    // Level Card Modifiers
    &--unlocked {
      &:hover {
        transform: translateY(-2px);
      }
    }

    &--locked {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--level-locked);

      &:hover {
        transform: none;
        background-color: var(--level-locked);
        box-shadow: var(--card-shadow);
      }
    }

    &--completed {
      background: var(--level-completed);
      color: var(--white);

      .level-selection__level-name,
      .level-selection__level-description {
        color: var(--white);
      }

      &:hover {
        box-shadow: var(--level-completed-hover);
      }
    }

    &--featured {
      background: var(--level-featured);
      color: var(--white);

      .level-selection__level-name,
      .level-selection__level-description {
        color: var(--white);
      }

      &:hover {
        box-shadow: var(--level-featured-hover);
      }
    }
  }

  // Level Icon Element
  &__level-icon {
    margin-right: var(--space-4);
    flex-shrink: 0;
  }

  &__level-icon-container {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  &__level-lock {
    opacity: 0.6;
    color: var(--text-muted);
  }

  &__level-emoji {
    font-size: 24px;
    line-height: 1;
    user-select: none;
  }

  // Level Content Element
  &__level-content {
    flex: 1;
    min-width: 0;
  }

  &__level-name {
    margin: 0 0 var(--space-1) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.2;
  }

  &__level-description {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.2;
  }

  // Level Action Element
  &__level-action {
    margin-left: var(--space-2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__level-stars {
    display: flex;
    gap: 2px;
  }

  &__level-star {
    font-size: 12px;
    opacity: 0.3;

    &--filled {
      opacity: 1;
    }
  }

  &__play-badge {
    background: var(--accent-color);
    color: var(--white);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-xs);
    font-weight: bold;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 184, 148, 0.4);
  }

  &__level-arrow {
    color: var(--text-secondary);
    transition: transform 0.2s ease;

    .level-selection__level-card:hover & {
      transform: translateX(2px);
    }
  }

  // Enhanced Level Card Styles
  &__level-card {
    // Bestehende Styles...

    &--perfect {
      animation: perfect-glow 2s ease-in-out infinite;

      .level-selection__level-name {
        color: #1a1a1a;
        font-weight: bold;
      }
    }

    &--in-progress {
      border: 2px solid var(--info-color);

      &:hover {
        box-shadow: 0 4px 16px rgba(9, 132, 227, 0.4);
      }
    }
  }

  // Level Goal Display
  &__level-goal {
    margin: var(--space-1) 0;
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  // Progress Bar Styles
  &__progress {
    margin: var(--space-1) 0;
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: var(--info-color);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &__progress-text {
    font-size: var(--font-size-xs);
    color: var(--white);
    font-weight: 600;
    min-width: 30px;
  }

  // Best Score Display
  &__best-score {
    margin: var(--space-1) 0 0 0;
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  // Enhanced Stars
  &__level-star {
    font-size: 12px;
    opacity: 0.3;

    &--filled {
      opacity: 1;
    }

    &--perfect {
      animation: star-twinkle 1.5s ease-in-out infinite;
    }
  }

  // Status Badge
  &__status-badge {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--white);
    background: var(--info-color);

    &--available {
      background: var(--success-color);
    }

    &--in-progress {
      background: var(--info-color);
    }

    &--completed {
      background: var(--warning-color);
      color: var(--text-color);
    }

    &--perfect {
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: var(--text-color);
    }
  }

  // Play Badge Enhancement
  &__play-badge {
    background: var(--accent-color);
    color: var(--white);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-xs);
    font-weight: bold;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 184, 148, 0.4);
    animation: pulse-play 2s ease-in-out infinite;
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

@keyframes star-twinkle {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes pulse-play {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// Dark theme adjustments
[data-theme="dark"] {
  .level-selection__level-goal,
  .level-selection__best-score {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>