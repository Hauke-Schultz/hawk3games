<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../../stores/settingsStore.js'

const settingsStore = useSettingsStore()

// Reactive settings state
const {
  particlesEnabled,
  reducedAnimations,
  lowPowerMode,
  soundEnabled,
  musicEnabled,
  masterVolume,
  showFPS,
  highContrast,
  devicePerformance,
  effectiveParticleCount,
  shouldUseSimpleAnimations,
  shouldShowFPS
} = storeToRefs(settingsStore)

// Settings actions
const {
  toggleParticles,
  toggleAnimations,
  toggleLowPowerMode,
  toggleSound,
  toggleMusic,
  setMasterVolume,
  toggleFPS,
  toggleHighContrast,
  applyPerformancePreset,
  resetSettings,
  getSettingsSummary
} = settingsStore

// Computed properties for UI
const performanceLevel = computed(() => {
  if (lowPowerMode.value) return 'Low'
  if (reducedAnimations.value) return 'Medium'
  return 'High'
})

const volumePercentage = computed(() => {
  return Math.round(masterVolume.value * 100)
})

const particleCountDisplay = computed(() => {
  return Math.round(effectiveParticleCount.value * 100)
})

// Event handlers
const handleVolumeChange = (event) => {
  const volume = parseFloat(event.target.value) / 100
  setMasterVolume(volume)
}

const handlePresetSelect = (preset) => {
  applyPerformancePreset(preset)
}

const handleReset = () => {
  if (confirm('Reset all settings to defaults?')) {
    resetSettings()
  }
}

// Debug function (DEV only)
const logSettings = () => {
  if (import.meta.env.DEV) {
    console.log('⚙️ Current Settings:', getSettingsSummary())
  }
}
</script>

<template>
  <div class="settings-panel">
    <!-- Settings Header -->
    <div class="settings-panel__header">
      <h3 class="settings-panel__title">Settings</h3>
      <span class="settings-panel__device-info">
        Device: {{ devicePerformance }} performance
      </span>
    </div>

    <!-- Performance Settings Section -->
    <div class="settings-panel__section">
      <h4 class="settings-panel__section-title">
        🎯 Performance
        <span class="settings-panel__section-status">{{ performanceLevel }}</span>
      </h4>

      <div class="settings-panel__setting-group">
        <!-- Particle Effects Toggle -->
        <div class="settings-panel__setting">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Particle Effects
            </label>
            <span class="settings-panel__setting-description">
              Visual effects and animations ({{ particleCountDisplay }}% intensity)
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': particlesEnabled }"
            @click="toggleParticles"
            :aria-label="`${particlesEnabled ? 'Disable' : 'Enable'} particle effects`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>

        <!-- Reduced Animations Toggle -->
        <div class="settings-panel__setting">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Reduced Animations
            </label>
            <span class="settings-panel__setting-description">
              Simpler animations for better performance
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': reducedAnimations }"
            @click="toggleAnimations"
            :aria-label="`${reducedAnimations ? 'Disable' : 'Enable'} reduced animations`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>

        <!-- Low Power Mode Toggle -->
        <div class="settings-panel__setting">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Low Power Mode
            </label>
            <span class="settings-panel__setting-description">
              Maximum performance optimizations
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': lowPowerMode }"
            @click="toggleLowPowerMode"
            :aria-label="`${lowPowerMode ? 'Disable' : 'Enable'} low power mode`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>
      </div>

      <!-- Performance Presets -->
      <div class="settings-panel__presets">
        <span class="settings-panel__presets-label">Quick Presets:</span>
        <div class="settings-panel__preset-buttons">
          <button
            v-for="preset in ['ultra', 'high', 'medium', 'low']"
            :key="preset"
            class="settings-panel__preset-btn"
            @click="handlePresetSelect(preset)"
          >
            {{ preset.toUpperCase() }}
          </button>
        </div>
      </div>
    </div>

    <!-- Audio Settings Section -->
    <div class="settings-panel__section">
      <h4 class="settings-panel__section-title">🔊 Audio</h4>

      <div class="settings-panel__setting-group">
        <!-- Sound Effects Toggle -->
        <div class="settings-panel__setting">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Sound Effects
            </label>
            <span class="settings-panel__setting-description">
              Game sounds and audio feedback
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': soundEnabled }"
            @click="toggleSound"
            :aria-label="`${soundEnabled ? 'Disable' : 'Enable'} sound effects`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>

        <!-- Background Music Toggle -->
        <div class="settings-panel__setting">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Background Music
            </label>
            <span class="settings-panel__setting-description">
              Ambient music during gameplay
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': musicEnabled }"
            @click="toggleMusic"
            :aria-label="`${musicEnabled ? 'Disable' : 'Enable'} background music`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>

        <!-- Master Volume Slider -->
        <div class="settings-panel__setting settings-panel__setting--volume">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Master Volume
            </label>
            <span class="settings-panel__setting-description">
              {{ volumePercentage }}%
            </span>
          </div>
          <div class="settings-panel__volume-control">
            <input
              type="range"
              class="settings-panel__volume-slider"
              min="0"
              max="100"
              :value="volumePercentage"
              @input="handleVolumeChange"
              :disabled="!soundEnabled && !musicEnabled"
              aria-label="Master volume"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Display Settings Section -->
    <div class="settings-panel__section">
      <h4 class="settings-panel__section-title">🖥️ Display</h4>

      <div class="settings-panel__setting-group">
        <!-- High Contrast Toggle -->
        <div class="settings-panel__setting">
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              High Contrast Mode
            </label>
            <span class="settings-panel__setting-description">
              Enhanced visibility for accessibility
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': highContrast }"
            @click="toggleHighContrast"
            :aria-label="`${highContrast ? 'Disable' : 'Enable'} high contrast mode`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>

        <!-- FPS Display Toggle (DEV only) -->
        <div
          v-if="$DEV"
          class="settings-panel__setting settings-panel__setting--dev"
        >
          <div class="settings-panel__setting-info">
            <label class="settings-panel__setting-label">
              Show FPS Counter
            </label>
            <span class="settings-panel__setting-description">
              Performance monitoring (Development only)
            </span>
          </div>
          <button
            class="settings-panel__toggle"
            :class="{ 'settings-panel__toggle--active': showFPS }"
            @click="toggleFPS"
            :aria-label="`${showFPS ? 'Hide' : 'Show'} FPS counter`"
          >
            <span class="settings-panel__toggle-slider"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Actions -->
    <div class="settings-panel__actions">
      <button
        class="settings-panel__action-btn settings-panel__action-btn--secondary"
        @click="handleReset"
      >
        Reset to Defaults
      </button>

      <button
        v-if="$DEV"
        class="settings-panel__action-btn settings-panel__action-btn--dev"
        @click="logSettings"
      >
        Log Settings (DEV)
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables.scss' as vars;

