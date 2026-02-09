<script setup>
import { ref, computed, watch } from 'vue'
import ProgressBar from '@/components/player/ProgressBar.vue'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { RotateCcw, RotateCw } from 'lucide-vue-next'
import { usePlayer } from '@/composables/usePlayer.js'

const props = defineProps({
  /** When provided (e.g. from EpisodeModal), Play uses toggleEpisode when this episode isn't current */
  episode: { type: Object, default: null },
})

const {
  current,
  isPlaying,
  pause,
  setAndPlay,
  toggleEpisode,
  displayCurrentTime,
  duration,
  isLive,
  seekBusy,
  seek,
  currentTime,
  uiTimeRef,
} = usePlayer()

const dragValue = ref([0])
const isDragging = ref(false)

const isThisEpisodePlaying = computed(() => {
  if (!props.episode?.id) return false
  return current.mode === 'podcast' && current.id === props.episode.id
})

const showFullControls = computed(() => {
  if (props.episode) return isThisEpisodePlaying.value
  return current.mode === 'podcast'
})

watch(uiTimeRef, (newValue) => {
  if (!isDragging.value) dragValue.value = [newValue || 0]
}, { immediate: true })

const remaining = computed(() => {
  if (isLive.value || !duration.value || duration.value <= 0) return 0
  return Math.max(0, (duration.value || 0) - (displayCurrentTime.value || 0))
})

function fmt(s) {
  if (!Number.isFinite(s)) return '0:00'
  const sign = s < 0 ? '-' : ''
  const n = Math.abs(Math.floor(s))
  const m = Math.floor(n / 60)
  const sec = n % 60
  return `${sign}${m}:${String(sec).padStart(2, '0')}`
}

function clamp(t, max) {
  return Math.max(0, Math.min(t, max))
}

function seekTo(t) {
  seek(clamp(t, duration.value || 0))
}

function skip(by) {
  if (!duration.value || duration.value <= 0) return
  seekTo((currentTime.value || 0) + by)
}

function onToggle() {
  if (props.episode && !isThisEpisodePlaying.value) {
    const ep = props.episode
    const src = ep.src || ep.audioUrl || (ep.track_id ? `https://stream.diaradio.live/stream/${ep.track_id}` : null)
    if (src && ep.id) {
      toggleEpisode({
        id: ep.id,
        src,
        title: ep.title,
        realDuration: ep.realDuration,
        cover: ep.cover || ep.image || '/img/fallback-live.jpg',
        genres: ep.genres || [],
        energy: ep.energy || '',
        mood: ep.mood || '',
        tone: ep.tone || '',
        pubDateFormatted: ep.formattedDate,
        pubDate: ep.firstAiredAt || ep.formattedDate,
      })
    }
    return
  }
  if (isPlaying.value) {
    pause()
  } else {
    setAndPlay({
      id: current.id,
      src: current.src,
      title: current.title,
      mode: current.mode,
      cover: current.cover,
      genres: current.genres,
      energy: current.energy,
      mood: current.mood,
      tone: current.tone,
      realDuration: current.realDuration,
      episodeDate: current.firstAiredAt,
    })
  }
}

function onProgressUpdate(value) {
  isDragging.value = true
  dragValue.value = [value]
}

function onProgressCommit(value) {
  isDragging.value = false
  dragValue.value = [value]
  seekTo(value)
}

function onScrubbing(scrubbing) {
  isDragging.value = scrubbing
}

const showPlayButton = computed(() => {
  if (props.episode) return !!props.episode.id && !!(props.episode.src || props.episode.audioUrl || props.episode.track_id)
  return true
})

const isPlayButtonActive = computed(() => {
  if (props.episode && isThisEpisodePlaying.value) return isPlaying.value
  if (!props.episode) return isPlaying.value
  return false
})
</script>

<template>
  <!-- gradient veil -->
  <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

  <!-- centered controls -->
  <div class="absolute inset-0 flex items-center justify-center gap-8">
    <button
      v-if="showFullControls && !isLive"
      :disabled="!duration || duration <= 0"
      class="pointer-events-auto relative grid place-items-center w-16 h-16 disabled:opacity-50 disabled:cursor-not-allowed text-white"
      @click.stop="skip(-30)"
      aria-label="Back 30 seconds"
    >
      <RotateCcw class="w-10 h-10" />
      <span class="absolute text-[10px] font-semibold">30</span>
    </button>

    <PlayPauseButton
      v-if="showPlayButton"
      :key="episode?.id || current.id"
      :is-playing="isPlayButtonActive"
      :seek-busy="seekBusy"
      :on-toggle="onToggle"
      class="pointer-events-auto !w-20 !h-20 bg-transparent text-white border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none hover:!bg-transparent dark:hover:!bg-transparent"
    />

    <button
      v-if="showFullControls && !isLive"
      :disabled="!duration || duration <= 0"
      class="pointer-events-auto relative grid place-items-center w-16 h-16 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-white"
      @click.stop="skip(30)"
      aria-label="Forward 30 seconds"
    >
      <RotateCw class="w-10 h-10" />
      <span class="absolute text-[10px] font-semibold">30</span>
    </button>
  </div>

  <!-- timeline (podcast mode only) -->
  <div v-if="showFullControls && !isLive" class="absolute inset-x-0 bottom-0">
    <div class="pointer-events-none flex justify-between text-[10px] font-mono text-white/80 px-4 pb-1">
      <span>{{ duration && duration > 0 ? fmt(displayCurrentTime) : '-' }}</span>
      <span>{{ duration && duration > 0 ? fmt(remaining) : '-' }}</span>
    </div>
    <div class="pointer-events-auto w-full px-0">
      <ProgressBar
        :model-value="dragValue[0]"
        :min="0"
        :max="duration || 0"
        :disabled="!duration || duration <= 0"
        variant="full-bleed"
        @update:model-value="onProgressUpdate"
        @value-commit="onProgressCommit"
        @scrubbing="onScrubbing"
      />
    </div>
  </div>
</template>
