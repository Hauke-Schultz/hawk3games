<script setup>
import { computed, ref, watch } from 'vue'
import FruitSvg from '../FruitSvg/FruitSvg.vue'
import { FRUIT_TYPES } from '../../config/fruitMergeGameConfig.js'

const props = defineProps({
  fruit: {
    type: Object,
    required: true,
    validator: (fruit) => {
      return fruit.id && fruit.type && fruit.position && fruit.body
    }
  }
})

// Rotation state
const currentRotation = ref(0)

const fruitConfig = computed(() => FRUIT_TYPES[props.fruit.type])
const displaySize = computed(() => fruitConfig.value.radius * 2)

// Watch for body rotation changes
watch(() => props.fruit.body?.angle, (newAngle) => {
  if (newAngle !== undefined) {
    // Convert radians to degrees
    currentRotation.value = (newAngle * 180) / Math.PI
  }
}, { immediate: true })

// Position styling with physics sync and rotation
const fruitStyle = computed(() => ({
  position: 'absolute',
  left: `${props.fruit.position.x - fruitConfig.value.radius}px`,
  top: `${props.fruit.position.y - fruitConfig.value.radius}px`,
  width: `${displaySize.value}px`,
  height: `${displaySize.value}px`,
  transform: `rotate(${currentRotation.value}deg)`,
  transition: props.fruit.isDropping ? 'none' : 'transform 0.05s ease-out',
  zIndex: 5,
  pointerEvents: 'none'
}))
</script>

<template>
  <div
    class="dropped-fruit"
    :class="{
      'dropped-fruit--dropping': fruit.isDropping,
      'dropped-fruit--settled': !fruit.isDropping
    }"
    :style="fruitStyle"
  >
    <FruitSvg
      :fruit-type="fruit.type"
      :size="displaySize"
    />
  </div>
</template>

<style scoped lang="scss">
.dropped-fruit {
  &--dropping {
    animation: fruit-drop 0.3s ease-out;
  }

  &--settled {
    // Slight wobble when settled
    animation: fruit-settle 0.5s ease-out;
  }

  &--merging {
    animation: fruit-merge-out 0.3s ease-out forwards;
    z-index: 15;
  }

  &--merged {
    animation: fruit-merge-in 0.5s ease-out;
    z-index: 10;
  }
}

@keyframes fruit-merge-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes fruit-merge-in {
  0% {
    transform: scale(1.5);
    opacity: 0.7;
    filter: brightness(1.5) drop-shadow(0 0 20px currentColor);
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    filter: brightness(1.2) drop-shadow(0 0 10px currentColor);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }
}

@keyframes fruit-drop {
  0% {
    transform: scale(1.2) rotate(-5deg);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }
  100% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }
}

@keyframes fruit-settle {
  0% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}
</style>