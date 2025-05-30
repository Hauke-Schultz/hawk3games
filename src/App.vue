<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import UIToggle from './components/UIToggle/UIToggle.vue'
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch.vue'
import GameCard from './components/GameCard/GameCard.vue'
import BottomNavigation from './components/BottomNavigation/BottomNavigation.vue'
import FruitMergeGame from './components/FruitMergeGame/FruitMergeGame.vue'

// Application state
const activeTab = ref('home') // Track active navigation tab
const currentView = ref('home') // Track current view/page
const isUIHidden = ref(false)

// Games data - designed for mobile-first approach
const games = ref([
  {
    id: 1,
    name: 'FruitMerge',
    text: 'Merge colorful fruits to create bigger ones and score points!',
    icon: '🍎',
    iconType: 'emoji',
    iconBg: '#ff6b6b'
  },
  // Additional games can be added here when implemented
  // {
  //   id: 2,
  //   name: 'BlockPuzzle',
  //   text: 'Fit blocks together in this challenging puzzle game.',
  //   icon: '🧩',
  //   iconType: 'emoji',
  //   iconBg: '#4dabf7'
  // },
  // {
  //   id: 3,
  //   name: 'CardMatch',
  //   text: 'Match pairs of cards to test your memory skills.',
  //   icon: '🃏',
  //   iconType: 'emoji',
  //   iconBg: '#69db7c'
  // }
])

// Global UI toggle functions
const toggleUI = () => {
  isUIHidden.value = !isUIHidden.value
}

// Global keyboard shortcut handler
const handleGlobalKeydown = (event) => {
  if (event.key === 'f' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    // Only trigger if not typing in input fields
    if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName) &&
      event.target.contentEditable !== 'true') {
      event.preventDefault()
      toggleUI()
    }
  }
}

// Event handlers
const handleGameSelected = (game) => {
  console.log('Game selected:', game.name)
  if (game.name === 'FruitMerge') {
    currentView.value = 'fruitmerge'
  }
  // TODO: Add navigation for other games when implemented
}

const handleBackToMenu = () => {
  currentView.value = 'home'
  activeTab.value = 'home'
}

const handleTabChanged = (tabId) => {
  activeTab.value = tabId
  if (tabId === 'home') {
    currentView.value = 'home'
  } else {
    currentView.value = tabId
  }
  console.log('Tab changed to:', tabId)
}

