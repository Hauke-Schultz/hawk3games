<script setup>
import { computed } from 'vue'

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
          <svg v-if="item.icon === 'home'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>

          <!-- Profile Icon -->
          <svg v-else-if="item.icon === 'profile'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>

          <!-- Trophy Icon -->
          <svg v-else-if="item.icon === 'trophy'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"/>
            <path d="M2 14.66a8 8 0 1 0 20 0"/>
          </svg>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card-bg);
  border-top: 1px solid var(--grey-color);
  z-index: 1000;
  /* Add safe area for mobile devices with home indicator */
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-2) var(--space-4);
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
  min-width: 60px;
  gap: var(--space-1);

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

/* Dark theme specific adjustments */
[data-theme="dark"] .nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .nav-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>