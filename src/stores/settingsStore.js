import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { saveToStorage, loadFromStorage } from '../utils/storage.js'

// Settings Store - Manages game performance and user preferences
export const useSettingsStore = defineStore('settings', () => {
	// Performance Settings
	const particlesEnabled = ref(true)
	const reducedAnimations = ref(false)
	const lowPowerMode = ref(false)

	// Audio Settings
	const soundEnabled = ref(true)
	const musicEnabled = ref(true)
	const masterVolume = ref(0.8)

	// Display Settings
	const showFPS = ref(false)
	const highContrast = ref(false)

	// Auto-detected performance settings
	const devicePerformance = ref('high') // high, medium, low

	// Computed values for performance optimization
	const effectiveParticleCount = computed(() => {
		if (!particlesEnabled.value) return 0
		if (lowPowerMode.value) return 0.3 // 30% of normal
		if (reducedAnimations.value) return 0.5 // 50% of normal
		return 1.0 // 100% of normal
	})

	const shouldUseSimpleAnimations = computed(() => {
		return reducedAnimations.value || lowPowerMode.value
	})

	const shouldShowFPS = computed(() => {
		return showFPS.value && import.meta.env.DEV
	})

	// Device detection and auto-optimization
	const detectDevicePerformance = () => {
		const cores = navigator.hardwareConcurrency || 4
		const memory = navigator.deviceMemory || 4
		const isTouch = 'ontouchstart' in window
		const screenWidth = window.screen.width

		let performance = 'high'

		// Low-end device detection
		if (cores < 4 || memory < 4 || (isTouch && screenWidth < 768)) {
			performance = 'low'
			// Auto-enable optimizations for low-end devices
			lowPowerMode.value = true
			reducedAnimations.value = true
			console.log('📱 Low-end device detected, enabling optimizations')
		} else if (cores < 6 || memory < 6) {
			performance = 'medium'
			console.log('📱 Medium-performance device detected')
		} else {
			console.log('💻 High-performance device detected')
		}

		devicePerformance.value = performance
		return performance
	}

	// Settings actions
	const toggleParticles = () => {
		particlesEnabled.value = !particlesEnabled.value
		console.log(`✨ Particles ${particlesEnabled.value ? 'enabled' : 'disabled'}`)
	}

	const toggleAnimations = () => {
		reducedAnimations.value = !reducedAnimations.value
		console.log(`🎬 Animations ${reducedAnimations.value ? 'reduced' : 'full'}`)
	}

	const toggleLowPowerMode = () => {
		lowPowerMode.value = !lowPowerMode.value
		if (lowPowerMode.value) {
			// Auto-enable related optimizations
			reducedAnimations.value = true
		}
		console.log(`🔋 Low power mode ${lowPowerMode.value ? 'enabled' : 'disabled'}`)
	}

	const toggleSound = () => {
		soundEnabled.value = !soundEnabled.value
		console.log(`🔊 Sound ${soundEnabled.value ? 'enabled' : 'disabled'}`)
	}

	const toggleMusic = () => {
		musicEnabled.value = !musicEnabled.value
		console.log(`🎵 Music ${musicEnabled.value ? 'enabled' : 'disabled'}`)
	}

	const toggleFPS = () => {
		showFPS.value = !showFPS.value
		console.log(`📊 FPS display ${showFPS.value ? 'enabled' : 'disabled'}`)
	}

	const toggleHighContrast = () => {
		highContrast.value = !highContrast.value
		// Apply high contrast CSS class to document
		document.documentElement.classList.toggle('high-contrast', highContrast.value)
		console.log(`🎨 High contrast ${highContrast.value ? 'enabled' : 'disabled'}`)
	}

	const setMasterVolume = (volume) => {
		masterVolume.value = Math.max(0, Math.min(1, volume))
		console.log(`🔊 Master volume set to ${Math.round(masterVolume.value * 100)}%`)
	}

	// Preset modes
	const applyPerformancePreset = (preset) => {
		switch (preset) {
			case 'ultra':
				particlesEnabled.value = true
				reducedAnimations.value = false
				lowPowerMode.value = false
				break
			case 'high':
				particlesEnabled.value = true
				reducedAnimations.value = false
				lowPowerMode.value = false
				break
			case 'medium':
				particlesEnabled.value = true
				reducedAnimations.value = true
				lowPowerMode.value = false
				break
			case 'low':
				particlesEnabled.value = false
				reducedAnimations.value = true
				lowPowerMode.value = true
				break
			case 'potato':
				particlesEnabled.value = false
				reducedAnimations.value = true
				lowPowerMode.value = true
				showFPS.value = false
				break
		}
		console.log(`🎮 Applied ${preset} performance preset`)
	}

	// Reset to defaults
	const resetSettings = () => {
		particlesEnabled.value = true
		reducedAnimations.value = false
		lowPowerMode.value = false
		soundEnabled.value = true
		musicEnabled.value = true
		masterVolume.value = 0.8
		showFPS.value = false
		highContrast.value = false

		console.log('🔄 Settings reset to defaults')
	}

	// Get settings summary for debugging
	const getSettingsSummary = () => {
		return {
			performance: {
				particlesEnabled: particlesEnabled.value,
				reducedAnimations: reducedAnimations.value,
				lowPowerMode: lowPowerMode.value,
				effectiveParticleCount: effectiveParticleCount.value,
				devicePerformance: devicePerformance.value
			},
			audio: {
				soundEnabled: soundEnabled.value,
				musicEnabled: musicEnabled.value,
				masterVolume: masterVolume.value
			},
			display: {
				showFPS: showFPS.value,
				highContrast: highContrast.value
			}
		}
	}

	// Persistence
	const saveSettings = () => {
		const settingsData = {
			particlesEnabled: particlesEnabled.value,
			reducedAnimations: reducedAnimations.value,
			lowPowerMode: lowPowerMode.value,
			soundEnabled: soundEnabled.value,
			musicEnabled: musicEnabled.value,
			masterVolume: masterVolume.value,
			showFPS: showFPS.value,
			highContrast: highContrast.value,
			devicePerformance: devicePerformance.value
		}

		return saveToStorage('settings', settingsData)
	}

	const loadSettings = () => {
		const savedData = loadFromStorage('settings')

		if (savedData) {
			particlesEnabled.value = savedData.particlesEnabled ?? true
			reducedAnimations.value = savedData.reducedAnimations ?? false
			lowPowerMode.value = savedData.lowPowerMode ?? false
			soundEnabled.value = savedData.soundEnabled ?? true
			musicEnabled.value = savedData.musicEnabled ?? true
			masterVolume.value = savedData.masterVolume ?? 0.8
			showFPS.value = savedData.showFPS ?? false
			highContrast.value = savedData.highContrast ?? false
			devicePerformance.value = savedData.devicePerformance ?? 'high'

			// Apply high contrast if enabled
			if (highContrast.value) {
				document.documentElement.classList.add('high-contrast')
			}

			console.log('⚙️ Settings loaded from storage')
			return true
		}

		console.log('⚙️ No saved settings found, using defaults')
		return false
	}

	// Auto-save on changes
	let saveTimeout = null
	const debouncedSave = () => {
		if (saveTimeout) clearTimeout(saveTimeout)
		saveTimeout = setTimeout(() => {
			saveSettings()
		}, 500) // Save after 0.5 seconds of inactivity
	}

	// Watch all settings for auto-save
	watch([
		particlesEnabled, reducedAnimations, lowPowerMode,
		soundEnabled, musicEnabled, masterVolume,
		showFPS, highContrast
	], debouncedSave, { deep: true })

	return {
		// State - Performance
		particlesEnabled,
		reducedAnimations,
		lowPowerMode,
		devicePerformance,

		// State - Audio
		soundEnabled,
		musicEnabled,
		masterVolume,

		// State - Display
		showFPS,
		highContrast,

		// Computed
		effectiveParticleCount,
		shouldUseSimpleAnimations,
		shouldShowFPS,

		// Actions - Performance
		toggleParticles,
		toggleAnimations,
		toggleLowPowerMode,
		detectDevicePerformance,
		applyPerformancePreset,

		// Actions - Audio
		toggleSound,
		toggleMusic,
		setMasterVolume,

		// Actions - Display
		toggleFPS,
		toggleHighContrast,

		// Actions - Utilities
		resetSettings,
		getSettingsSummary,
		saveSettings,
		loadSettings
	}
})