<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { FRUIT_TYPES } from '../../config/fruitMergeGameConfig.js'

const props = defineProps({
  fruitType: {
    type: String,
    required: true,
    validator: (value) => Object.keys(FRUIT_TYPES).includes(value)
  },
  size: {
    type: Number,
    default: null
  }
})

const svgContent = ref('')
const isLoading = ref(true)

// Get fruit configuration
const fruitConfig = computed(() => FRUIT_TYPES[props.fruitType])

// Calculate display size
const displaySize = computed(() => {
  return props.size || (fruitConfig.value.radius * 2)
})

// Load SVG dynamically
const loadFruitSvg = async (fruitType) => {
  try {
    isLoading.value = true

    // Map fruit type to filename
    const fruitName = fruitType.toLowerCase()
    const svgModule = await import(`../../assets/icons/fruits/${fruitName}.svg?raw`)

    svgContent.value = svgModule.default
    isLoading.value = false

    console.log(`🍎 Loaded SVG for ${fruitType}`)
  } catch (error) {
    console.warn(`SVG not found for ${fruitType}:`, error)
    // Fallback to emoji
    svgContent.value = createEmojiSvg(fruitConfig.value.emoji)
    isLoading.value = false
  }
}

// Create fallback emoji SVG
const createEmojiSvg = (emoji) => {
  return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="${fruitConfig.value.gradient[1]}" />
      <text x="32" y="42" text-anchor="middle" font-size="32">${emoji}</text>
    </svg>
  `
}

// Load on mount and when fruit type changes
onMounted(() => loadFruitSvg(props.fruitType))
watch(() => props.fruitType, loadFruitSvg)
</script>

<template>
  <div
    class="fruit-svg"
    :style="{ width: displaySize + 'px', height: displaySize + 'px' }"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="fruit-svg__loading">
      <div class="fruit-svg__spinner"></div>
    </div>

    <!-- SVG Content -->
    <div
      v-else
      class="fruit-svg__content"
      v-html="svgContent"
    />
  </div>
</template>

<style scoped lang="scss">
.fruit-svg {
  display: flex;
  align-items: center;
  justify-content: center;

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--accent-color);
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__content {
    width: 100%;
    height: 100%;

    :deep(svg) {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>