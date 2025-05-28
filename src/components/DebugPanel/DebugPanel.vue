<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props for debug configuration
const props = defineProps({
  isDev: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    validator: (value) => ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(value)
  },
  stores: {
    type: Object,
    default: () => ({})
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  isGameActive: {
    type: Boolean,
    default: false
  },
  currentSession: {
    type: Object,
    default: () => ({})
  },
  isGamePaused: {
    type: Boolean,
    default: false
  },
  formatNumber: {
    type: Function,
    default: (num) => num.toString()
  }
})

// Events emitted to parent component
const emit = defineEmits([
  'unlock-all-levels',
  'add-currency',
  'complete-current-level',
  'reset-progress',
  'export-data',
  'import-data',
  'toggle-auto-simulation',
  'debug-add-test-objects',
  'debug-clear-objects',
  'debug-physics-info',
  'pause-game',
  'resume-game'
])

// Local state
const isExpanded = ref(false)
const showAdvancedTools = ref(false)
const showPhysicsDebug = ref(false)
const showSessionInfo = ref(true)
const customCoinAmount = ref(1000)
const customDiamondAmount = ref(100)
const autoSimulation = ref(false)
const showFPS = ref(false)

// Computed visibility
const shouldShow = computed(() => {
  return props.isDev && props.visible
})

// Physics monitoring
const physicsStats = ref({
  totalBodies: 0,
  staticBodies: 0,
  dynamicBodies: 0,
  performanceRunning: false
})

// Session stats formatting
const formattedScore = computed(() => {
  return props.formatNumber(props.currentSession?.score || 0)
})

const showCombo = computed(() => {
  return (props.currentSession?.combo || 0) > 1
})

const sessionStats = computed(() => {
  if (!props.currentSession) return []

  return [
    {
      icon: '🎯',
      label: 'moves',
      value: props.currentSession.moves || 0
    },
    {
      icon: '📊',
      label: 'points',
      value: formattedScore.value
    }
  ]
})

const positionClasses = computed(() => {
  return {
    'debug-panel--bottom-right': props.position === 'bottom-right',
    'debug-panel--bottom-left': props.position === 'bottom-left',
    'debug-panel--top-right': props.position === 'top-right',
    'debug-panel--top-left': props.position === 'top-left'
  }
})

// Debug action handlers
const handleUnlockAllLevels = () => {
  console.log('🔓 Debug: Unlock all levels')
  emit('unlock-all-levels')
}

const handleAddCurrency = () => {
  console.log(`💰 Debug: Add ${customCoinAmount.value} coins, ${customDiamondAmount.value} diamonds`)
  emit('add-currency', {
    coins: customCoinAmount.value,
    diamonds: customDiamondAmount.value
  })
}

const handleCompleteCurrentLevel = () => {
  if (props.isGameActive) {
    console.log('🏁 Debug: Complete current level')
    emit('complete-current-level')
  } else {
    console.warn('No active game to complete')
  }
}

const handleResetProgress = () => {
  if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
    console.log('🔄 Debug: Reset all progress')
    emit('reset-progress')
  }
}

const handleExportData = () => {
  console.log('📤 Debug: Export game data')
  emit('export-data')
}

const handleImportData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          console.log('📥 Debug: Import game data')
          emit('import-data', data)
        } catch (error) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const handleToggleAutoSimulation = () => {
  autoSimulation.value = !autoSimulation.value
  console.log(`🤖 Debug: Auto simulation ${autoSimulation.value ? 'enabled' : 'disabled'}`)
  emit('toggle-auto-simulation', autoSimulation.value)
}

const handleToggleFPS = () => {
  showFPS.value = !showFPS.value
  console.log(`📊 Debug: FPS display ${showFPS.value ? 'enabled' : 'disabled'}`)
}
const handleDebugAddTestObjects = () => {
  console.log('🧪 Debug: Add test physics objects')
  emit('debug-add-test-objects')
}

const handleDebugClearObjects = () => {
  console.log('🧹 Debug: Clear physics objects')
  emit('debug-clear-objects')
}

const handleDebugPhysicsInfo = () => {
  console.log('📊 Debug: Show physics info')
  emit('debug-physics-info')
  updatePhysicsStats()
}

