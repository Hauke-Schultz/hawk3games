// src/composables/useInputHandler.js - Input Handling Composable
import { ref, computed } from 'vue'
import { PHYSICS_CONFIG } from '../config/fruitMergeGameConfig.js'

export function useInputHandler(gameCanvas, fruitManager, gameState) {
	// Input state
	const isDragging = ref(false)
	const dragStartX = ref(null)
	const dropPreviewPosition = ref(null)
	const isHoveringDropZone = ref(false)
	const dropFruitPosition = ref({ x: 150, y: 30 })

	// Helper functions
	const getPointerPosition = (event) => {
		if (!gameCanvas.value) return 0

		const rect = gameCanvas.value.getBoundingClientRect()
		const clientX = event.touches ? event.touches[0].clientX : event.clientX
		return clientX - rect.left
	}

	const updateDropPreview = (x) => {
		// Clamp to drop zone boundaries
		const clampedX = Math.max(
			PHYSICS_CONFIG.dropZone.minX,
			Math.min(PHYSICS_CONFIG.dropZone.maxX, x)
		)

		// Update drop preview line
		dropPreviewPosition.value = clampedX

		// Update drop fruit position
		dropFruitPosition.value = {
			x: clampedX,
			y: 30
		}

		// Check if in valid drop zone
		isHoveringDropZone.value = x >= PHYSICS_CONFIG.dropZone.minX && x <= PHYSICS_CONFIG.dropZone.maxX
	}

	const resetDropState = () => {
		isDragging.value = false
		dragStartX.value = null
		dropPreviewPosition.value = null
		isHoveringDropZone.value = false

		// Reset drop fruit to center
		dropFruitPosition.value = { x: 150, y: 30 }
	}

	// Mouse/Touch event handlers
	const handlePointerDown = (event) => {
		if (isInputBlocked()) return

		event.preventDefault()
		isDragging.value = true
		dragStartX.value = getPointerPosition(event)

		// Start showing drop preview
		updateDropPreview(dragStartX.value)

		console.log('🎯 Started dragging drop fruit')
	}

	const handlePointerMove = (event) => {
		if (!isDragging.value || isInputBlocked()) return

		event.preventDefault()
		const currentX = getPointerPosition(event)
		updateDropPreview(currentX)
	}

	const handlePointerUp = (event) => {
		if (!isDragging.value || isInputBlocked()) return

		event.preventDefault()
		const dropX = getPointerPosition(event)

		// Only drop if in valid zone
		if (isHoveringDropZone.value) {
			fruitManager.dropFruit(dropX)
		} else {
			console.log('❌ Drop outside valid zone')
		}

		// Reset interaction state
		resetDropState()
	}

	const handlePointerLeave = () => {
		isDragging.value = false
		dragStartX.value = null
		dropPreviewPosition.value = null
	}

	// Touch event handlers (delegating to pointer handlers)
	const handleTouchStart = (event) => handlePointerDown(event)
	const handleTouchMove = (event) => handlePointerMove(event)
	const handleTouchEnd = (event) => handlePointerUp(event)

	// Click-to-drop handler
	const handleClickToDrop = (event) => {
		if (isDragging.value || isInputBlocked()) return

		event.preventDefault()
		const dropX = getPointerPosition(event)

		// Validate drop position
		const minX = PHYSICS_CONFIG.dropZone.minX
		const maxX = PHYSICS_CONFIG.dropZone.maxX
		const targetX = Math.max(minX, Math.min(maxX, dropX))

		// Drop the fruit
		fruitManager.dropFruit(targetX)

		console.log(`🎯 Click-to-drop at x: ${targetX}`)
	}

	// Computed properties for UI feedback
	const isValidDropPosition = computed(() => {
		return isHoveringDropZone.value && isDragging.value
	})

	const dropLineStyle = computed(() => {
		if (!dropPreviewPosition.value || isInputBlocked()) {
			return { display: 'none' }
		}

		return {
			left: `${dropPreviewPosition.value}px`,
			height: `${PHYSICS_CONFIG.canvas.height - PHYSICS_CONFIG.dropZone.dropY}px`,
			top: `${PHYSICS_CONFIG.dropZone.dropY}px`,
			position: 'absolute',
			width: '2px',
			background: 'linear-gradient(to bottom, rgba(0, 184, 148, 0.8) 0%, rgba(0, 184, 148, 0.4) 50%, transparent 100%)',
			borderRadius: '1px',
			pointerEvents: 'none',
			zIndex: 5
		}
	})

	// Container event setup helpers
	const getContainerEventHandlers = () => {
		return {
			onMousedown: handlePointerDown,
			onMousemove: handlePointerMove,
			onMouseup: handlePointerUp,
			onMouseleave: handlePointerLeave,
			onTouchstart: handleTouchStart,
			onTouchmove: handleTouchMove,
			onTouchend: handleTouchEnd,
			onTouchcancel: handlePointerLeave,
			onClick: handleClickToDrop
		}
	}

	// Input validation helpers
	const canAcceptInput = () => {
		const isActive = gameState.isGameActive.value || false
		const isPaused = gameState.isGamePaused.value || false
		const canDropFruit = fruitManager.canDrop?.value || false
		const isGameOver = fruitManager.gameOverState?.value || false

		return isActive && !isPaused && canDropFruit && !isGameOver
	}

	const isInputBlocked = () => {
		const isActive = gameState.isGameActive.value || false
		const isPaused = gameState.isGamePaused.value || false
		const canDropFruit = fruitManager.canDrop?.value || false
		const isGameOver = fruitManager.gameOverState?.value || false

		return !isActive || isPaused || !canDropFruit || isGameOver
	}

	// Reset function for game state changes
	const resetInputState = () => {
		resetDropState()
		console.log('🔄 Input state reset')
	}

	// Accessibility helpers
	const getDropZoneAriaLabel = () => {
		if (fruitManager.gameOverState?.value) {
			return 'Game Over - interactions disabled'
		}
		if (!canAcceptInput()) {
			return 'Drop zone unavailable'
		}
		if (isDragging.value) {
			return isHoveringDropZone.value ? 'Valid drop zone' : 'Invalid drop zone'
		}
		return 'Click or drag to drop fruit'
	}

	return {
		// State
		isDragging,
		dragStartX,
		dropPreviewPosition,
		isHoveringDropZone,
		dropFruitPosition,

		// Computed
		isValidDropPosition,
		dropLineStyle,

		// Event handlers
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handlePointerLeave,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleClickToDrop,

		// Utilities
		getPointerPosition,
		updateDropPreview,
		resetDropState,
		resetInputState,
		getContainerEventHandlers,
		canAcceptInput,
		isInputBlocked,
		getDropZoneAriaLabel
	}
}