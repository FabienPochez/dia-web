<template>
  <Card class="w-full text-white rounded-none bg-transparent border-b border-t-0 border-r-0 border-l-0 border-neutral-500 py-0 gap-0">
    <CardContent class="p-0">
      <!-- Image with play button -->
      <div class="relative aspect-3/2 w-full overflow-hidden rounded-lg">
        <img
          :src="props.image"
          :alt="props.title"
          class="object-cover w-full h-full"
        />
        <PlayPauseButton
          class="absolute bottom-0 left-0"
          :key="props.episodeId + '-' + (props.isPlaying ? 'active' : 'inactive')"
          :isPlaying="props.isPlaying"
          :onToggle="props.toggle"
        />
      </div>
     <CardDescription v-if="props.firstAiredAt" class="pt-3">
        {{ props.firstAiredAt }}
      </CardDescription>
      <!-- Title -->
        
      <div class=" pt-3">
        
        <h3 class="uppercase font-semibold">{{ props.title }}</h3>
      </div>

      <!-- Genres -->
      <div class="pt-5 pb-2">
        <Badge
          v-for="genre in props.genres"
          :key="genre"
          variant="genre-solid"
          class="mr-2"
        >
          {{ genre }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription } from '@/components/ui/card'

const props = defineProps({
  title: String,
  image: String,
  isPlaying: Boolean,
  toggle: Function,
  episodeId: String,
  genres: {
    type: Array,
    default: () => [],
  },
  firstAiredAt: {
    type: String,
    default: null,
  },
  energy: {
    type: String,
    default: '',
  },
  mood: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: '',
  },
})
</script>