// NEU: Session control handlers
const handlePauseGame = () => {
  console.log('⏸️ Debug: Pause game')
  emit('pause-game')
}

const handleResumeGame = () => {
  console.log('▶️ Debug: Resume game')
  emit('resume-game')
}

const updatePhysicsStats = () => {
  if (props.physicsWorld) {
    try {
      const bodies = props.physicsWorld.bodies || []
      physicsStats.value = {
        totalBodies: bodies.length,
        staticBodies: bodies.filter(b => b.isStatic).length,
        dynamicBodies: bodies.filter(b => !b.isStatic).length,
        performanceRunning: !!props.physicsRunner
      }
    } catch (error) {
      console.warn('Could not update physics stats:', error)
    }
  }
}

// Store statistics display
const getStoreInfo = () => {
  if (!props.stores.levelStore) return null

  try {
    return {
      levels: props.stores.levelStore.getLevelStatistics(),
      currency: props.stores.currencyStore.getCurrencyStatistics(),
      sessions: props.stores.sessionStore.getSessionStatistics()
    }
  } catch (error) {
    console.warn('Could not get store statistics:', error)
    return null
  }
}

const handleKeydown = (event) => {
  if (!shouldShow.value) return

  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    return
  }

  switch (event.key.toLowerCase()) {
    case 'u':
      if (event.ctrlKey && !event.shiftKey) {
        event.preventDefault()
        handleUnlockAllLevels()
      }
      break
    case 'c':
      if (event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        handleAddCurrency()
      }
      break
    case 'l':
      if (event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        handleCompleteCurrentLevel()
      }
      break
    case 'd':
      if (event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        isExpanded.value = !isExpanded.value
      }
      break
    case 'f':
      if (event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        handleToggleFPS()
      }
      break
    case 's':
      if (event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        handleToggleAutoSimulation()
      }
      break
    case 'p':
      if (event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        showPhysicsDebug.value = !showPhysicsDebug.value
      }
      break
    case 'space':
      if (event.ctrlKey) {
        event.preventDefault()
        if (props.isGamePaused) {
          handleResumeGame()
        } else if (props.isGameActive) {
          handlePauseGame()
        }
      }
      break
  }
}

