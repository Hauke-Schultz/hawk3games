<script setup>
// Simple props for the toggle component
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'top-right', // top-right, top-left, bottom-right, bottom-left
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
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
    class="ui-toggle"
    :class="{
      'ui-toggle--active': isActive,
      [`ui-toggle--${position}`]: true,
      [`ui-toggle--${size}`]: true
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

    <!-- Optional tooltip text -->
    <span class="ui-toggle__tooltip">
      {{ isActive ? 'Show UI (F)' : 'Hide UI (F)' }}
    </span>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as vars;

// UI Toggle Block
.ui-toggle {
  position: fixed;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);

  // Ensure minimum touch target
  min-width: 44px;
  min-height: 44px;

  // Position Modifiers
  &--top-right {
    top: 20px;
    right: 20px;

    @media (max-width: vars.$breakpoint-sm) {
      top: 16px;
      right: 16px;
    }
  }

  &--top-left {
    top: 20px;
    left: 20px;

    @media (max-width: vars.$breakpoint-sm) {
      top: 16px;
      left: 16px;
    }
  }

  &--bottom-right {
    bottom: calc(20px + env(safe-area-inset-bottom));
    right: 20px;

    @media (max-width: vars.$breakpoint-sm) {
      bottom: calc(16px + env(safe-area-inset-bottom));
      right: 16px;
    }
  }

  &--bottom-left {
    bottom: calc(20px + env(safe-area-inset-bottom));
    left: 20px;

    @media (max-width: vars.$breakpoint-sm) {
      bottom: calc(16px + env(safe-area-inset-bottom));
      left: 16px;
    }
  }

  // Size Modifiers
  &--small {
    padding: 8px;
    min-width: 36px;
    min-height: 36px;
  }

  &--large {
    padding: 16px;
    min-width: 52px;
    min-height: 52px;
  }

  // Hover State
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  // Active State
  &:active {
    transform: scale(0.95);
  }

  // Focus State
  &:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(0, 184, 148, 0.25);
  }

  // Active Toggle State
  &--active {
    background: rgba(0, 184, 148, 0.2);
    border-color: rgba(0, 184, 148, 0.4);

    &:hover {
      background: rgba(0, 184, 148, 0.3);
    }
  }
}

// Icon Element
.ui-toggle__icon {
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 3px 0;
  position: relative;

  // Size adjustments
  .ui-toggle--small & {
    width: 18px;
    height: 18px;
    padding: 2px 0;
  }

  .ui-toggle--large & {
    width: 30px;
    height: 30px;
    padding: 4px 0;
  }
}

// Line Elements for Hamburger/X Animation
.ui-toggle__line {
  width: 18px;
  height: 2px;
  background-color: currentColor;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
  transform-origin: center;

  // Size adjustments
  .ui-toggle--small .ui-toggle__icon & {
    width: 14px;
    height: 1.5px;
  }

  .ui-toggle--large .ui-toggle__icon & {
    width: 24px;
    height: 3px;
  }

  // Active State - Transform to X
  .ui-toggle--active .ui-toggle__icon & {
    &:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    &:nth-child(2) {
      opacity: 0;
      transform: scale(0);
    }

    &:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  }

  // Size-specific active transforms
  .ui-toggle--small.ui-toggle--active .ui-toggle__icon & {
    &:nth-child(1) {
      transform: rotate(45deg) translate(4px, 4px);
    }

    &:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }

  .ui-toggle--large.ui-toggle--active .ui-toggle__icon & {
    &:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    &:nth-child(3) {
      transform: rotate(-45deg) translate(8px, -7px);
    }
  }
}

// Tooltip Element
.ui-toggle__tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(45, 52, 54, 0.9);
  color: white;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 1;

  // Tooltip arrow
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(45, 52, 54, 0.9);
  }

  // Show on hover
  .ui-toggle:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-2px);
  }

  // Position adjustments for bottom positions
  .ui-toggle--bottom-right &,
  .ui-toggle--bottom-left & {
    bottom: auto;
    top: calc(100% + 8px);

    &::after {
      top: -8px;
      border-top-color: transparent;
      border-bottom-color: rgba(45, 52, 54, 0.9);
    }
  }
}

// Dark theme adjustments
[data-theme="dark"] .ui-toggle {
  background: rgba(45, 52, 54, 0.1);
  border-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(45, 52, 54, 0.15);
  }

  &--active {
    background: rgba(0, 184, 148, 0.2);
    border-color: rgba(0, 184, 148, 0.4);
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .ui-toggle {
    border-width: 2px;

    &__line {
      height: 3px;
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

// Mobile touch optimizations
@media (hover: none) and (pointer: coarse) {
  .ui-toggle {
    // Always show minimum touch size on mobile
    min-width: 48px;
    min-height: 48px;

    // Hide tooltip on touch devices
    &__tooltip {
      display: none;
    }

    // Larger hover area
    &::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border-radius: inherit;
    }
  }

  .ui-toggle--small {
    min-width: 44px;
    min-height: 44px;
  }

  .ui-toggle--large {
    min-width: 52px;
    min-height: 52px;
  }
}

// GPU acceleration for smooth animations
.ui-toggle,
.ui-toggle__line {
  will-change: transform;
  transform: translateZ(0);
}
</style>