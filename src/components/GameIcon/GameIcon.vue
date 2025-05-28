<script setup>
import { ref, onMounted, watch } from 'vue'

// Props for icon configuration
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  className: {
    type: String,
    default: ''
  }
})

// Reactive state for SVG content
const svgContent = ref('')
const isLoading = ref(true)
const hasError = ref(false)

// Load SVG file dynamically
const loadSvg = async (iconName) => {
  try {
    isLoading.value = true
    hasError.value = false

    // Import SVG file from assets/icons/ directory
    const svgModule = await import(`../../assets/icons/${iconName}.svg?raw`)

    // Get the raw SVG content
    let content = svgModule.default

    // Parse and modify SVG attributes
    content = processSvgContent(content)

    svgContent.value = content
    isLoading.value = false
  } catch (error) {
    console.warn(`Icon "${iconName}" not found in assets/icons/`)
    hasError.value = true
    isLoading.value = false

    // Fallback to a simple placeholder
    svgContent.value = createFallbackSvg()
  }
}

// Process SVG content to apply props
const processSvgContent = (content) => {
  // Create a temporary div to parse SVG
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'image/svg+xml')
  const svg = doc.querySelector('svg')

  if (svg) {
    // Set size attributes
    svg.setAttribute('width', props.size.toString())
    svg.setAttribute('height', props.size.toString())

    // Apply color to stroke and fill if currentColor is used
    if (props.color !== 'currentColor') {
      // Find all elements with stroke="currentColor" or fill="currentColor"
      const strokeElements = svg.querySelectorAll('[stroke="currentColor"], [stroke="currentcolor"]')
      const fillElements = svg.querySelectorAll('[fill="currentColor"], [fill="currentcolor"]')

      strokeElements.forEach(el => el.setAttribute('stroke', props.color))
      fillElements.forEach(el => el.setAttribute('fill', props.color))
    }

    // Add CSS class if provided
    if (props.className) {
      svg.setAttribute('class', props.className)
    }

    return svg.outerHTML
  }

  return content
}

// Create fallback SVG for missing icons
const createFallbackSvg = () => {
  return `
    <svg
      width="${props.size}"
      height="${props.size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="${props.color}"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="${props.className}"
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 9h6v6h-6z"/>
    </svg>
  `
}

// Load icon on mount and when name changes
onMounted(() => {
  loadSvg(props.name)
})

watch(() => props.name, (newName) => {
  loadSvg(newName)
})

// Watch for size and color changes
watch([() => props.size, () => props.color, () => props.className], () => {
  if (svgContent.value && !hasError.value) {
    // Re-process the current SVG content with new props
    svgContent.value = processSvgContent(svgContent.value)
  }
})
</script>

<template>
  <span
    class="game-icon"
    :class="{
      'game-icon--loading': isLoading,
      'game-icon--error': hasError
    }"
  >
    <!-- Loading state -->
    <span v-if="isLoading" class="game-icon__loading">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <circle cx="12" cy="12" r="6" opacity="0.6"/>
      </svg>
    </span>

    <!-- Error state -->
    <span v-else-if="hasError" class="game-icon__error">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </span>

    <!-- Loaded SVG content -->
    <span v-else v-html="svgContent" class="game-icon__content"></span>
  </span>
</template>

<style scoped lang="scss">
.game-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--loading {
    opacity: 0.5;

    svg {
      animation: spin 1s linear infinite;
    }
  }

  &--error {
    opacity: 0.6;
    color: #e74c3c;
  }

  &__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Ensure SVG elements inherit color properly
:deep(svg) {
  color: inherit;
}
</style>