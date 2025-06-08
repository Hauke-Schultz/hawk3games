<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Display value
  value: {
    type: [Number, String],
    default: 0,
  },
  label: {
    type: String,
    default: 'STAT'
  },
  subline: {
    type: String,
    default: ''
  },

  // Progress tracking (optional)
  progress: {
    type: Number,
    default: null // null = no progress ring
  },
  maxProgress: {
    type: Number,
    default: 100
  },

  // Timer mode (for combo)
  timeLeft: {
    type: Number,
    default: null // null = no timer
  },
  maxTime: {
    type: Number,
    default: 6000
  },

  // Visual customization
  size: {
    type: Number,
    default: 80
  },
  color: {
    type: String,
    default: 'var(--accent-color)'
  },

  // Type for different behaviors
  type: {
    type: String,
    default: 'basic', // 'basic', 'combo', 'progress', 'timer'
    validator: (value) => ['basic', 'combo', 'progress', 'timer'].includes(value)
  }
})

// Progress calculations
const progressPercentage = computed(() => {
  if (props.progress !== null && props.maxProgress > 0) {
    return Math.max(0, Math.min(100, (props.progress / props.maxProgress) * 100))
  }

  if (props.timeLeft !== null && props.maxTime > 0) {
    return Math.max(0, Math.min(100, (props.timeLeft / props.maxTime) * 100))
  }

  return 0
})

const ringColor = computed(() => {
  if (props.type === 'combo' || props.type === 'timer') {
    const percentage = progressPercentage.value
    if (percentage > 66) return '#22c55e' // Green
    if (percentage > 33) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  return props.color
})

// Circle calculations for SVG
const radius = computed(() => (props.size - 10) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const strokeDashoffset = computed(() => {
  if (props.progress === null && props.timeLeft === null) return 0

  const progress = progressPercentage.value / 100
  return circumference.value * (1 - progress)
})

// Center position
const center = computed(() => props.size / 2)

// Font sizes based on circle size
const fontSize = computed(() => {
  return Math.max(16, props.size * 0.25)
})

const labelSize = computed(() => {
  return Math.max(8, props.size * 0.1)
})

// Format display value
const displayValue = computed(() => {
  if (props.value >= 1000000) {
    return `${Math.floor(props.value / 100000) / 10}M`
  }
  if (props.value >= 1000) {
    return `${Math.floor(props.value / 100) / 10}k`
  }
  return props.value.toString()
})
</script>

<template>
  <div
    class="stat-circle"
    :class="`stat-circle--${type}`"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <!-- SVG Ring (only if progress/timer data available) -->
    <svg
      v-if="progress !== null || timeLeft !== null"
      class="stat-circle__ring"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
    >
      <!-- Background circle -->
      <circle
        class="stat-circle__background"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.2)"
        stroke-width="4"
      />
      <!-- Progress circle -->
      <circle
        class="stat-circle__progress"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke="ringColor"
        stroke-width="4"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :transform="`rotate(-90 ${center} ${center})`"
      />
    </svg>

    <!-- Content in center -->
    <div class="stat-circle__content">
      <div
        class="stat-circle__value"
        :style="{
          fontSize: `${fontSize}px`,
          color: color
        }"
      >
        {{ displayValue }}
      </div>
      <div
        class="stat-circle__label"
        :style="{ fontSize: `${labelSize}px` }"
      >
        {{ label }}
      </div>
      <div
        v-if="subline"
        class="stat-circle__subline"
        :style="{ fontSize: `${labelSize * 1.5}px` }"
      >
        {{ subline }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Generic Stat Circle Block
.stat-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: stat-appear 0.3s ease-out;

  // Type modifiers
  &--combo {
    .stat-circle__value {
      animation: stat-number-pulse 0.2s ease-out;
    }
  }

  &--progress,
  &--timer {
    .stat-circle__progress {
      transition: stroke-dashoffset 0.1s ease-out, stroke 0.3s ease-out;
    }
  }

  // Ring Element
  &__ring {
    position: absolute;
    top: 0;
    left: 0;
  }

  &__background {
    opacity: 0.3;
  }

  &__progress {
    transition: stroke-dashoffset 0.1s ease-out, stroke 0.3s ease-out;
  }

  // Content Element
  &__content {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 1;
  }

  &__value {
    line-height: 1;
    margin-bottom: 2px;
    font-weight: 900;
  }

  &__label {
    letter-spacing: 1px;
    opacity: 0.9;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 600;
    line-height: 1;
  }
}

// Animations
@keyframes stat-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes stat-number-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

// Theme adjustments
[data-theme="dark"] .stat-circle {
  &__background {
    stroke: rgba(255, 255, 255, 0.1);
  }
}

[data-theme="light"] .stat-circle {
  &__background {
    stroke: rgba(0, 0, 0, 0.15);
  }
}

// Responsive optimizations
@media (max-width: 768px) {
  .stat-circle {
    min-width: 44px;
    min-height: 44px;
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .stat-circle,
  .stat-circle__value,
  .stat-circle__progress {
    animation: none;
    transition: none;
  }
}
</style>