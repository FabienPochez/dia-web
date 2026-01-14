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

            <!-- Timeline progress bar -->
            <div ref="sliderRef" class="w-full">
              <ProgressBar
                :model-value="dragValue[0]"
                :min="0"
                :max="duration || 0"
                :disabled="!duration || duration <= 0"
                variant="rounded"
                @update:modelValue="onProgressUpdate"
                @valueCommit="onProgressCommit"
                @scrubbing="onScrubbing"
              />
            </div>

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
import ProgressBar from '@/components/player/ProgressBar.vue'
import { usePlayer } from '@/composables/usePlayer.js'

defineProps({
  title: String,
  mode: String
})

const { displayCurrentTime, duration, isLive, seekBusy, seek, uiTimeRef, isUiFrozenRef } = usePlayer()

// Drag state management
const dragValue = ref([0])
const isDragging = ref(false)
const sliderRef = ref(null)

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

function onProgressUpdate(value) {
  isDragging.value = true
  dragValue.value = [value]
}

function onProgressCommit(value) {
  isDragging.value = false
  dragValue.value = [value]
  if (import.meta.env.DEV && (globalThis.DIA_DEBUG ?? false)) console.log('[UI] seek request', { to: value, via: 'facade' });
  seek(value)
}

function onScrubbing(scrubbing) {
  isDragging.value = scrubbing
}
</script>

