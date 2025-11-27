<template>
  <div
    class="w-full h-[60px] min-h-[60px] max-h-[60px] flex-shrink-0 bg-neutral-900 text-white rounded-lg shadow border border-neutral-600 overflow-hidden flex items-center gap-0 pr-5"
    :style="playerStyle"
  >
    <!-- Reconnect indicator for Live Streams -->
    <div v-if="isReconnecting && current.mode === 'live'" class="absolute top-1 right-1">
      <div class="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" title="Reconnecting..."></div>
    </div>

    <!-- Cover -->
    <CoverImage :src="current.mode === 'live' ? liveMeta.cover : current.cover || '/img/fallback-live.jpg'" />
    <!-- Play / Pause -->
    <PlayPauseButton
      class="h-full aspect-square bg-transparent!"
      :key="current.id"
      :isPlaying="isPlaying"
      :seekBusy="seekBusy"
      :onToggle="current.mode === 'live' ? toggleLivePlayback : togglePodcastPlayback"
    />
    <!-- Track Info -->
    <TrackInfo
      :title="current.mode === 'live' ? liveMeta.title : current.title || 'Podcast Episode'"
      :mode="current.mode"
    />
  </div>

  <audio ref="audioRef" :src="current.src" preload="none" class="hidden" />
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import { usePlayer, audioRef } from '@/composables/usePlayer.js'
import { useLiveSchedule } from '@/composables/useLiveSchedule.js'
import CoverImage from '@/components/shared/CoverImage.vue'
import TrackInfo from '@/components/player/TrackInfo.vue'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'

const GLOBAL_PLAYER_HEIGHT = 60

const { current, isPlaying, pause, setAndPlay, getAdapterType, seekBusy, isReconnecting, setDefaultLive } = usePlayer()

// Use shared live schedule data
const { currentShow, liveMeta } = useLiveSchedule()

const playerStyle = computed(() => ({
  '--global-player-height': `${GLOBAL_PLAYER_HEIGHT}px`
}))

// Preload live info on mount (like GlobalPlayer)
onMounted(() => {
  setDefaultLive()
})

function toggleLivePlayback() {
  if (current.mode === 'live' && isPlaying.value) {
    pause()
  } else {
    setAndPlay({
      src: 'https://livestream.diaradio.live/main',
      title: liveMeta.value.title,
      mode: 'live',
      cover: liveMeta.value.cover
    })
    updateMediaSession(liveMeta.value.title, 'Live on Dia!', liveMeta.value.cover)
  }
}

function togglePodcastPlayback() {
  if (current.mode !== 'live' && isPlaying.value) {
    pause()
  } else {
    setAndPlay({
      id: current.id,    
      src: current.src,
      title: current.title,
      mode: 'podcast',
      cover: current.cover,
      genres: current.genres,
      energy: current.energy,
      mood: current.mood,
      tone: current.tone,
      realDuration: current.realDuration,
      episodeDate: current.publishedAt
    })
    updateMediaSession(current.title, 'Podcast Episode', current.cover)
  }
}

watch(current, (newVal) => {
  if (current.mode === 'live') {
    // Live data is now managed by useLiveSchedule
  } else {
    if (newVal?.mode === 'podcast' && isPlaying.value) {
      updateMediaSession(newVal.title, 'Podcast Episode', newVal.cover)
    }
  }
})

function updateMediaSession(title, artist, artworkUrl) {
  // Only set MediaSession for web (HTML5 adapter)
  if ('mediaSession' in navigator && getAdapterType() === 'html5') {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'DIA! Radio',
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    })

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.value.play()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.value.pause()
    })
    
    if (import.meta.env.DEV && globalThis.DIA_DEBUG) console.log('[MEDIA SESSION] Web MediaSession updated', { title, artist })
  }
}
</script>

