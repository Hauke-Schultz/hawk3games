<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  combo: {
    type: Number,
    default: 0
  },
  comboTimeLeft: {
    type: Number,
    default: 0
  },
  comboResetDelay: {
    type: Number,
    default: 6000
  },
  size: {
    type: Number,
    default: 80
  }
})

// Time calculations
const comboTimePercentage = computed(() => {
  if (props.comboResetDelay === 0) return 0
  return Math.max(0, Math.min(100, (props.comboTimeLeft / props.comboResetDelay) * 100))
})

const comboProgressColor = computed(() => {
  const percentage = comboTimePercentage.value
  if (percentage > 66) return '#22c55e' // Green
  if (percentage > 33) return '#f97316' // Orange
  return '#ef4444' // Red
})

// Circle calculations for SVG
const radius = computed(() => (props.size - 10) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const strokeDashoffset = computed(() => {
  const progress = comboTimePercentage.value / 100
  return circumference.value * (1 - progress)
})

// Center position
const center = computed(() => props.size / 2)

// Font size based on circle size
const fontSize = computed(() => {
  return Math.max(16, props.size * 0.25)
})

const labelSize = computed(() => {
  return Math.max(8, props.size * 0.1)
})

</script>

<template>
  <div
    class="combo-circle"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <!-- SVG Circle Timer -->
    <svg
      class="combo-circle__ring"
      :width="size"
      :height="size"
      viewBox="0 0 80 80"
    >
      <!-- Background circle -->
      <circle
        class="combo-circle__background"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.2)"
        stroke-width="4"
      />
      <!-- Progress circle -->
      <circle
        class="combo-circle__progress"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke="comboProgressColor"
        stroke-width="4"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        transform="rotate(-90 40 40)"
      />
    </svg>

    <!-- Combo content in center -->
    <div class="combo-circle__content">
      <div
        class="combo-circle__number"
        :style="{ fontSize: `${fontSize}px` }"
      >
        {{ combo }}
      </div>
      <div
        class="combo-circle__label"
        :style="{ fontSize: `${labelSize}px` }"
      >
        COMBO
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Combo Circle Block
.combo-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: combo-appear 0.3s ease-out;

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
    color: var(--text-color);
    font-weight: bold;
    z-index: 1;
  }

  &__number {
    line-height: 1;
    margin-bottom: 2px;
    animation: combo-number-pulse 0.2s ease-out;
    color: var(--accent-color);
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
@keyframes combo-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes combo-number-pulse {
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

// Responsive optimizations
@media (max-width: 768px) {
  .combo-circle {
    // Ensure mobile touch targets are adequate
    min-width: 44px;
    min-height: 44px;
  }
}

// Dark theme adjustments
[data-theme="dark"] .combo-circle {
  &__background {
    stroke: rgba(255, 255, 255, 0.1);
  }
}

[data-theme="light"] .combo-circle {
  &__background {
    stroke: rgba(0, 0, 0, 0.15);
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .combo-circle {
    &__background {
      opacity: 1;
      stroke-width: 2px;
    }

    &__progress {
      stroke-width: 3px;
    }
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .combo-circle,
  .combo-circle__number,
  .combo-circle__progress {
    animation: none;
    transition: none;
  }
}
</style>