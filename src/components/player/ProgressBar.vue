<template>
  <div
    ref="containerRef"
    class="relative w-full cursor-pointer select-none touch-none"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      variant === 'full-bleed' ? 'rounded-none' : 'rounded-full'
    ]"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @click="handleClick"
  >
    <!-- Background track - fixed height container to prevent layout shift -->
    <div
      class="relative w-full flex items-center"
      :class="[
        variant === 'full-bleed' ? 'rounded-none' : 'rounded-full'
      ]"
      style="height: 8px;"
    >
      <!-- Background track that animates height -->
      <div
        class="absolute inset-0 transition-all ease-out"
        :class="[
          variant === 'full-bleed' ? 'rounded-none' : 'rounded-full',
          disabled ? 'bg-gray-500/30' : 'bg-gray-500/40'
        ]"
        :style="{
          height: isScrubbing ? '8px' : '5px',
          top: isScrubbing ? '0px' : '1.5px',
          transitionProperty: isScrubbing ? 'none' : 'height, top',
          transitionDuration: isScrubbing ? '0ms' : '150ms',
          transitionTimingFunction: 'ease-out'
        }"
      />
      <!-- Progress fill - animates height within fixed container -->
      <div
        class="absolute left-0 transition-all ease-out"
        :class="[
          variant === 'full-bleed' ? 'rounded-none' : 'rounded-full',
          disabled ? 'bg-gray-500/50' : 'bg-[#A54995]'
        ]"
        :style="{
          width: `${progressPercentage}%`,
          height: isScrubbing ? '8px' : '5px',
          top: isScrubbing ? '0px' : '1.5px',
          transitionProperty: isScrubbing ? 'none' : 'width, height, top',
          transitionDuration: isScrubbing ? '0ms' : '150ms',
          transitionTimingFunction: 'ease-out'
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'rounded', // 'rounded' or 'full-bleed'
    validator: (value) => ['rounded', 'full-bleed'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'valueCommit', 'scrubbing'])

const containerRef = ref(null)
const isScrubbing = ref(false)
const isPointerDown = ref(false)

const progressPercentage = computed(() => {
  if (!props.max || props.max <= 0) return 0
  const clamped = Math.max(props.min, Math.min(props.modelValue, props.max))
  return ((clamped - props.min) / (props.max - props.min)) * 100
})

function getValueFromEvent(event) {
  if (!containerRef.value || props.disabled) return null
  
  const rect = containerRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, x / rect.width))
  return props.min + percentage * (props.max - props.min)
}

function handlePointerDown(event) {
  if (props.disabled) return
  
  event.preventDefault()
  isPointerDown.value = true
  isScrubbing.value = true
  
  const newValue = getValueFromEvent(event)
  if (newValue !== null) {
    emit('update:modelValue', newValue)
    emit('scrubbing', true)
  }
  
  // Add global listeners for drag
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
  document.addEventListener('pointercancel', handlePointerCancel)
}

function handlePointerMove(event) {
  if (!isPointerDown.value || props.disabled) return
  
  event.preventDefault()
  const newValue = getValueFromEvent(event)
  if (newValue !== null) {
    emit('update:modelValue', newValue)
  }
}

function handlePointerUp(event) {
  if (!isPointerDown.value) return
  
  isPointerDown.value = false
  isScrubbing.value = false
  
  const newValue = getValueFromEvent(event)
  if (newValue !== null) {
    emit('update:modelValue', newValue)
    emit('valueCommit', newValue)
  }
  
  emit('scrubbing', false)
  
  // Remove global listeners
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
  document.removeEventListener('pointercancel', handlePointerCancel)
}

function handlePointerCancel(event) {
  if (!isPointerDown.value) return
  
  isPointerDown.value = false
  isScrubbing.value = false
  emit('scrubbing', false)
  
  // Remove global listeners
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
  document.removeEventListener('pointercancel', handlePointerCancel)
}

function handleClick(event) {
  // Only handle click if we're not already dragging
  if (isPointerDown.value || props.disabled) return
  
  const newValue = getValueFromEvent(event)
  if (newValue !== null) {
    emit('update:modelValue', newValue)
    emit('valueCommit', newValue)
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
  document.removeEventListener('pointercancel', handlePointerCancel)
})
</script>
