<template>
  <Button
    variant="ghost"
    size="icon"
    :disabled="isLoading || seekBusy"
    :aria-busy="(isLoading || seekBusy) ? 'true' : 'false'"
    @click.stop="handleToggle"
    class="w-12 h-12 bg-neutral-900/70 rounded-none text-white disabled:opacity-60"
  >
    
      <component
        v-if="!isLoading && !seekBusy"
        :is="isLoading ? LoaderCircle : (isPlaying ? Pause : Play)"
        :key="isLoading ? 'loading' : (isPlaying ? 'pause' : 'play')"
        class="!w-[50%] !h-[50%] transition-opacity duration-100 ease-out"
        :class="isLoading ? 'animate-spin' : ''"
        stroke="none"
        fill="currentColor"
      />
      <LoaderCircle v-else class="!w-[50%] !h-[50%] animate-spin" />

  </Button>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Play, Pause, LoaderCircle } from 'lucide-vue-next'

const props = defineProps({ isPlaying: Boolean, seekBusy: Boolean, onToggle: Function })
const isLoading = ref(false)

// When parent flips playing state, stop showing the spinner immediately
watch(() => props.isPlaying, () => {
  if (isLoading.value) isLoading.value = false
})

const handleToggle = async () => {
  if (isLoading.value) return
  isLoading.value = true
  // Let the spinner render before starting any heavy/async work
  await nextTick()
  requestAnimationFrame(() => {
    // Fire and forget—parent will set isPlaying when ready, which clears loading via the watcher
    try { props.onToggle && props.onToggle() } catch {}
  })
}
</script>