// Load saved preference on app start
onMounted(() => {
  const saved = localStorage.getItem('hawk3games_ui_hidden')
  if (saved) {
    isUIHidden.value = JSON.parse(saved)
  }

  // Add global keyboard shortcut
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// Save preference when changed
watch(isUIHidden, (newValue) => {
  localStorage.setItem('hawk3games_ui_hidden', JSON.stringify(newValue))
  console.log(`🌐 Global UI ${newValue ? 'hidden' : 'visible'}`)
})
</script>

<template>
  <div
    class="app"
    :class="{ 'ui-hidden': isUIHidden }"
  >
    <div class="app__container" role="application">
      <!-- Global UI Toggle - appears on all pages -->
      <UIToggle
        :is-active="isUIHidden"
        position="top-right"
        size="medium"
        @toggle="toggleUI"
      />
      <!-- Show FruitMerge Game -->
      <FruitMergeGame
          v-if="currentView === 'fruitmerge'"
          @back-to-menu="handleBackToMenu"
      />

      <!-- Show Main App with Navigation -->
      <template v-else>
        <!-- App Header -->
        <header
          v-show="!isUIHidden"
          class="app__header"
          role="banner"
        >
          <div class="app__header-content">
            <div class="app__logo">
              <span class="app__logo-emoji">😊</span>
            </div>
            <h1 class="app__title">Hawk3Games</h1>
            <div class="app__theme-switch">
              <ThemeSwitch />
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main
          id="main-content"
          class="app__main"
          :class="{ 'app__main--expanded': isUIHidden }"
        >
          <!-- Games Section -->
          <section class="app__section" v-if="activeTab === 'home'">
            <h2 class="app__section-title">Games</h2>
            <div class="app__games-list">
              <GameCard
                  v-for="game in games"
                  :key="game.id"
                  :game="game"
                  size="medium"
                  variant="default"
                  @game-selected="handleGameSelected"
              />
            </div>
          </section>

          <!-- Profile Section -->
          <section class="app__section" v-else-if="activeTab === 'profile'">
            <h2 class="app__section-title">Profile</h2>
            <div class="app__placeholder-content">
              <div class="app__placeholder-icon">👤</div>
              <h3 class="app__placeholder-title">Your Profile</h3>
              <p class="app__placeholder-text">
                Your profile information, achievements, and personal stats will be displayed here.
              </p>
            </div>
          </section>

          <!-- Trophy Section -->
          <section class="app__section" v-else-if="activeTab === 'trophy'">
            <h2 class="app__section-title">Trophies</h2>
            <div class="app__placeholder-content">
              <div class="app__placeholder-icon">🏆</div>
              <h3 class="app__placeholder-title">Your Achievements</h3>
              <p class="app__placeholder-text">
                Your trophies, badges, and accomplishments from all games will be shown here.
              </p>
            </div>
          </section>
        </main>
      </template>

      <!-- Bottom Navigation -->
      <BottomNavigation
        v-show="!isUIHidden"
        :active-tab="activeTab"
        @tab-changed="handleTabChanged"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use './assets/variables.scss' as vars;

// App Block - Main application wrapper
.app {
  min-height: 100vh;
  background-color: var(--bg-color);

  // Desktop wrapper for mobile-first design (centered mobile view)
  @media (min-width: vars.$breakpoint-md) {
    display: flex;
    justify-content: center;
    background-color: var(--bg-color);
  }

  // App Container Element - Mobile-first container (480px max)
  &__container {
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
    transition: background-color 0.3s, color 0.3s;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color);
    color: var(--text-color);
    position: relative;
    width: 100%;
    max-width: 480px;

    // Desktop styling - bordered mobile view
    @media (min-width: vars.$breakpoint-md) {
      border-left: 1px solid var(--card-border);
      border-right: 1px solid var(--card-border);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
  }

  // Header Element - Sticky header with consistent styling
  &__header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--card-border);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--header-shadow);
  }

  &__header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    max-width: 100%;

    // Larger padding on desktop
    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-4) var(--space-8);
    }
  }

  // Logo Element - App branding
  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius-md);
    background-color: transparent;
    flex-shrink: 0;
  }

  &__logo-emoji {
    font-size: 24px;
    line-height: 1;
    user-select: none;
  }

  &__back-button {
    border-width: 0;
  }

  // Title Element - Main app title
  &__title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: bold;
    flex: 1;
    text-align: center;
    color: var(--text-color);

    // Larger title on desktop
    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-2xl);
    }
  }

  // Theme Switch Element - Dark/light mode toggle
  &__theme-switch {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  // Main Content Element - Scrollable content area
  &__main {
    flex: 1;
    padding: var(--space-4);
    /* Bottom padding accounts for fixed bottom navigation */
    padding-bottom: calc(var(--space-4) + 80px + env(safe-area-inset-bottom));
    overflow-y: auto;

    // Larger padding on desktop
    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-8);
      padding-bottom: calc(var(--space-8) + 80px + env(safe-area-inset-bottom));
    }

    // Remove focus outline for main content
    &:focus {
      outline: none;
    }

    &--expanded {
      padding-top: max(20px, env(safe-area-inset-top));
      padding-bottom: max(20px, env(safe-area-inset-bottom));
      min-height: 100vh;
    }
  }

  // Section Element - Content sections (Games, Profile, Trophy)
  &__section {
    width: 100%;
  }

  &__section-title {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-size-2xl);
    font-weight: bold;
    color: var(--text-color);

    // Larger title and spacing on desktop
    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-3xl);
      margin-bottom: var(--space-6);
    }
  }

  // Games List Element - Grid of game cards
  &__games-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);

    // Larger gap on desktop
    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-4);
    }

    // Could be converted to grid for multiple columns in future
    // @media (min-width: vars.$breakpoint-lg) {
    //   display: grid;
    //   grid-template-columns: repeat(2, 1fr);
    //   gap: var(--space-4);
    // }
  }

  // Placeholder Content Element - For Profile/Trophy sections
  &__placeholder-content {
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    padding: var(--space-6);
    text-align: center;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);

    // Larger padding on desktop
    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-8);
    }
  }

  &__placeholder-icon {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--space-4);
    opacity: 0.7;

    // Even larger icon on desktop
    @media (min-width: vars.$breakpoint-md) {
      font-size: 4rem;
      margin-bottom: var(--space-6);
    }
  }

  &__placeholder-title {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-color);

    // Larger title on desktop
    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--space-4);
    }
  }

  &__placeholder-text {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    line-height: 1.6;
    max-width: 300px;
    margin: 0 auto;

    // Larger text and width on desktop
    @media (min-width: vars.$breakpoint-md) {
      font-size: var(--font-size-lg);
      max-width: 400px;
    }
  }

  // Global UI Hidden State
  &.ui-hidden {
    // Header slides up
    .app__header {
      transform: translateY(-100%);
      opacity: 0;
      height: 0;
    }

    // Bottom navigation slides down
    .bottom-navigation {
      transform: translateY(100%);
      opacity: 0;
      height: 0;
    }

    // Main content expands
    .app__main--expanded {
      padding-top: 20px;
      padding-bottom: 20px;
      min-height: 100vh;
    }

    // Game-specific expansions
    .fruit-merge-game__content {
      min-height: calc(100vh - 40px);
    }

    // Profile/Trophy page expansion
    .app__placeholder-content {
      min-height: calc(100vh - 40px);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
}
// Smooth transitions for all UI elements
.app__header,
.bottom-navigation,
.app__main {
  transition: all 0.4s ease;
}

</style>