// Settings Panel Block
.settings-panel {
  background-color: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  box-shadow: var(--card-shadow);
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: vars.$breakpoint-sm) {
    padding: var(--space-4);
    margin: 0;
    border-radius: var(--border-radius-md);
  }

  // Header Element
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--card-border);

    @media (max-width: vars.$breakpoint-sm) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: bold;
    color: var(--text-color);
  }

  &__device-info {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    background-color: var(--bg-secondary);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--border-radius-md);
  }

  // Section Element
  &__section {
    margin-bottom: var(--space-6);

    &:last-child {
      margin-bottom: var(--space-4);
    }
  }

  &__section-title {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__section-status {
    font-size: var(--font-size-sm);
    color: var(--accent-color);
    background-color: rgba(0, 184, 148, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--border-radius-sm);
  }

  // Setting Group Element
  &__setting-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  // Individual Setting Element
  &__setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-md);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--card-bg-hover);
    }

    &--volume {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-3);
    }

    &--dev {
      border: 1px dashed var(--warning-color);
      background-color: rgba(253, 203, 110, 0.1);
    }

    @media (max-width: vars.$breakpoint-sm) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);

      &--volume {
        gap: var(--space-2);
      }
    }
  }

  &__setting-info {
    flex: 1;
    min-width: 0;
  }

  &__setting-label {
    display: block;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--space-1);
  }

  &__setting-description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  // Toggle Switch Element
  &__toggle {
    position: relative;
    width: 50px;
    height: 28px;
    background-color: var(--grey-color);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    flex-shrink: 0;

    &:hover {
      background-color: var(--grey-dark);
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: 2px;
    }

    &--active {
      background-color: var(--accent-color);

      &:hover {
        background-color: var(--accent-hover);
      }

      .settings-panel__toggle-slider {
        transform: translateX(22px);
        background-color: var(--white);
      }
    }
  }

  &__toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background-color: var(--white);
    border-radius: 50%;
    transition: transform 0.3s ease, background-color 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  // Volume Control Element
  &__volume-control {
    width: 100%;
  }

  &__volume-slider {
    width: 100%;
    height: 6px;
    background: var(--grey-light);
    border-radius: 3px;
    outline: none;
    appearance: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      background: var(--accent-color);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:hover {
        background: var(--accent-hover);
      }
    }

    &::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: var(--accent-color);
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:hover {
        background: var(--accent-hover);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // Presets Element
  &__presets {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--card-border);
  }

  &__presets-label {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
  }

  &__preset-buttons {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  &__preset-btn {
    padding: var(--space-1) var(--space-3);
    background-color: var(--button-ghost-bg-hover);
    color: var(--accent-color);
    border: 1px solid var(--accent-color);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--accent-color);
      color: var(--white);
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: 2px;
    }
  }

  // Actions Element
  &__actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
    padding-top: var(--space-4);
    border-top: 1px solid var(--card-border);

    @media (max-width: vars.$breakpoint-sm) {
      flex-direction: column;
    }
  }

  &__action-btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &--secondary {
      background-color: var(--bg-secondary);
      color: var(--text-color);

      &:hover {
        background-color: var(--card-bg-hover);
      }
    }

    &--dev {
      background-color: var(--warning-color);
      color: var(--text-color);

      &:hover {
        background-color: var(--warning-light);
      }
    }

    &:focus-visible {
      outline: var(--focus-outline);
      outline-offset: 2px;
    }
  }
}

// High contrast mode support
.high-contrast .settings-panel {
  border: 2px solid var(--text-color);

  &__toggle {
    border: 1px solid var(--text-color);
  }

  &__volume-slider {
    border: 1px solid var(--text-color);
  }
}
</style>