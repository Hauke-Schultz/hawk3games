<script setup>
import { computed } from 'vue'

// Props for fruit preview
const props = defineProps({
  nextFruitType: {
    type: String,
    required: true,
    validator: (value) => ['CHERRY', 'STRAWBERRY', 'GRAPE', 'ORANGE', 'APPLE', 'PEAR', 'PINEAPPLE', 'MELON', 'COCONUT'].includes(value)
  },
  canvasWidth: {
    type: Number,
    default: 400
  },
  isGameActive: {
    type: Boolean,
    default: false
  },
  dropPosition: {
    type: Number,
    default: null // x coordinate for preview position
  }
})

// Fruit type configuration
const FRUIT_TYPES = {
  CHERRY: { emoji: '🍒', radius: 15, color: '#ff6b6b' },
  STRAWBERRY: { emoji: '🍓', radius: 18, color: '#ff8787' },
  GRAPE: { emoji: '🍇', radius: 22, color: '#845ec2' },
  ORANGE: { emoji: '🍊', radius: 26, color: '#ffa726' },
  APPLE: { emoji: '🍎', radius: 30, color: '#e53e3e' },
  PEAR: { emoji: '🍐', radius: 34, color: '#38a169' },
  PINEAPPLE: { emoji: '🍍', radius: 38, color: '#d69e2e' },
  MELON: { emoji: '🍉', radius: 42, color: '#38b2ac' },
  COCONUT: { emoji: '🥥', radius: 46, color: '#8b4513' }
}

// Computed properties for current fruit
const currentFruit = computed(() => {
  return FRUIT_TYPES[props.nextFruitType] || FRUIT_TYPES.CHERRY
})

const previewStyle = computed(() => {
  if (!props.dropPosition || !props.isGameActive) {
    return {
      display: 'none'
    }
  }

  return {
    position: 'absolute',
    left: `${props.dropPosition}px`,
    top: '10px',
    transform: 'translateX(-50%)',
    width: `${currentFruit.value.radius * 2}px`,
    height: `${currentFruit.value.radius * 2}px`,
    backgroundColor: currentFruit.value.color,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${currentFruit.value.radius * 1.2}px`,
    opacity: '0.8',
    pointerEvents: 'none',
    zIndex: '10',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.1s ease'
  }
})

const nextFruitDisplayStyle = computed(() => {
  return {
    width: `${currentFruit.value.radius * 1.5}px`,
    height: `${currentFruit.value.radius * 1.5}px`,
    backgroundColor: currentFruit.value.color,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${currentFruit.value.radius}px`,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
  }
})
</script>

<template>
  <div class="fruit-drop-preview">
    <!-- Next Fruit Display (always visible) -->
    <div class="fruit-drop-preview__next-fruit">
      <h4 class="fruit-drop-preview__label">Next Fruit:</h4>
      <div
        class="fruit-drop-preview__next-display"
        :style="nextFruitDisplayStyle"
      >
        {{ currentFruit.emoji }}
      </div>
      <span class="fruit-drop-preview__name">{{ nextFruitType }}</span>
    </div>

    <!-- Drop Position Preview (only when hovering/touching) -->
    <div
      v-if="dropPosition && isGameActive"
      class="fruit-drop-preview__drop-preview"
      :style="previewStyle"
    >
      {{ currentFruit.emoji }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Fruit Drop Preview Block
.fruit-drop-preview {
  // Next Fruit Display Element
  &__next-fruit {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    box-shadow: var(--card-shadow);
    margin-bottom: var(--space-3);

    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-4);
      gap: var(--space-3);
    }
  }

  &__label {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-base);
    }
  }

  &__next-display {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  &__name {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: capitalize;

    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-sm);
    }
  }

  // Drop Preview Element (absolute positioned)
  &__drop-preview {
    animation: drop-preview-pulse 1s ease-in-out infinite;
  }
}

// Animations
@keyframes drop-preview-pulse {
  0%, 100% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

// Responsive adjustments
@media (max-width: vars.$breakpoint-sm) {
  .fruit-drop-preview {
    &__next-fruit {
      padding: var(--space-2);
      gap: var(--space-1);
    }

    &__label {
      font-size: var(--font-size-xs);
    }

    &__name {
      font-size: 10px;
    }
  }
}

// Accessibility and reduced motion
@media (prefers-reduced-motion: reduce) {
  .fruit-drop-preview__drop-preview {
    animation: none;
  }

  .fruit-drop-preview__next-display:hover {
    transform: none;
  }
}
</style>