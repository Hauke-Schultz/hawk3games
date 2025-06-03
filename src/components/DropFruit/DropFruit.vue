<script setup>
import { computed } from 'vue'
import { FRUIT_TYPES } from '../../config/fruitMergeGameConfig.js'
import FruitSvg from '../FruitSvg/FruitSvg.vue'

const props = defineProps({
  fruitType: {
    type: String,
    required: true,
    validator: (value) => Object.keys(FRUIT_TYPES).includes(value)
  },
  position: {
    type: Object,
    default: () => ({ x: 150, y: 30 })
  },
  size: {
    type: Number,
    default: null
  },
  isPreview: {
    type: Boolean,
    default: true
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isValidDrop: {
    type: Boolean,
    default: true
  }
})

// Get fruit configuration
const fruitConfig = computed(() => FRUIT_TYPES[props.fruitType])

// Calculate display size
const displaySize = computed(() => {
  return props.size || (fruitConfig.value.radius * 2)
})

// SVG positioning
const svgStyle = computed(() => ({
  position: 'absolute',
  left: `${props.position.x - displaySize.value / 2}px`,
  top: `${props.position.y - displaySize.value / 2}px`,
  width: `${displaySize.value}px`,
  height: `${displaySize.value}px`,
  transform: props.isDragging ? 'scale(1.1)' : 'scale(1)',
  transition: props.isDragging ? 'transform 0.1s ease' : 'all 0.3s ease',
  pointerEvents: 'none',
  zIndex: props.isDragging ? 20 : 10,
  filter: props.isDragging
    ? `drop-shadow(0 4px 12px ${fruitConfig.value.glowColor})`
    : 'none'
}))
</script>

<template>
  <div
    class="drop-fruit"
    :class="{
      'drop-fruit--preview': isPreview,
      'drop-fruit--dropping': !isPreview,
      'drop-fruit--dragging': isDragging,
      'drop-fruit--invalid': isDragging && !isValidDrop
    }"
    :style="svgStyle"
  >
    <!-- Fruit SVG -->
    <FruitSvg
      :fruit-type="fruitType"
      :size="displaySize"
    />

    <!-- Glow effect for preview -->
    <div
      v-if="isPreview"
      class="drop-fruit__glow"
      :style="{
        backgroundColor: fruitConfig.color,
        boxShadow: `0 0 20px ${fruitConfig.glowColor}`
      }"
    />
  </div>
</template>

<style scoped lang="scss">
.drop-fruit {
  &--preview {
    animation: fruit-hover 2s ease-in-out infinite;

    .drop-fruit__glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80%;
      height: 80%;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.3;
      animation: glow-pulse 2s ease-in-out infinite;
    }
  }

  &--dropping {
    .drop-fruit__svg {
      animation: fruit-spin 1s linear infinite;
    }
  }

  &__svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  &--dragging {
    .drop-fruit__glow {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.3);
      animation: glow-intense 0.5s ease-in-out infinite;
    }
  }

  &--invalid {
    .drop-fruit__glow {
      background-color: var(--error-color) !important;
      box-shadow: 0 0 20px var(--error-color) !important;
    }
  }
}

@keyframes fruit-hover {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes fruit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes glow-intense {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>