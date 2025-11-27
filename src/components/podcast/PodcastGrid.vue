<template>
  <div>
    <div :class="gridClasses">
      <!-- Regular items -->
      <PodcastCard
        v-for="(item, index) in items"
        :key="item.id"
        :title="item.title"
        :image="item.image"
        :isPlaying="isEpisodePlaying(item.id)"
        :episode-id="item.id"
        :toggle="() => toggleEpisode({
          id: item.id,
          src: item.audioUrl,
          title: item.title,
          realDuration: item.realDuration,
          cover: item.image,
          genres: item.genres,
          energy: item.energy,
          mood: item.mood,
          tone: item.tone,
          pubDateFormatted: item.formattedDate,
          pubDate: item.pubDate
        })"
        :genres="item.genres"
        :publishedAt="item.formattedDate"
        :energy="item.energy"
        :mood="item.mood"
        :tone="item.tone"
      />
      
      <!-- Skeleton loaders -->
      <PodcastCardSkeleton
        v-for="n in skeletonCount"
        v-if="isLoading && skeletonCount > 0"
        :key="`skeleton-${n}`"
      />
    </div>

    <div v-if="items.length === 0 && !isLoading" class="text-center text-sm text-gray-400 py-8">
      No episodes found.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PodcastCard from '@/components/podcast/PodcastCard.vue'
import PodcastCardSkeleton from '@/components/podcast/PodcastCardSkeleton.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  isEpisodePlaying: {
    type: Function,
    required: true
  },
  toggleEpisode: {
    type: Function,
    required: true
  },
  gap: {
    type: String,
    default: 'gap-4', // Tailwind gap class (gap-2, gap-3, gap-4, etc.)
  },
  cols: {
    type: String,
    default: 'grid-cols-1', // Tailwind grid columns
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  skeletonCount: {
    type: Number,
    default: 0
  }
})

const gridClasses = computed(() => {
  return `grid ${props.cols} ${props.gap}`
})
</script>

