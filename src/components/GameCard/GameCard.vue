<script setup>
// Define props for game data
const props = defineProps({
  game: {
    type: Object,
    required: true,
    validator: (game) => {
      return game.name && game.icon
    }
  },
  // Additional customization props
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'default', // default, compact, featured
    validator: (value) => ['default', 'compact', 'featured'].includes(value)
  }
})

// Define emits
const emit = defineEmits(['game-selected'])

// Handle game selection
const handleGameClick = () => {
  emit('game-selected', props.game)
}

// Handle keyboard interaction
const handleKeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleGameClick()
  }
}

// Get card CSS classes based on props
const getCardClasses = () => {
  return {
    'game-card': true,
    'card': true,
    'card--interactive': true,
    'card--elevated': true,
    [`game-card--${props.size}`]: props.size !== 'medium',
    [`game-card--${props.variant}`]: props.variant !== 'default'
  }
}

// Get icon container classes
const getIconClasses = () => {
  return {
    'game-card__icon': true,
    [`game-card__icon--${props.size}`]: props.size !== 'medium'
  }
}
</script>

<template>
  <div
      :class="getCardClasses()"
      role="button"
      tabindex="0"
      @click="handleGameClick"
      @keydown="handleKeydown"
      :aria-label="`Play ${game.name}`"
  >
    <div :class="getIconClasses()">
      <div
          class="game-card__icon-container"
          :style="{ backgroundColor: game.iconBg }"
      >
        <span
            v-if="game.iconType === 'emoji'"
            class="game-card__icon-emoji"
        >
          {{ game.icon }}
        </span>
        <img
            v-else-if="game.iconType === 'image'"
            :src="game.icon"
            :alt="game.name"
            class="game-card__icon-image"
        />
      </div>
    </div>

    <div class="game-card__content">
      <h3 class="game-card__title">{{ game.name }}</h3>
      <p
          v-if="game.text && variant !== 'compact'"
          class="game-card__description"
      >
        {{ game.text }}
      </p>
    </div>

    <div class="game-card__action">
      <svg
          class="game-card__arrow"
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
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Game Card Block
.game-card {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  min-height: 72px;

  // Size Modifiers
  &--small {
    padding: var(--space-3);
    min-height: 60px;
  }

  &--large {
    padding: var(--space-6);
    min-height: 88px;
  }

  // Variant Modifiers
  &--compact {
    padding: var(--space-3);
    min-height: 56px;
  }

  &--featured {
    background: var(--level-featured);
    color: var(--white);

    .game-card__title,
    .game-card__description {
      color: var(--white);
    }

    .game-card__arrow {
      color: var(--white);
    }
  }

  // Icon Element
  &__icon {
    margin-right: var(--space-4);
    flex-shrink: 0;

    &--small {
      margin-right: var(--space-3);
    }

    &--large {
      margin-right: var(--space-6);
    }
  }

  &__icon-container {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;

    .game-card--small & {
      width: 40px;
      height: 40px;
    }

    .game-card--large & {
      width: 56px;
      height: 56px;
    }
  }

  &__icon-emoji {
    font-size: 24px;
    line-height: 1;
    user-select: none;

    .game-card--small & {
      font-size: 20px;
    }

    .game-card--large & {
      font-size: 28px;
    }
  }

  &__icon-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--border-radius-lg);
  }

  // Content Element
  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0 0 var(--space-1) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.2;

    .game-card--small & {
      font-size: var(--font-size-base);
      margin-bottom: 0;
    }

    .game-card--large & {
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-2);
    }

    .game-card--compact & {
      margin-bottom: 0;
    }
  }

  &__description {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.2;

    .game-card--large & {
      font-size: var(--font-size-base);
    }
  }

  // Action Element
  &__action {
    margin-left: var(--space-2);
    color: var(--text-secondary);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .game-card--small & {
      margin-left: var(--space-1);
    }

    .game-card--large & {
      margin-left: var(--space-3);
    }
  }

  &__arrow {
    transition: transform 0.2s ease;

    .game-card:hover & {
      transform: translateX(2px);
    }
  }
}

// Media Queries for responsive behavior
@media (min-width: vars.$breakpoint-md) {
  .game-card {
    padding: var(--space-6);

    &--small {
      padding: var(--space-4);
    }

    &--large {
      padding: var(--space-8);
    }
  }
}
</style>