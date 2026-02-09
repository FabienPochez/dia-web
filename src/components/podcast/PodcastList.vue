<template>
  <div>
    <PodcastGrid
      :items="items"
      :isEpisodePlaying="isEpisodePlaying"
      :toggleEpisode="toggleEpisode"
      :isLoading="isLoading"
      :skeletonCount="items.length === 0 && isLoading ? 6 : (items.length > 0 && isLoading ? 4 : 0)"
      cols="grid-cols-1"
      gap="gap-4"
    />

    <!-- Infinite scroll sentinel -->
    <div ref="infiniteSentinel" class="h-4" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePlayer } from '@/composables/usePlayer.js'
import PodcastGrid from '@/components/podcast/PodcastGrid.vue'
import { useInfiniteObserver } from '@/composables/useInfiniteObserver'
import { useEpisodes } from '@/composables/useEpisodes'

const { isEpisodePlaying, toggleEpisode } = usePlayer()
const { items, isLoading, fetchEpisodes, loadNext } = useEpisodes()

// Setup infinite scroll observer
const { infiniteSentinel } = useInfiniteObserver(loadNext)

// Initialize
onMounted(async () => {
  if (items.value.length === 0) {
    await fetchEpisodes(1)
  }
})
</script>
