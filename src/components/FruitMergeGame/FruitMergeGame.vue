<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch.vue"

// Game state
const gameContainer = ref(null)
const gameRunning = ref(false)
const showLevelSelection = ref(true) // Show level selection by default

// Game stats (placeholder values)
const currentLevel = ref(1)
const coins = ref(1251)
const diamonds = ref(251)

// Level configuration - 9 levels total
const levels = ref([
  { id: 1, unlocked: true, completed: false, stars: 0, name: "Getting Started", description: "Learn the basics" },
  { id: 2, unlocked: false, completed: false, stars: 0, name: "Apple Merge", description: "Combine red apples" },
  { id: 3, unlocked: false, completed: false, stars: 0, name: "Citrus Rush", description: "Orange challenge" },
  { id: 4, unlocked: false, completed: false, stars: 0, name: "Berry Blast", description: "Purple berry fun" },
  { id: 5, unlocked: false, completed: false, stars: 0, name: "Tropical Mix", description: "Exotic fruits" },
  { id: 6, unlocked: false, completed: false, stars: 0, name: "Melon Madness", description: "Big fruit merge" },
  { id: 7, unlocked: false, completed: false, stars: 0, name: "Fruit Salad", description: "Mix everything" },
  { id: 8, unlocked: false, completed: false, stars: 0, name: "Super Combo", description: "Advanced merging" },
  { id: 9, unlocked: false, completed: false, stars: 0, name: "Master Level", description: "Ultimate challenge" }
])

// Fruit emojis for levels
const fruitEmojis = ['🍎', '🍊', '🍇', '🍓', '🥝', '🍉', '🥭', '🍌', '🏆']

// Level selection functions
const selectLevel = (level) => {
  if (level.unlocked) {
    currentLevel.value = level.id
    showLevelSelection.value = false
    startGame()
  }
}

const showLevelSelect = () => {
  showLevelSelection.value = true
  gameRunning.value = false
}

// Convert level data to game card format
const getLevelAsGameCard = (level) => {
  return {
    id: level.id,
    name: level.name,
    text: level.description,
    icon: fruitEmojis[level.id - 1],
    iconType: 'emoji',
    iconBg: level.unlocked
        ? (level.id === 1 ? '#e84393' : '#00b894')
        : 'var(--grey-color)',
    unlocked: level.unlocked,
    completed: level.completed,
    stars: level.stars
  }
}

// Game functions
const startGame = () => {
  gameRunning.value = true
  console.log(`FruitMerge game started on level ${currentLevel.value}!`)
}

const pauseGame = () => {
  gameRunning.value = false
  console.log('FruitMerge game paused!')
}

const resetGame = () => {
  gameRunning.value = false
  console.log('FruitMerge game reset!')
}

// Lifecycle
onMounted(() => {
  console.log('FruitMerge game component mounted')
})

onUnmounted(() => {
  gameRunning.value = false
})

// Emit events to parent component
const emit = defineEmits(['back-to-menu'])

const handleBackClick = () => {
  if (showLevelSelection.value) {
    emit('back-to-menu')
  } else {
    showLevelSelect()
  }
}

// Handle level card selection
const handleLevelCardSelected = (levelCard) => {
  const level = levels.value.find(l => l.id === levelCard.id)
  if (level) {
    selectLevel(level)
  }
}

