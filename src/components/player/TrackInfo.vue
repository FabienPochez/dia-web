<template>
  <div class="flex-1 overflow-hidden">
    <transition name="fade" mode="out-in">
      <div :key="mode">
        <!-- LIVE Mode -->
        <template v-if="mode === 'live'">
          <div class="w-full max-w-full">
            <p
              class="font-semibold font-sans text-sm uppercase text-white truncate"
              title="title"
            >
              {{ title }}
            </p>
          </div>

          <p class="text-xs text-gray-400 flex items-center gap-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
            </span>
            Playing on Dia!
          </p>
        </template>

        <!-- PODCAST Mode -->
        <template v-else>
          <div class="flex justify-center flex-col gap-1">
            <!-- Title -->
            <div class="w-full flex justify-center">
              <p
                class="text-xs text-white font-semibold font-sans uppercase truncate text-center max-w-[80%]"
                :title="title"
              >
                {{ title }}
              </p>
            </div>

            <!-- Timeline slider -->
            <Slider
              v-model="dragValue"
              :min="0"
              :max="duration || 0"
              :step="1"
              :disabled="!duration || duration <= 0"
              @valueCommit="onSliderCommit"
              @update:modelValue="onSliderDrag"
              @pointerdown="onSliderPointerDown"
              aria-label="Timeline"
              class="w-full [&_[data-slot=slider-track]]:bg-light-blue [&_[data-slot=slider-track]]:h-[2px] [&_[data-slot=slider-track]]:pointer-events-none [&_[data-slot=slider-range]]:bg-pink [&_[data-slot=slider-range]]:pointer-events-none [&_[data-slot=slider-thumb]]:bg-pink [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:border-pink [&_[data-slot=slider-thumb]]:pointer-events-auto"
            />

            <!-- Duration -->
            <div class="font-sans text-center text-xs text-gray-400">
              <span v-if="mode === 'live'">LIVE</span>
              <span v-else>{{ (duration && duration > 0) ? formatTime(displayCurrentTime) : '-' }} / {{ (duration && duration > 0) ? formatTime(remaining) : '-' }}</span>
            </div>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>



<script setup>
import { computed, ref, watch } from 'vue'
import Slider from '@/components/ui/slider/Slider.vue'
import { usePlayer } from '@/composables/usePlayer.js'

defineProps({
  title: String,
  mode: String
})

const { displayCurrentTime, duration, isLive, seekBusy, seek, uiTimeRef, isUiFrozenRef } = usePlayer()

// Drag state management
const dragValue = ref([0])
const isDragging = ref(false)

// Sync dragValue with uiTimeRef when not dragging
watch(uiTimeRef, (newValue) => {
  if (!isDragging.value) {
    dragValue.value = [newValue || 0]
  }
}, { immediate: true })

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const remaining = computed(() => {
  return Math.max(0, (duration.value || 0) - (displayCurrentTime.value || 0))
})

function onSliderDrag() {
  isDragging.value = true
}

function onSliderCommit() {
  isDragging.value = false
  const newTime = dragValue.value[0]
  if (globalThis.DIA_DEBUG ?? true) console.log('[UI] seek request', { to: newTime, via: 'facade' });
  seek(newTime)
}

function onSliderPointerDown(event) {
  // Only allow thumb interactions, block rail clicks
  if (!event.target.closest('[data-slot="slider-thumb"]')) {
    event.preventDefault()
    event.stopPropagation()
  }
}
</script>

