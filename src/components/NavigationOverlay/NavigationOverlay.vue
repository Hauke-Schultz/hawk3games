<script setup>
import { computed } from 'vue'
import GameIcon from '../GameIcon/GameIcon.vue'


const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activeTab: {
    type: String,
    default: 'home'
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  backButtonLabel: {  // NEW
    type: String,
    default: 'Back'
  }
})

const emit = defineEmits(['tab-select', 'close', 'back'])

// Navigation items
const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings'
  },
  {
    id: 'trophy',
    label: 'Trophy',
    icon: 'trophy'
  }
]

const handleTabClick = (tabId) => {
  emit('tab-select', tabId)
}

const handleBackClick = () => {
  emit('back')
}

const handleBackdropClick = () => {
  emit('close')
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

const isActive = (tabId) => {
  return props.activeTab === tabId
}
</script>

<template>
  <Transition name="navigation-overlay">
    <div
      v-if="isOpen"
      class="navigation-overlay"
      @keydown="handleKeydown"
      tabindex="-1"
    >
      <div
        class="navigation-overlay__backdrop"
        @click="handleBackdropClick"
        aria-hidden="true"
      ></div>

      <nav
        class="navigation-overlay__content"
        role="navigation"
        aria-label="Main navigation"
      >
        <!-- Enhanced Back Button -->
        <button
          v-if="showBackButton"
          class="navigation-overlay__item navigation-overlay__item--back"
          @click="handleBackClick"
          :aria-label="backButtonLabel"
        >
          <div class="navigation-overlay__item-icon">
            <GameIcon name="back-arrow" :size="24" />
          </div>
          <span class="navigation-overlay__item-label">{{ backButtonLabel }}</span>
        </button>

        <!-- Navigation Items - REST BLEIBT GLEICH -->
        <button
          v-for="item in navItems"
          :key="item.id"
          class="navigation-overlay__item"
          :class="{ 'navigation-overlay__item--active': isActive(item.id) }"
          @click="handleTabClick(item.id)"
          :aria-label="item.label"
          :aria-current="isActive(item.id) ? 'page' : undefined"
        >
          <div class="navigation-overlay__item-icon">
            <GameIcon
              :name="item.icon"
              :size="24"
              :color="isActive(item.id) ? 'var(--accent-color)' : 'currentColor'"
            />
          </div>
          <span class="navigation-overlay__item-label">{{ item.label }}</span>
        </button>
      </nav>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Navigation Overlay Block
.navigation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  max-width: 480px;
  margin: 0 auto;

  // Desktop styling - bordered mobile view
  @media (min-width: vars.$breakpoint-md) {
    border-left: 1px solid var(--card-border);
    border-right: 1px solid var(--card-border);
  }

  // Backdrop Element
  &__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  // Content Element
  &__content {
    position: relative;
    background-color: var(--card-bg);
    border-bottom: 1px solid var(--card-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: var(--space-4) 0;
    margin-top: 80px; // Space for header

    @media (min-width: vars.$breakpoint-md) {
      margin-top: 88px;
    }
  }

  // Navigation Item Element
  &__item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--space-4) var(--space-6);
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color);
    text-align: left;
    min-height: 56px; // Touch-friendly

    &:hover {
      background-color: var(--card-bg-hover);
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: -2px;
      background-color: var(--card-bg-hover);
    }

    &--active {
      background-color: rgba(0, 184, 148, 0.1);
      color: var(--accent-color);

      .navigation-overlay__item-label {
        font-weight: 600;
      }
    }

    &--back {
      border-bottom: 1px solid var(--card-border);
      margin-bottom: var(--space-2);
    }
  }

  &__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-4);
    flex-shrink: 0;
  }

  &__item-label {
    font-size: var(--font-size-base);
    font-weight: 500;
    flex: 1;
  }
}

// Animation Transitions
.navigation-overlay-enter-active,
.navigation-overlay-leave-active {
  transition: opacity 0.3s ease;

  .navigation-overlay__backdrop {
    transition: opacity 0.3s ease;
  }

  .navigation-overlay__content {
    transition: transform 0.3s ease-out;
  }
}

.navigation-overlay-enter-from,
.navigation-overlay-leave-to {
  opacity: 0;

  .navigation-overlay__backdrop {
    opacity: 0;
  }

  .navigation-overlay__content {
    transform: translateY(-100%);
  }
}

// Dark theme specific adjustments
[data-theme="dark"] .navigation-overlay__item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .navigation-overlay__item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>