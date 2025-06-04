<script setup>
import { useLevelCompletionUI } from '../../composables/useLevelCompletionUI.js'

const props = defineProps({
  levelCompletionState: {
    type: Object,
    required: true
  },
  currentSession: {
    type: Object,
    required: true
  }
})

const { shouldShowProgress, progressBarStyle, progressText, currentLevelGoal } = useLevelCompletionUI(props.levelCompletionState)
</script>

<template>
  <div
    v-if="shouldShowProgress"
    class="level-progress-display"
  >
    <div class="progress">
      <div class="progress__header">
        <span class="progress__label">{{ currentLevelGoal?.description }}</span>
        <span class="progress__percentage">{{ progressText }}</span>
      </div>
      <div class="progress__bar">
        <div
          class="progress__fill"
          :style="progressBarStyle"
        ></div>
      </div>
      <div class="progress__target">
        <span>{{ currentSession?.score || 0 }} / {{ currentLevelGoal?.targetScore }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.level-progress-display {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 15;
  pointer-events: none;
}

.progress {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-md);
  padding: var(--space-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-1);
  }

  &__label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);
  }

  &__percentage {
    font-size: var(--font-size-sm);
    font-weight: bold;
    color: var(--accent-color);
  }

  &__bar {
    height: 8px;
    background: var(--grey-light);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--space-1);
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-color), var(--success-color));
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  &__target {
    text-align: center;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }
}

[data-theme="dark"] .progress {
  background: rgba(45, 52, 54, 0.95);

  &__label {
    color: var(--text-color);
  }
}
</style>