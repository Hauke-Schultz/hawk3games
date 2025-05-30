<script setup>
// Simple props for the toggle component
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
})

// Simple event emission
const emit = defineEmits(['toggle'])

// Handle click event
const handleClick = () => {
  console.log('🎮 UIToggle clicked:', !props.isActive)
  emit('toggle')
}

// Handle keyboard interaction
const handleKeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <button
    class="ui-toggle btn btn--circle"
    :class="{
      'ui-toggle--active': isActive,
    }"
    @click="handleClick"
    @keydown="handleKeydown"
    :aria-label="isActive ? 'Show UI elements' : 'Hide UI elements'"
    :aria-pressed="isActive"
    type="button"
  >
    <!-- Pure CSS Hamburger/X Icon -->
    <div class="ui-toggle__icon">
      <span class="ui-toggle__line"></span>
      <span class="ui-toggle__line"></span>
      <span class="ui-toggle__line"></span>
    </div>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as vars;

// UI Toggle Block
.ui-toggle {
  position: absolute;
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  top: var(--space-4);
  left: var(--space-4);

  @media (min-width: vars.$breakpoint-md) {
    top: var(--space-4);
    left: -60px;
  }
}

// Icon Element
.ui-toggle__icon {
  width: 20px;
  height: 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 0;
  position: relative;
}

// Line Elements for Hamburger/X Animation
.ui-toggle__line {
  width: 18px;
  height: 2px;
  background-color: currentColor;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
  transform-origin: center;

  // Active State - Transform to X
  .ui-toggle--active .ui-toggle__icon & {
    &:nth-child(1) {
      transform: rotate(45deg) translate(4px, 4px);
    }

    &:nth-child(2) {
      opacity: 0;
      transform: scale(0);
    }

    &:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
}

// Reduced motion preference
@media (prefers-reduced-motion: reduce) {
  .ui-toggle,
  .ui-toggle__line,
  .ui-toggle__tooltip {
    transition: none;
  }

  .ui-toggle:hover {
    transform: none;
  }
}

// GPU acceleration for smooth animations
.ui-toggle,
.ui-toggle__line {
  will-change: transform;
  transform: translateZ(0);
}
</style>