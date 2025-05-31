<script setup>
// Simple props for the burger menu component
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
})

// Simple event emission
const emit = defineEmits(['toggle'])

// Handle click event
const handleClick = () => {
  console.log('🍔 BurgerMenu clicked:', !props.isOpen)
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
    class="burger-menu btn btn--circle"
    :class="{
      'burger-menu--open': isOpen,
    }"
    @click="handleClick"
    @keydown="handleKeydown"
    :aria-label="isOpen ? 'Close navigation menu' : 'Open navigation menu'"
    :aria-expanded="isOpen"
    type="button"
  >
    <!-- Pure CSS Hamburger/X Icon -->
    <div class="burger-menu__icon">
      <span class="burger-menu__line"></span>
      <span class="burger-menu__line"></span>
      <span class="burger-menu__line"></span>
    </div>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as vars;

// Burger Menu Block
.burger-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// Icon Element
.burger-menu__icon {
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
.burger-menu__line {
  width: 18px;
  height: 2px;
  background-color: currentColor;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
  transform-origin: center;

  // Open State - Transform to X
  .burger-menu--open .burger-menu__icon & {
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
  .burger-menu,
  .burger-menu__line {
    transition: none;
  }
}

// GPU acceleration for smooth animations
.burger-menu,
.burger-menu__line {
  will-change: transform;
  transform: translateZ(0);
}
</style>