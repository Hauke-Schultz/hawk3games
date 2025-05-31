<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import BurgerMenu from './components/BurgerMenu/BurgerMenu.vue'
import NavigationOverlay from './components/NavigationOverlay/NavigationOverlay.vue'
import GameCard from './components/GameCard/GameCard.vue'
import FruitMergeGame from './components/FruitMergeGame/FruitMergeGame.vue'
import SettingsPanel from './components/SettingsPanel/SettingsPanel.vue'

// Global application state
const activeTab = ref('home')
const currentView = ref('home')
const isNavOpen = ref(false)

// Game state for navigation context
const currentGame = ref(null)
const showLevelSelection = ref(true) // NEW: Track level selection state

// Games data
const games = ref([
  {
    id: 1,
    name: 'FruitMerge',
    text: 'Merge colorful fruits to create bigger ones and score points!',
    icon: '🍎',
    iconType: 'emoji',
    iconBg: '#ff6b6b'
  }
])

// Global navigation functions
const toggleNavigation = () => {
  isNavOpen.value = !isNavOpen.value
}

const closeNavigation = () => {
  isNavOpen.value = false
}

const handleTabChanged = (tabId) => {
  activeTab.value = tabId

  // Navigate based on tab
  if (tabId === 'home') {
    currentView.value = 'home'
    currentGame.value = null
    showLevelSelection.value = true
  } else {
    currentView.value = tabId
  }

  closeNavigation()
  console.log('Global tab changed to:', tabId)
}

// Game-specific navigation functions - NOW GLOBAL
const handleGameSelected = (game) => {
  console.log('Game selected:', game.name)
  if (game.name === 'FruitMerge') {
    currentView.value = 'fruitmerge'
    currentGame.value = game
    showLevelSelection.value = true // Start with level selection
    activeTab.value = 'game' // NEW: Set active context
  }
}

const handleLevelSelected = () => {
  // When a level is selected in FruitMerge
  showLevelSelection.value = false
  closeNavigation()
}

const handleBackToMenu = () => {
  currentView.value = 'home'
  activeTab.value = 'home'
  currentGame.value = null
  showLevelSelection.value = true
  closeNavigation()
}

const handleBackToLevelSelection = () => {
  // From game back to level selection
  showLevelSelection.value = true
  closeNavigation()
}

const handleBackNavigation = () => {
  if (currentView.value === 'fruitmerge') {
    if (!showLevelSelection.value) {
      // In game -> back to level selection
      handleBackToLevelSelection()
    } else {
      // In level selection -> back to home
      handleBackToMenu()
    }
  } else {
    // Other views -> back to home
    handleBackToMenu()
  }
}

// Computed properties for navigation context
const showBackButton = computed(() => {
  return currentView.value === 'fruitmerge' ||
    (currentView.value !== 'home' && activeTab.value !== 'home')
})

const getBackButtonLabel = computed(() => {
  if (currentView.value === 'fruitmerge') {
    return showLevelSelection.value ? 'Back to Home' : 'Back to Levels'
  }
  return 'Back to Home'
})

const getPageTitle = computed(() => {
  switch (currentView.value) {
    case 'fruitmerge':
      return showLevelSelection.value ? 'FruitMerge - Levels' : 'FruitMerge - Game'
    case 'settings':
      return 'Settings'
    case 'profile':
      return 'Profile'
    case 'trophy':
      return 'Trophies'
    default:
      return 'Hawk3Games'
  }
})

// Global keyboard handling
const handleGlobalKeydown = (event) => {
  if (event.key === 'Escape' && isNavOpen.value) {
    closeNavigation()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="app">
    <div class="app__container" role="application">

      <!-- Global Navigation Overlay -->
      <NavigationOverlay
        :is-open="isNavOpen"
        :active-tab="activeTab"
        :show-back-button="showBackButton"
        :back-button-label="getBackButtonLabel"
        @tab-select="handleTabChanged"
        @close="closeNavigation"
        @back="handleBackNavigation"
      />

      <!-- Global Header - NOW ON ALL PAGES -->
      <header
        class="app__header"
        role="banner"
      >
        <div class="app__header-content">
          <BurgerMenu
            :is-open="isNavOpen"
            @toggle="toggleNavigation"
          />
          <h1 class="app__title">{{ getPageTitle }}</h1>
        </div>
      </header>

      <!-- Main Content Area -->
      <main
        id="main-content"
        class="app__main"
      >
        <!-- FruitMerge Game - SIMPLIFIED -->
        <FruitMergeGame
          v-if="currentView === 'fruitmerge'"
          :show-level-selection="showLevelSelection"
          @level-selected="handleLevelSelected"
          @back-to-menu="handleBackToMenu"
          @back-to-levels="handleBackToLevelSelection"
        />

        <!-- Home Section -->
        <section class="app__section" v-else-if="activeTab === 'home'">
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

        <!-- Settings Section -->
        <section class="app__section" v-else-if="activeTab === 'settings'">
          <h2 class="app__section-title">Settings</h2>
          <SettingsPanel />
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
    align-items: center;
    padding: var(--space-4);
    max-width: 100%;
    gap: var(--space-4);

    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-4) var(--space-8);
    }
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
    text-align: left;
    color: var(--text-color);

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
    overflow-y: auto;
    min-height: calc(100vh - 80px); // Account for header

    // Larger padding on desktop
    @media (min-width: vars.$breakpoint-md) {
      padding: var(--space-8);
      min-height: calc(100vh - 88px);
    }

    // Remove focus outline for main content
    &:focus {
      outline: none;
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