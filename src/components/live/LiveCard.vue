

<template>
  <div class="max-w-4xl mx-auto">    
    <Card class="overflow-hidden shadow border border-neutral-600 rounded-lg py-0 text-white">
      <CardContent class="relative p-0">
        <!-- Loading -->
        <div v-if="isLoading" class="aspect-[4/3]">
          <Skeleton class="h-full w-full" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-4 text-center text-sm text-gray-400">
          {{ error }}
        </div>

        <!-- Empty -->
        <div v-else-if="!currentShow" class="relative aspect-[4/3] group cursor-pointer" @click="openSchedule">
          <img
            src="/img/fallback-live.jpg"
            class="object-cover w-full h-full rounded-sm"
            alt=""
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/30"></div>

          <div class="absolute top-3 left-3 flex items-center gap-2">
            <div class="h-2 w-2 bg-gray-500 rounded-full"></div>
            <Badge variant="secondary">OFF-AIR</Badge>
          </div>

          <div class="absolute bottom-3 left-3 right-3">
            <h3 class="font-semibold uppercase leading-tight line-clamp-2">
              Dia Radio Live Feed
            </h3>
            <p class="text-xs text-white/80 mt-1">LIVE</p>
          </div>

          <!-- Play/Pause button -->
          <div @click.stop>
            <PlayPauseButton
              class="absolute bottom-2 right-2"
              :key="current.id"
              :isPlaying="isLivePlaying"
              :onToggle="toggleLive"
            />
          </div>
        </div>

        <!-- Live -->
        <div v-else class="relative aspect-[4/3] group cursor-pointer" @click="openSchedule">
          <img
            :src="coverImage"
            class="object-cover w-full h-full"
            alt=""
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/30"></div>

          <!-- Reconnect indicator -->
          <div v-if="isReconnecting" class="absolute top-2 right-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Reconnecting..."></div>
          </div>

          <div class="absolute top-3 left-3 flex items-center gap-2">
            <div class="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <Badge variant="secondary">LIVE</Badge>
            <div v-if="isRefreshing" class="h-2 w-2 bg-white/50 rounded-full animate-pulse"></div>
          </div>

          <div class="absolute bottom-3 left-3 right-3">
            <h3 class="font-semibold uppercase leading-tight line-clamp-2">
              {{ title }}
            </h3>
            <p class="text-xs text-white mt-1">{{ timeRange }}</p>
          </div>

          <!-- Play/Pause button -->
          <div @click.stop>
            <PlayPauseButton
              class="absolute bottom-2 right-2"
              :key="current.id"
              :isPlaying="isLivePlaying"
              :onToggle="toggleLive"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayer, LIVE_ID } from '@/composables/usePlayer.js'
import { useLiveSchedule } from '@/composables/useLiveSchedule.js'
import { useScheduleView } from '@/lib/useScheduleView'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// Use shared live schedule data
const { currentShow, liveMeta, timeRange, isLoading, isRefreshing, error } = useLiveSchedule()
const { openSchedule } = useScheduleView()

// Player composable
const streamUrl = 'https://livestream.diaradio.live/main'
const { setAndPlay, pause, current, isPlaying, isReconnecting } = usePlayer()

const isLivePlaying = computed(() =>
  isPlaying.value && current.mode === 'live'
)

// Cover image resolver
function absoluteMediaUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `https://content.diaradio.live${path}`
}

const coverImage = computed(() => {
  if (!currentShow.value?.cover?.url) return '/img/fallback-live.jpg'
  return absoluteMediaUrl(currentShow.value.cover.url) || '/img/fallback-live.jpg'
})

const title = computed(() => 
  currentShow.value?.title || 'Dia Radio Live Feed'
)

// Player logic
function toggleLive() {
  const isCurrentLive = current.mode === 'live' && current.src === streamUrl

  if (isCurrentLive && isPlaying.value) {
    pause()
  } else {
    setAndPlay({
      id: LIVE_ID,
      src: streamUrl,
      title: title.value,
      mode: 'live',
      cover: coverImage.value
    })
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