// Format numbers for display
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${Math.floor(num / 100) / 10}k`
  }
  return num.toString()
}

// Computed properties
const currentLevelPadded = computed(() => {
  return currentLevel.value.toString().padStart(2, '0')
})
</script>

<template>
  <div class="fruit-merge-game">
    <!-- Game Header -->
    <header class="app__header" role="banner">
      <div class="app__header-content">
        <button
          class="btn btn--circle"
          @click="handleBackClick"
          :aria-label="showLevelSelection ? 'Back to menu' : 'Back to level selection'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 class="app__title">FruitMerge</h1>
        <div class="app__theme-switch">
          <ThemeSwitch />
        </div>
      </div>
    </header>

    <!-- Game Stats Header (only show when playing) -->
    <div v-if="!showLevelSelection" class="fruit-merge-game__stats">
      <!-- Level Display -->
      <div class="fruit-merge-game__level-display">
        <span class="fruit-merge-game__level-text">LEVEL {{ currentLevelPadded }}</span>
      </div>

      <!-- Stats Display -->
      <div class="fruit-merge-game__stats-container">
        <div class="fruit-merge-game__stat fruit-merge-game__stat--coins">
          <span class="fruit-merge-game__stat-value">{{ formatNumber(coins) }}</span>
          <svg class="fruit-merge-game__stat-icon" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.8643 1.58644L8.54707 1.1212L8.41312 1.78468C6.25302 2.55799 4.39922 4.86186 3.80003 7.84349C3.20085 10.8251 4.02417 13.663 5.71635 15.2132L5.5833 15.8775L7.90502 16.3428C10.9876 16.9625 14.1505 14.1604 14.9693 10.0857C15.7882 6.01111 13.9469 2.20527 10.8643 1.58644Z" fill="#E86124"/>
            <path d="M8.33811 14.1666L6.02085 13.6969L6.1539 13.0334C4.67157 11.6752 3.85718 9.33028 4.07953 6.76567C3.96605 7.11937 3.87273 7.47922 3.80003 7.84349C3.20085 10.826 4.02417 13.663 5.71635 15.2132L5.5833 15.8775L7.90502 16.3428C10.9876 16.9625 14.1505 14.1604 14.9693 10.0857C15.0404 9.72268 15.0917 9.35602 15.1229 8.98738C14.0094 12.461 11.1411 14.7256 8.33811 14.1666Z" fill="#DC4A26"/>
            <path d="M12.6465 9.62148C13.4652 5.54644 11.6297 1.74086 8.54686 1.12148C5.46399 0.502101 2.30112 3.30347 1.48241 7.37852C0.663698 11.4536 2.49916 15.2591 5.58204 15.8785C8.66491 16.4979 11.8278 13.6965 12.6465 9.62148Z" fill="#F0E92D"/>
            <path d="M11.1039 9.31156C11.6964 6.36262 10.3682 3.60868 8.13724 3.16047C5.90631 2.71225 3.6175 4.73949 3.02503 7.68844C2.43256 10.6374 3.76079 13.3913 5.99172 13.8395C8.22265 14.2877 10.5115 12.2605 11.1039 9.31156Z" fill="#EF8521"/>
            <path d="M7.00759 12.4128C4.7573 11.961 3.19907 9.88035 3.07851 7.44433C3.05946 7.5247 3.0416 7.60596 3.02494 7.68811C2.4329 10.6349 3.76164 13.3906 5.99228 13.8389C7.42818 14.1273 8.88729 13.3924 9.90349 12.0413C9.00385 12.4754 7.98765 12.6057 7.00759 12.4128Z" fill="#E86124"/>
          </svg>
        </div>
        <div class="fruit-merge-game__stat fruit-merge-game__stat--diamonds">
          <span class="fruit-merge-game__stat-value">{{ formatNumber(diamonds) }}</span>
          <svg class="fruit-merge-game__stat-icon" width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.6514 0.5L13.8008 0.69043L17.3926 5.24609L17.626 5.54102L17.4062 5.84668L9.90625 16.292L9.50098 16.8574L9.09473 16.292L1.59375 5.84668L1.37402 5.54102L1.60742 5.24609L5.19922 0.69043L5.34961 0.5H13.6514Z" fill="#ED6FF7" stroke="white"/>
            <path d="M13.4084 1H9.5005H5.59162L2 5.55537L9.5005 16L17 5.55537L13.4084 1Z" fill="#ED6FF7"/>
            <path d="M9.50043 5.43665H5.75018L9.50043 16L13.2497 5.43665H9.50043Z" fill="#E249F2"/>
            <path d="M9.50043 1L5.75018 5.43665H13.2497L9.50043 1Z" fill="#FA6AFF"/>
            <path d="M2 5.55537H5.75025L9.5005 1H5.59162L2 5.55537Z" fill="#E249F2"/>
            <path d="M13.2497 5.43665H17L13.4084 1H9.50049L13.2497 5.43665Z" fill="#F989FF"/>
            <path d="M12.9684 6.25871C13.8663 6.25871 13.8663 4.86197 12.9684 4.86197C12.0705 4.86197 12.0705 6.25871 12.9684 6.25871Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Game Content -->
    <main class="app__main fruit-merge-game__content">
      <!-- Level Selection Screen -->
      <div v-if="showLevelSelection" class="fruit-merge-game__level-selection">
        <h2 class="app__section-title">Select a Level</h2>
        <div class="fruit-merge-game__levels-container">
          <div class="fruit-merge-game__levels-grid">
            <!-- Level Cards using GameCard pattern -->
            <div
                v-for="level in levels"
                :key="level.id"
                class="fruit-merge-game__level-card"
                :class="{
                  'fruit-merge-game__level-card--unlocked': level.unlocked,
                  'fruit-merge-game__level-card--locked': !level.unlocked,
                  'fruit-merge-game__level-card--completed': level.completed,
                  'fruit-merge-game__level-card--featured': level.id === 1
                }"
                role="button"
                tabindex="0"
                @click="selectLevel(level)"
                @keydown.enter="selectLevel(level)"
                :disabled="!level.unlocked"
                :aria-label="`Level ${level.id}: ${level.name}${level.unlocked ? '' : ' (locked)'}`"
            >
              <!-- Level Icon -->
              <div class="fruit-merge-game__level-icon">
                <div
                    class="fruit-merge-game__level-icon-container"
                    :style="{ backgroundColor: getLevelAsGameCard(level).iconBg }"
                >
                  <!-- Lock icon for locked levels -->
                  <svg
                      v-if="!level.unlocked"
                      class="fruit-merge-game__level-lock"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>

                  <!-- Fruit emoji for unlocked levels -->
                  <span
                      v-else
                      class="fruit-merge-game__level-emoji"
                  >
                    {{ fruitEmojis[level.id - 1] }}
                  </span>
                </div>
              </div>

              <!-- Level Content -->
              <div class="fruit-merge-game__level-content">
                <h3 class="fruit-merge-game__level-name">{{ level.name }}</h3>
                <p
                    v-if="level.unlocked"
                    class="fruit-merge-game__level-description"
                >
                  {{ level.description }}
                </p>
              </div>

              <!-- Level Action -->
              <div class="fruit-merge-game__level-action">
                <!-- Stars for completed levels -->
                <div
                    v-if="level.completed"
                    class="fruit-merge-game__level-stars"
                >
                  <span
                      v-for="star in 3"
                      :key="star"
                      class="fruit-merge-game__level-star"
                      :class="{ 'fruit-merge-game__level-star--filled': star <= level.stars }"
                  >
                    ⭐
                  </span>
                </div>

                <!-- Play button for level 1 -->
                <div
                    v-else-if="level.id === 1 && level.unlocked"
                    class="fruit-merge-game__play-badge"
                >
                  PLAY
                </div>

                <!-- Arrow for other unlocked levels -->
                <svg
                    v-else-if="level.unlocked"
                    class="fruit-merge-game__level-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Play Area -->
      <div v-else class="fruit-merge-game__play-area">
        <div class="fruit-merge-game__game-placeholder">
          <p class="fruit-merge-game__placeholder-text">
            Game Level {{ currentLevel }} will be implemented here
          </p>
          <button
            class="btn"
            @click="showLevelSelect"
          >
            Back to Level Selection
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Fruit Merge Game Block
.fruit-merge-game {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);

  // Stats Element
  &__stats {
    background-color: var(--card-bg);
    padding: var(--space-3) var(--space-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--card-border);
  }

  &__level-display {
    flex: 1;
    display: flex;
    justify-content: flex-start;
  }

  &__level-text {
    background-color: var(--accent-color);
    color: var(--white);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  &__stats-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__stat {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-color);
  }

  &__stat-value {
    font-size: var(--font-size-base);
  }

  &__stat-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  // Content Element
  &__content {
    flex: 1;
    overflow-y: auto;
  }

  // Level Selection Element
  &__level-selection {
    display: flex;
    flex-direction: column;
    min-height: 60vh;
  }

  &__levels-container {
    background: var(--card-bg);
    border-radius: var(--border-radius-2xl);
    padding: var(--space-6);
    box-shadow: var(--card-shadow);
    max-width: 100%;
    width: 100%;

    @media (min-width: vars.$breakpoint-md) {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-8);
    }
  }

  &__levels-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3);

    @media (min-width: vars.$breakpoint-sm) {
      gap: var(--space-4);
    }
  }

  // Level Card Element (extends card pattern)
  &__level-card {
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--card-border);
    padding: var(--space-4);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    min-height: 72px;
    position: relative;

    &:hover {
      background-color: var(--card-bg-hover);
      box-shadow: var(--card-shadow-hover);
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: 0.125rem;
      box-shadow: var(--focus-shadow);
    }

    &:active {
      transform: translateY(0.0625rem);
    }

    // Level Card Modifiers
    &--unlocked {
      &:hover {
        transform: translateY(-2px);
      }
    }

    &--locked {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--level-locked);

      &:hover {
        transform: none;
        background-color: var(--level-locked);
        box-shadow: var(--card-shadow);
      }
    }

    &--completed {
      background: var(--level-completed);
      color: var(--white);

      .fruit-merge-game__level-name,
      .fruit-merge-game__level-description {
        color: var(--white);
      }

      &:hover {
        box-shadow: var(--level-completed-hover);
      }
    }

    &--featured {
      background: var(--level-featured);
      color: var(--white);

      .fruit-merge-game__level-name,
      .fruit-merge-game__level-description {
        color: var(--white);
      }

      &:hover {
        box-shadow: var(--level-featured-hover);
      }
    }
  }

  // Level Icon Element
  &__level-icon {
    margin-right: var(--space-4);
    flex-shrink: 0;
  }

  &__level-icon-container {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  &__level-lock {
    opacity: 0.6;
    color: var(--text-muted);
  }

  &__level-emoji {
    font-size: 24px;
    line-height: 1;
    user-select: none;
  }

  // Level Content Element
  &__level-content {
    flex: 1;
    min-width: 0;
  }

  &__level-name {
    margin: 0 0 var(--space-1) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.2;
  }

  &__level-description {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.2;
  }

  // Level Action Element
  &__level-action {
    margin-left: var(--space-2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__level-stars {
    display: flex;
    gap: 2px;
  }

  &__level-star {
    font-size: 12px;
    opacity: 0.3;

    &--filled {
      opacity: 1;
    }
  }

  &__play-badge {
    background: var(--accent-color);
    color: var(--white);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-xs);
    font-weight: bold;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 184, 148, 0.4);
  }

  &__level-arrow {
    color: var(--text-secondary);
    transition: transform 0.2s ease;

    .fruit-merge-game__level-card:hover & {
      transform: translateX(2px);
    }
  }

  // Play Area Element
  &__play-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  &__game-placeholder {
    text-align: center;
    background-color: var(--card-bg);
    padding: var(--space-8);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--card-shadow);
    max-width: 400px;
    width: 100%;
  }

  &__placeholder-text {
    margin-bottom: var(--space-4);
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }
}
</style>