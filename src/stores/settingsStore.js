import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { saveToStorage, loadFromStorage } from '../utils/storage.js'

// Settings Store - Manages game performance, user preferences, and theme
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

	// Theme Settings (NEW)
	const currentTheme = ref('dark') // 'light' | 'dark' | 'auto'
	const systemTheme = ref('dark')  // detected system preference

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

	// Theme computed values (NEW)
	const effectiveTheme = computed(() => {
		if (currentTheme.value === 'auto') {
			return systemTheme.value
		}
		return currentTheme.value
	})

	const getThemeDescription = computed(() => {
		switch (currentTheme.value) {
			case 'light': return 'Always use light theme'
			case 'dark': return 'Always use dark theme'
			case 'auto': return `System theme (currently ${systemTheme.value})`
			default: return 'Theme selection'
		}
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

	// System theme detection (NEW)
	const detectSystemTheme = () => {
		if (window.matchMedia) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
			systemTheme.value = mediaQuery.matches ? 'dark' : 'light'

			// Listen for system theme changes
			mediaQuery.addEventListener('change', (e) => {
				systemTheme.value = e.matches ? 'dark' : 'light'
				console.log(`🌓 System theme changed to ${systemTheme.value}`)

				// Apply theme if auto mode is active
				if (currentTheme.value === 'auto') {
					applyTheme(systemTheme.value)
				}
			})

			console.log(`🌓 System theme detected: ${systemTheme.value}`)
		}
		return systemTheme.value
	}

	// Apply theme to DOM (NEW)
	const applyTheme = (theme) => {
		document.documentElement.setAttribute('data-theme', theme)
		console.log(`🎨 Applied ${theme} theme to DOM`)
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

	// Theme actions (NEW)
	const setTheme = (theme) => {
		if (!['light', 'dark', 'auto'].includes(theme)) {
			console.warn(`Invalid theme: ${theme}`)
			return false
		}

		currentTheme.value = theme
		applyTheme(effectiveTheme.value)

		// Save to legacy localStorage key for backward compatibility
		localStorage.setItem('theme', effectiveTheme.value)

		console.log(`🎨 Theme set to ${theme} (effective: ${effectiveTheme.value})`)
		return true
	}

	const toggleTheme = () => {
		// Simple two-way toggle (light <-> dark), skipping auto for compatibility
		const themes = ['light', 'dark']
		const currentIndex = themes.indexOf(currentTheme.value)
		const nextTheme = themes[(currentIndex + 1) % themes.length]
		setTheme(nextTheme)
	}

	const getThemeIcon = (theme) => {
		switch (theme) {
			case 'light': return '☀️'
			case 'dark': return '🌙'
			case 'auto': return '⚙️'
			default: return '🎨'
		}
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
		currentTheme.value = 'dark' // Default theme

		// Apply default theme
		applyTheme(effectiveTheme.value)
		localStorage.setItem('theme', effectiveTheme.value)

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
			},
			theme: {
				currentTheme: currentTheme.value,
				systemTheme: systemTheme.value,
				effectiveTheme: effectiveTheme.value
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
			currentTheme: currentTheme.value, // NEW
			devicePerformance: devicePerformance.value
		}

		return saveToStorage('settings', settingsData)
	}

	const loadSettings = () => {
		// Try to load from new settings first
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
			currentTheme.value = savedData.currentTheme ?? 'dark' // NEW
			devicePerformance.value = savedData.devicePerformance ?? 'high'

			console.log('⚙️ Settings loaded from storage')
		} else {
			// Fallback: try to load legacy theme setting
			const legacyTheme = localStorage.getItem('theme')
			if (legacyTheme && ['light', 'dark'].includes(legacyTheme)) {
				currentTheme.value = legacyTheme
				console.log(`⚙️ Migrated legacy theme: ${legacyTheme}`)
			}
		}

		// Apply theme and high contrast
		applyTheme(effectiveTheme.value)
		if (highContrast.value) {
			document.documentElement.classList.add('high-contrast')
		}

		// Detect system theme
		detectSystemTheme()

		return !!savedData
	}

	// Auto-save on changes
	let saveTimeout = null
	const debouncedSave = () => {
		if (saveTimeout) clearTimeout(saveTimeout)
		saveTimeout = setTimeout(() => {
			saveSettings()
		}, 500) // Save after 0.5 seconds of inactivity
	}

	// Watch all settings for auto-save (including theme)
	watch([
		particlesEnabled, reducedAnimations, lowPowerMode,
		soundEnabled, musicEnabled, masterVolume,
		showFPS, highContrast, currentTheme // NEW
	], debouncedSave)

	// Watch effective theme changes and apply them
	watch(effectiveTheme, (newTheme) => {
		applyTheme(newTheme)
		// Update legacy localStorage for backward compatibility
		localStorage.setItem('theme', newTheme)
	})

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

		// State - Theme (NEW)
		currentTheme,
		systemTheme,

		// Computed
		effectiveParticleCount,
		shouldUseSimpleAnimations,
		shouldShowFPS,
		effectiveTheme,
		getThemeDescription,

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

		// Actions - Theme (NEW)
		setTheme,
		toggleTheme,
		getThemeIcon,
		detectSystemTheme,
		applyTheme,

		// Actions - Utilities
		resetSettings,
		getSettingsSummary,
		saveSettings,
		loadSettings
	}
})