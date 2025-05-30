<script setup>
import { computed } from 'vue'

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

// Events emitted to parent component
const emit = defineEmits([
  'level-selected',
])

// Fruit emojis for level icons
const fruitEmojis = ['🍎', '🍊', '🍇', '🍓', '🥝', '🍉', '🥭', '🍌', '🏆']

// Level selection handler
const selectLevel = (level) => {
  if (level.unlocked) {
    console.log(`🎮 Level ${level.id} selected from LevelSelection component`)
    emit('level-selected', level)
  } else {
    console.warn(`Level ${level.id} is locked`)
  }
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
        <!-- Level Cards using real store data -->
        <div
          v-for="level in levels"
          :key="level.id"
          class="level-selection__level-card"
          :class="{
            'level-selection__level-card--unlocked': level.unlocked,
            'level-selection__level-card--locked': !level.unlocked,
            'level-selection__level-card--completed': level.completed,
            'level-selection__level-card--featured': level.id === 1
          }"
          role="button"
          tabindex="0"
          @click="selectLevel(level)"
          @keydown.enter="selectLevel(level)"
          :disabled="!level.unlocked"
          :aria-label="`Level ${level.id}: ${level.name}${level.unlocked ? '' : ' (locked)'}`"
        >
          <!-- Level Icon -->
          <div class="level-selection__level-icon">
            <div
              class="level-selection__level-icon-container"
              :style="{ backgroundColor: getLevelAsGameCard(level).iconBg }"
            >
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
            <p
              v-if="level.unlocked"
              class="level-selection__level-description"
            >
              {{ level.description }}
            </p>
          </div>

          <!-- Level Action -->
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
                :class="{ 'level-selection__level-star--filled': star <= level.stars }"
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

            <!-- Arrow for other unlocked levels -->
            <svg
              v-else-if="level.unlocked"
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
}
</style>