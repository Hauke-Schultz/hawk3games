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
  </div>
</template>

<style scoped lang="scss">
.drop-fruit {
  &--preview {
    animation: fruit-hover 2s ease-in-out infinite;
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
}

@keyframes fruit-hover {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
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