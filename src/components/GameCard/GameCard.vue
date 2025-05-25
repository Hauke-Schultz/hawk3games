<script setup>
// Define props for game data
const props = defineProps({
  game: {
    type: Object,
    required: true,
    validator: (game) => {
      return game.name && game.playerCount && game.icon
    }
  }
})

// Format player count for display
const formatPlayerCount = (count) => {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k+ Spieler`
  }
  return `${count}+ Spieler`
}
</script>

<template>
  <div class="game-card" role="button" tabindex="0" @click="$emit('game-selected', game)" @keydown.enter="$emit('game-selected', game)">
    <div class="game-icon">
      <div class="icon-container" :style="{ backgroundColor: game.iconBg }">
        <span class="icon-emoji" v-if="game.iconType === 'emoji'">{{ game.icon }}</span>
        <img v-else-if="game.iconType === 'image'" :src="game.icon" :alt="game.name" class="icon-image" />
      </div>
    </div>

    <div class="game-info">
      <h3 class="game-title">{{ game.name }}</h3>
      <p class="game-players">{{ game.text }}</p>
    </div>

    <div class="game-arrow">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-card {
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  min-height: 72px;

  &:hover {
    background-color: var(--grey-color);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: var(--focus-outline);
    outline-offset: 0.125rem;
    box-shadow: var(--focus-shadow);
  }

  &:active {
    transform: translateY(0);
  }
}

.game-icon {
  margin-right: var(--space-4);
  flex-shrink: 0;

  .icon-container {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .icon-emoji {
    font-size: 24px;
    line-height: 1;
  }

  .icon-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--border-radius-lg);
  }
}

.game-info {
  flex: 1;
  min-width: 0;

  .game-title {
    margin: 0 0 var(--space-1) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.2;
  }

  .game-players {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.2;
  }
}

.game-arrow {
  margin-left: var(--space-2);
  color: var(--text-secondary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-theme="dark"] .game-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>