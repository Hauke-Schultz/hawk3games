<script setup>
import { computed } from 'vue'
import GameIcon from '../GameIcon/GameIcon.vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
})

const emit = defineEmits(['tab-changed'])

// Navigation items matching the mobile design
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
  emit('tab-changed', tabId)
}

const isActive = (tabId) => {
  return props.activeTab === tabId
}
</script>

<template>
  <nav class="bottom-navigation" role="navigation" aria-label="Main navigation">
    <div class="nav-container">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ 'active': isActive(item.id) }"
        @click="handleTabClick(item.id)"
        :aria-label="item.label"
        :aria-current="isActive(item.id) ? 'page' : undefined"
      >
        <div class="nav-icon">
          <!-- Home Icon -->
          <GameIcon
            v-if="item.icon === 'home'"
            :name="item.icon"
            :size="24"
            :color="isActive(item.id) ? 'var(--accent-color)' : 'currentColor'"
          />

          <!-- Profile Icon -->
          <GameIcon
            v-else-if="item.icon === 'profile'"
            :name="item.icon"
            :size="24"
            :color="isActive(item.id) ? 'var(--accent-color)' : 'currentColor'"
          />

          <!-- Settings Icon (NEU) -->
          <GameIcon
            v-else-if="item.icon === 'settings'"
            :name="item.icon"
            :size="24"
            :color="isActive(item.id) ? 'var(--accent-color)' : 'currentColor'"
          />

          <!-- Trophy Icon -->
          <GameIcon
            v-else-if="item.icon === 'trophy'"
            :name="item.icon"
            :size="24"
            :color="isActive(item.id) ? 'var(--accent-color)' : 'currentColor'"
          />
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background-color: var(--card-bg);
  border-top: 1px solid var(--grey-color);
  z-index: 1000;
  /* Add safe area for mobile devices with home indicator */
  padding-bottom: env(safe-area-inset-bottom);

  // Desktop styling - bordered mobile view
  @media (min-width: vars.$breakpoint-md) {
    border-left: 1px solid var(--card-border);
    border-right: 1px solid var(--card-border);
  }
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-2) var(--space-2); // Reduziert für mehr Platz
  max-width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
  color: var(--text-secondary);
  min-width: 50px; // Reduziert von 60px für 4 Items
  gap: var(--space-1);
  flex: 1; // Gleichmäßige Verteilung

  // Mobile Anpassungen für 4 Tabs
  @media (max-width: 480px) {
    min-width: 44px;
    padding: var(--space-1);

    .nav-label {
      font-size: 0.625rem; // Kleinere Schrift für mehr Platz
    }
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-color);
  }

  &:focus-visible {
    outline: var(--focus-outline);
    outline-offset: 0.125rem;
    background-color: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: var(--accent-color);

    .nav-icon {
      transform: scale(1.1);
    }
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.nav-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-align: center;
  line-height: 1;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .bottom-navigation {
    /* Hide on desktop or adjust as needed */
    display: block;
  }

  .nav-container {
    max-width: 75rem;
    margin: 0 auto;
  }
}
@media (max-width: 380px) {
  .bottom-navigation {
    .nav-container {
      padding: var(--space-1) var(--space-1);
    }

    .nav-item {
      min-width: 40px;
      padding: var(--space-1);

      .nav-label {
        font-size: 0.5rem;
        line-height: 1;
      }

      .nav-icon {
        margin-bottom: 2px;
      }
    }
  }
}

// Enhanced active state für bessere Sichtbarkeit bei 4 Tabs
.nav-item.active {
  background-color: rgba(0, 184, 148, 0.1);

  .nav-label {
    font-weight: 600;
  }
}

/* Dark theme specific adjustments */
[data-theme="dark"] .nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .nav-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>