watch([() => props.physicsWorld, () => props.physicsEngine], () => {
  if (showPhysicsDebug.value) {
    updatePhysicsStats()
  }
}, { deep: true })
onMounted(() => {
  if (shouldShow.value) {
    document.addEventListener('keydown', handleKeydown, { passive: false })
    console.log('🛠️ Debug Panel mounted. Enhanced keyboard shortcuts:')
    console.log('  Ctrl+U: Unlock all levels')
    console.log('  Ctrl+Shift+C: Add currency')
    console.log('  Ctrl+Shift+L: Complete level')
    console.log('  Ctrl+Shift+D: Toggle debug panel')
    console.log('  Ctrl+Shift+F: Toggle FPS display')
    console.log('  Ctrl+Shift+S: Toggle auto simulation')
    console.log('  Ctrl+Shift+P: Toggle physics debug')
    console.log('  Ctrl+Space: Pause/Resume game')
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${Math.floor(num / 100000) / 10}M`
  }
  if (num >= 1000) {
    return `${Math.floor(num / 100) / 10}k`
  }
  return num.toString()
}
</script>

<template>
  <div
    v-if="shouldShow"
    class="debug-panel"
    :class="positionClasses"
  >
    <!-- Debug Panel Toggle Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="debug-panel__toggle"
      :class="{ 'debug-panel__toggle--expanded': isExpanded }"
      title="Toggle Debug Panel (Ctrl+Shift+D)"
    >
      🛠️
    </button>

    <!-- Debug Panel Content -->
    <div
      v-if="isExpanded"
      class="debug-panel__content"
    >
      <!-- Header -->
      <div class="debug-panel__header">
        <h3 class="debug-panel__title">Debug Console</h3>
        <div class="debug-panel__header-controls">
          <button
            @click="showAdvancedTools = !showAdvancedTools"
            class="debug-panel__toggle-btn"
            :class="{ 'active': showAdvancedTools }"
          >
            {{ showAdvancedTools ? '🔽' : '▶️' }} Advanced
          </button>
          <button
            @click="showSessionInfo = !showSessionInfo"
            class="debug-panel__toggle-btn"
            :class="{ 'active': showSessionInfo }"
          >
            {{ showSessionInfo ? '🔽' : '▶️' }} Session
          </button>
          <button
            @click="showPhysicsDebug = !showPhysicsDebug"
            class="debug-panel__toggle-btn"
            :class="{ 'active': showPhysicsDebug }"
          >
            {{ showPhysicsDebug ? '🔽' : '▶️' }} Physics
          </button>
        </div>
      </div>

      <!-- NEU: Session Info Section -->
      <div v-if="showSessionInfo" class="debug-panel__section">
        <h4 class="debug-panel__section-title">Live Session Info</h4>

        <!-- Session Statistics -->
        <div class="debug-panel__session-stats">
          <span
            v-for="stat in sessionStats"
            :key="stat.label"
            class="debug-panel__session-stat"
          >
            {{ stat.icon }} {{ stat.value }} {{ stat.label }}
          </span>

          <!-- Combo Display -->
          <span
            v-if="showCombo"
            class="debug-panel__session-stat debug-panel__session-stat--combo"
          >
            🔥 {{ currentSession.combo }}x combo
          </span>
        </div>

        <!-- Session Controls -->
        <div class="debug-panel__session-controls">
          <!-- Pause Button -->
          <button
            v-if="isGameActive && !isGamePaused"
            @click="handlePauseGame"
            class="debug-panel__button debug-panel__button--warning"
          >
            ⏸️ Pause
          </button>

          <!-- Resume Button -->
          <button
            v-else-if="isGamePaused"
            @click="handleResumeGame"
            class="debug-panel__button debug-panel__button--success"
          >
            ▶️ Resume
          </button>

          <!-- Status when game not active -->
          <span
            v-else-if="!isGameActive"
            class="debug-panel__session-status"
          >
            Game Ready
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="debug-panel__section">
        <h4 class="debug-panel__section-title">Quick Actions</h4>
        <div class="debug-panel__buttons">
          <button
            @click="handleUnlockAllLevels"
            class="debug-panel__button"
            title="Ctrl+U"
          >
            🔓 Unlock All
          </button>
          <button
            @click="handleCompleteCurrentLevel"
            class="debug-panel__button"
            :disabled="!isGameActive"
            title="Ctrl+Shift+L"
          >
            🏁 Complete Level
          </button>
        </div>
      </div>

      <!-- Currency Tools -->
      <div class="debug-panel__section">
        <h4 class="debug-panel__section-title">Currency</h4>
        <div class="debug-panel__currency-controls">
          <div class="debug-panel__input-group">
            <label>Coins:</label>
            <input
              v-model.number="customCoinAmount"
              type="number"
              min="0"
              max="999999"
              class="debug-panel__input"
            >
          </div>
          <div class="debug-panel__input-group">
            <label>Diamonds:</label>
            <input
              v-model.number="customDiamondAmount"
              type="number"
              min="0"
              max="99999"
              class="debug-panel__input"
            >
          </div>
          <button
            @click="handleAddCurrency"
            class="debug-panel__button debug-panel__button--primary"
            title="Ctrl+Shift+C"
          >
            💰 Add Currency
          </button>
        </div>
      </div>

      <!-- Game State -->
      <div class="debug-panel__section">
        <h4 class="debug-panel__section-title">Game State</h4>
        <div class="debug-panel__status">
          <div class="debug-panel__status-item">
            Level: {{ currentLevel }}
          </div>
          <div class="debug-panel__status-item">
            Game: {{ isGameActive ? '🟢 Active' : (isGamePaused ? '🟡 Paused' : '🔴 Inactive') }}
          </div>
          <div class="debug-panel__status-item">
            <label>
              <input
                type="checkbox"
                v-model="autoSimulation"
                @change="handleToggleAutoSimulation"
              >
              Auto Simulation
            </label>
          </div>
          <div class="debug-panel__status-item">
            <label>
              <input
                type="checkbox"
                v-model="showFPS"
                @change="handleToggleFPS"
              >
              Show FPS
            </label>
          </div>
        </div>
      </div>

      <!-- Physics Debug Section -->
      <div v-if="showPhysicsDebug" class="debug-panel__section">
        <h4 class="debug-panel__section-title">Physics Debug</h4>

        <!-- Physics Status -->
        <div class="debug-panel__physics-status">
          <div class="debug-panel__status-item">
            Engine: {{ physicsEngine ? '✅' : '❌' }}
          </div>
          <div class="debug-panel__status-item">
            Render: {{ physicsRender ? '✅' : '❌' }}
          </div>
          <div class="debug-panel__status-item">
            Runner: {{ physicsRunner ? '✅' : '❌' }}
          </div>
          <div class="debug-panel__status-item">
            Can Drop: {{ canDrop ? '✅' : '❌' }}
          </div>
          <div class="debug-panel__status-item">
            Touch Pos: {{ dropPreviewPosition || 'None' }}
          </div>
        </div>

        <!-- Physics Statistics -->
        <div v-if="physicsWorld" class="debug-panel__physics-stats">
          <div class="debug-panel__status-item">
            Total Bodies: {{ physicsStats.totalBodies }}
          </div>
          <div class="debug-panel__status-item">
            Static: {{ physicsStats.staticBodies }}
          </div>
          <div class="debug-panel__status-item">
            Dynamic: {{ physicsStats.dynamicBodies }}
          </div>
          <div class="debug-panel__status-item">
            Performance: {{ physicsStats.performanceRunning ? '🟢' : '🔴' }}
          </div>
        </div>

        <!-- Physics Controls -->
        <div class="debug-panel__physics-controls">
          <button
            @click="handleDebugAddTestObjects"
            class="debug-panel__button"
          >
            🧪 Add Objects
          </button>
          <button
            @click="handleDebugClearObjects"
            class="debug-panel__button"
          >
            🧹 Clear Objects
          </button>
          <button
            @click="handleDebugPhysicsInfo"
            class="debug-panel__button"
          >
            📊 Physics Info
          </button>
        </div>
      </div>

      <!-- Advanced Tools -->
      <div v-if="showAdvancedTools" class="debug-panel__section">
        <h4 class="debug-panel__section-title">Advanced Tools</h4>
        <div class="debug-panel__buttons">
          <button
            @click="handleExportData"
            class="debug-panel__button"
          >
            📤 Export Data
          </button>
          <button
            @click="handleImportData"
            class="debug-panel__button"
          >
            📥 Import Data
          </button>
          <button
            @click="handleResetProgress"
            class="debug-panel__button debug-panel__button--danger"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      <!-- Store Statistics -->
      <div v-if="showAdvancedTools && getStoreInfo()" class="debug-panel__section">
        <h4 class="debug-panel__section-title">Store Statistics</h4>
        <div class="debug-panel__stats">
          <div class="debug-panel__stat">
            Levels: {{ getStoreInfo()?.levels?.completedCount || 0 }}/{{ getStoreInfo()?.levels?.totalLevels || 9 }}
          </div>
          <div class="debug-panel__stat">
            Stars: {{ getStoreInfo()?.levels?.totalStars || 0 }}
          </div>
          <div v-if="showFPS && getStoreInfo()" class="debug-panel__stat">
            FPS: {{ Math.round(averageFPS || 60) }}
          </div>
        </div>
      </div>

      <!-- Enhanced Keyboard Shortcuts Help -->
      <div v-if="showAdvancedTools" class="debug-panel__section">
        <h4 class="debug-panel__section-title">Keyboard Shortcuts</h4>
        <div class="debug-panel__shortcuts">
          <div>Ctrl+U: Unlock levels</div>
          <div>Ctrl+Shift+C: Add currency</div>
          <div>Ctrl+Shift+L: Complete level</div>
          <div>Ctrl+Shift+D: Toggle panel</div>
          <div>Ctrl+Shift+F: Toggle FPS</div>
          <div>Ctrl+Shift+S: Toggle simulation</div>
          <div>Ctrl+Shift+P: Toggle physics</div>
          <div>Ctrl+Space: Pause/Resume</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as vars;

// Debug Panel Block
.debug-panel {
  position: fixed;
  z-index: 9999;
  font-family: 'Courier New', monospace;
  font-size: 12px;

  // Position Modifiers
  &--bottom-right {
    bottom: 20px;
    right: 20px;
  }

  &--bottom-left {
    bottom: 20px;
    left: 20px;
  }

  &--top-right {
    top: 20px;
    right: 20px;
  }

  &--top-left {
    top: 20px;
    left: 20px;
  }

  // Toggle Button Element
  &__toggle {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }

    &--expanded {
      border-radius: 8px 8px 0 0;
      width: auto;
      padding: 8px 12px;
    }
  }

  // Content Element
  &__content {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px;
    padding: 16px;
    min-width: 320px;
    max-width: 400px;
    max-height: 85vh;
    overflow-y: auto;
    margin-top: -1px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  // Header Element
  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #00b894;
  }

  &__header-controls {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  &__toggle-btn {
    background: transparent;
    color: #74b9ff;
    border: 1px solid #74b9ff;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 9px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover, &.active {
      background: #74b9ff;
      color: white;
    }
  }

  // Section Element
  &__section {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
  }

  &__section-title {
    margin: 0 0 6px 0;
    font-size: 11px;
    font-weight: bold;
    color: #00b894;
    text-transform: uppercase;
  }

  // NEU: Session Info Elements
  &__session-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
  }

  &__session-stat {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 4px;

    &--combo {
      color: #00b894;
      font-weight: bold;
      animation: pulse-combo 0.5s ease-in-out;
    }
  }

  &__session-controls {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  &__session-status {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }

  // NEU: Physics Debug Elements
  &__physics-status,
  &__physics-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-bottom: 8px;
  }

  &__physics-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  // Buttons Element
  &__buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 0;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--primary {
      background: #00b894;
      border-color: #00b894;

      &:hover:not(:disabled) {
        background: #00a085;
      }
    }

    &--success {
      background: #00b894;
      border-color: #00b894;

      &:hover:not(:disabled) {
        background: #00cec9;
      }
    }

    &--warning {
      background: #fdcb6e;
      border-color: #fdcb6e;
      color: #2d3436;

      &:hover:not(:disabled) {
        background: #f39c12;
      }
    }

    &--danger {
      background: #e17055;
      border-color: #e17055;

      &:hover:not(:disabled) {
        background: #d63031;
      }
    }
  }

  // Currency Controls Element
  &__currency-controls {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__input-group {
    display: flex;
    align-items: center;
    gap: 6px;

    label {
      font-size: 10px;
      min-width: 60px;
    }
  }

  &__input {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 10px;
    width: 80px;

    &:focus {
      outline: none;
      border-color: #00b894;
      background: rgba(255, 255, 255, 0.15);
    }
  }

  // Status Element
  &__status {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__status-item {
    font-size: 10px;
    display: flex;
    align-items: center;
    gap: 4px;

    label {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    input[type="checkbox"] {
      margin: 0;
    }
  }

  // Stats Element
  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  &__stat {
    font-size: 10px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  // Shortcuts Element
  &__shortcuts {
    font-size: 9px;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.7);

    div {
      margin-bottom: 2px;
    }
  }
}

// Animations
@keyframes pulse-combo {
  0% {
    transform: scale(1);
    text-shadow: none;
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 0 10px rgba(0, 184, 148, 0.5);
  }
  100% {
    transform: scale(1);
    text-shadow: none;
  }
}

// Responsive adjustments for smaller screens
@media (max-width: vars.$breakpoint-sm) {
  .debug-panel {
    &__content {
      min-width: 280px;
      max-width: calc(100vw - 40px);
    }

    &--bottom-right,
    &--bottom-left {
      bottom: 10px;
    }

    &--bottom-right {
      right: 10px;
    }

    &--bottom-left {
      left: 10px;
    }

    &__header-controls {
      justify-content: center;
    }

    &__session-stats {
      text-align: center;
    }

    &__physics-status,
    &__physics-stats {
      grid-template-columns: 1fr;
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .debug-panel__session-stat--combo {
    animation: none;
  }

  .debug-panel__toggle:hover {
    transform: none;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .debug-panel {
    &__content {
      border-width: 2px;
    }

    &__session-stat--combo {
      text-shadow: none;
      outline: 1px solid #00b894;
      padding: 2px 4px;
      border-radius: 2px;
    }
  }
}
</style>