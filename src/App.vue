<script setup>
import {onMounted, ref, watch} from 'vue'
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch.vue'
import GameCard from './components/GameCard/GameCard.vue'
import BottomNavigation from './components/BottomNavigation/BottomNavigation.vue'
import FruitMergeGame from './components/FruitMergeGame/FruitMergeGame.vue'

const activeTab = ref('home') // Track active navigation tab
const currentView = ref('home') // Track current view/page

// Games data matching the mobile design
const games = ref([
  {
    id: 1,
    name: 'FruitMerge',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: '🍎',
    iconType: 'emoji',
    iconBg: '#ff6b6b'
  },
])

const handleGameSelected = (game) => {
  console.log('Game selected:', game.name)
  if (game.name === 'FruitMerge') {
    currentView.value = 'fruitmerge'
  }
  // TODO: Add navigation for other games
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

</script>

<template>
  <div class="app-wrapper">
    <div class="app-container" :class="theme" role="application">

      <!-- Show FruitMerge Game -->
      <FruitMergeGame
          v-if="currentView === 'fruitmerge'"
          @back-to-menu="handleBackToMenu"
      />

      <!-- Show Main App with Navigation -->
      <template v-else>
        <header role="banner">
          <div class="header-content">
            <div class="logo">
              <span class="smiley">😊</span>
            </div>
            <h1>Hawk3Games</h1>
            <div class="theme-switch-container">
              <ThemeSwitch />
            </div>
          </div>
        </header>
        <main id="main-content" class="main-content">
          <section class="games-section" v-if="activeTab === 'home'">
            <h2>Games</h2>
            <div class="games-list">
              <GameCard
                  v-for="game in games"
                  :key="game.id"
                  :game="game"
                  @game-selected="handleGameSelected"
              />
            </div>
          </section>

          <section class="profile-section" v-else-if="activeTab === 'profile'">
            <h2>Profile</h2>
            <div class="profile-content">
              <p>Your profile information will be displayed here.</p>
            </div>
          </section>

          <section class="trophy-section" v-else-if="activeTab === 'trophy'">
            <h2>Trophy</h2>
            <div class="trophy-content">
              <p>Your achievements and trophies will be displayed here.</p>
            </div>
          </section>
        </main>
      </template>

      <BottomNavigation
          :active-tab="activeTab"
          @tab-changed="handleTabChanged"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use './assets/variables.scss' as vars;

.app-container {
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-color);
  position: relative;
}

.app-wrapper {
  min-height: 100vh;
  background-color: var(--bg-color);

  @media (min-width: vars.$breakpoint-md) {
    display: flex;
    justify-content: center;
    background-color: var(--grey-color); // Container-Hintergrund für Desktop
  }

  .app-container {
    width: 100%;
    max-width: 480px;
    background-color: var(--bg-color);

    @media (min-width: vars.$breakpoint-md) {
      border-left: 1px solid var(--grey-color);
      border-right: 1px solid var(--grey-color);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
  }

  .bottom-navigation {
    max-width: 480px;
    margin: 0 auto;
  }
}

header {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--grey-color);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    max-width: 100%;
  }

  @media (min-width: vars.$breakpoint-md) {
    .header-content {
      padding: var(--space-4) var(--space-8);
    }
  }
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-md);
  background-color: transparent;

  .smiley {
    font-size: 24px;
    line-height: 1;
    user-select: none;
  }
}

.back-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--grey-color);
  }

  &:focus-visible {
    outline: var(--focus-outline);
    outline-offset: 0.125rem;
  }
}

h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: bold;
  flex: 1;
  text-align: center;

  @media (min-width: vars.$breakpoint-md) {
    font-size: var(--font-size-2xl);
  }
}

h2 {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-2xl);
  font-weight: bold;
  color: var(--text-color);

  @media (min-width: vars.$breakpoint-md) {
    font-size: var(--font-size-3xl);
  }
}

.theme-switch-container {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: var(--space-4);
  /* Add bottom padding to account for fixed navigation */
  padding-bottom: calc(var(--space-4) + 80px + env(safe-area-inset-bottom));
  overflow-y: auto;

  @media (min-width: vars.$breakpoint-md) {
    padding: var(--space-8);
    padding-bottom: calc(var(--space-8) + 80px + env(safe-area-inset-bottom));
  }

  &:focus {
    outline: none;
  }
}

.games-section {
  .games-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);

    @media (min-width: vars.$breakpoint-md) {
      gap: var(--space-4);
    }
  }
}

.profile-section,
.trophy-section {
  .profile-content,
  .trophy-content {
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    padding: var(--space-6);
    text-align: center;

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }
}
</style>