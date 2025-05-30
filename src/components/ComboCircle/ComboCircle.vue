<template>
  <div v-if="combo > 0" class="combo-display">
    <!-- Circular progress ring -->
    <div class="combo-circle">
      <svg class="progress-ring" width="80" height="80">
        <!-- Background circle -->
        <circle
          class="progress-ring-background"
          cx="40"
          cy="40"
          r="35"
          fill="transparent"
          stroke="#333"
          stroke-width="4"
        />
        <!-- Progress circle -->
        <circle
          class="progress-ring-progress"
          cx="40"
          cy="40"
          r="35"
          fill="transparent"
          :stroke="progressColor"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          transform="rotate(-90 40 40)"
        />
      </svg>

      <!-- Combo number in center -->
      <div class="combo-content">
        <div class="combo-number">{{ combo }}</div>
        <div class="combo-label">COMBO</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props - these would come from parent component or store
const props = defineProps({
  combo: {
    type: Number,
    default: 0
  },
  maxComboTime: {
    type: Number,
    default: 5000 // 5 seconds in milliseconds
  },
  currentComboTime: {
    type: Number,
    default: 5000
  }
})

// Reactive data
const combo = ref(props.combo)
const currentTime = ref(props.currentComboTime)
const maxTime = ref(props.maxComboTime)

// Circle calculations
const radius = 35
const circumference = 2 * Math.PI * radius

// Computed properties
const timePercentage = computed(() => {
  if (maxTime.value === 0) return 0
  return (currentTime.value / maxTime.value) * 100
})

const strokeDashoffset = computed(() => {
  const progress = timePercentage.value / 100
  return circumference * (1 - progress)
})

const progressColor = computed(() => {
  const percentage = timePercentage.value
  if (percentage > 66) return '#22c55e' // Green
  if (percentage > 33) return '#f97316' // Orange
  return '#ef4444' // Red
})

// Watch for prop changes
watch(() => props.combo, (newCombo) => {
  combo.value = newCombo
})

watch(() => props.currentComboTime, (newTime) => {
  currentTime.value = newTime
})

watch(() => props.maxComboTime, (newMaxTime) => {
  maxTime.value = newMaxTime
})

// Timer for smooth countdown (if needed)
let countdownInterval = null

const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  countdownInterval = setInterval(() => {
    if (currentTime.value > 0) {
      currentTime.value -= 16 // ~60fps updates
    } else {
      clearInterval(countdownInterval)
      combo.value = 0 // Reset combo when time runs out
    }
  }, 16)
}

// Lifecycle hooks
onMounted(() => {
  if (combo.value > 0 && currentTime.value > 0) {
    startCountdown()
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// Watch combo changes to restart timer
watch(combo, (newCombo, oldCombo) => {
  if (newCombo > oldCombo && newCombo > 0) {
    // Combo increased, restart timer
    currentTime.value = maxTime.value
    startCountdown()
  } else if (newCombo === 0) {
    // Combo reset
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
  }
})
</script>

<style scoped>
.combo-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: comboAppear 0.3s ease-out;
}

.combo-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
}

.progress-ring-background {
  opacity: 0.3;
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.1s ease-out, stroke 0.3s ease-out;
}

.combo-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.combo-number {
  font-size: 1.5rem;
  line-height: 1;
  margin-bottom: 2px;
  animation: comboNumberPulse 0.2s ease-out;
}

.combo-label {
  font-size: 0.6rem;
  letter-spacing: 1px;
  opacity: 0.9;
}

/* Animations */
@keyframes comboAppear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes comboNumberPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .combo-circle {
    width: 60px;
    height: 60px;
  }

  .progress-ring {
    width: 60px;
    height: 60px;
  }

  .combo-number {
    font-size: 1.2rem;
  }

  .combo-label {
    font-size: 0.5rem;
  }
}
</style>