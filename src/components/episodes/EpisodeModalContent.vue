<template>
  <div class="space-y-4">
    <!-- Cover with play button overlay -->
    <div class="relative aspect-3/2 w-full overflow-hidden rounded-lg">
      <img
        :src="coverUrl"
        :alt="episode?.title || 'Episode cover'"
        class="object-cover w-full h-full"
        @error="onCoverError"
      />
      <PlayPauseButton
        v-if="episode?.id && (episode?.src || episode?.audioUrl || episode?.track_id)"
        class="absolute bottom-0 left-0"
        :key="episode.id + '-' + (isPlaying ? 'active' : 'inactive')"
        :is-playing="isPlaying"
        :on-toggle="handlePlayToggle"
      />
    </div>

    <!-- Title, date, description -->
    <div class="space-y-3">
      <div v-if="episode?.formattedDate || episode?.firstAiredAt" class="text-sm text-neutral-400">
        {{ episode?.formattedDate || formatDate(episode?.firstAiredAt) }}
      </div>
      <h2 class="text-xl font-semibold uppercase">{{ episode?.title || 'Untitled' }}</h2>
      <div v-if="episode?.show?.title" class="text-sm text-neutral-400">
        {{ episode.show.title }}
      </div>

      <!-- Genres -->
      <div v-if="episode?.genres?.length" class="flex flex-wrap gap-2">
        <Badge
          v-for="genre in displayGenres"
          :key="genre"
          variant="genre-solid"
        >
          {{ genre }}
        </Badge>
      </div>

      <!-- Description -->
      <div v-if="description" class="text-sm text-neutral-300 whitespace-pre-wrap">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { Badge } from '@/components/ui/badge'
import { usePlayer } from '@/composables/usePlayer.js'

const FALLBACK_COVER = '/img/fallback-live.jpg'

const props = defineProps({
  episode: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
})

defineEmits(['close'])

const { isEpisodePlaying, toggleEpisode } = usePlayer()

const coverUrl = computed(() => props.episode?.cover || props.episode?.image || FALLBACK_COVER)

const description = computed(() => {
  const d = props.episode?.description
  return d && typeof d === 'string' ? d : ''
})

const displayGenres = computed(() => {
  const g = props.episode?.genres
  if (!Array.isArray(g)) return []
  return g.map((x) => (typeof x === 'string' ? x : x?.name)).filter(Boolean)
})

const isPlaying = computed(() =>
  props.episode?.id ? isEpisodePlaying(props.episode.id) : false
)

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).split('/').join('.')
}

function onCoverError(e) {
  if (e?.target?.src && !e.target.src.endsWith('fallback-live.jpg')) {
    e.target.src = FALLBACK_COVER
  }
}

function handlePlayToggle() {
  const ep = props.episode
  const src = ep?.src || ep?.audioUrl || (ep?.track_id ? `https://stream.diaradio.live/stream/${ep.track_id}` : null)
  if (!src || !ep?.id) return
  toggleEpisode({
    id: ep.id,
    src,
    title: ep.title,
    realDuration: ep.realDuration,
    cover: ep.cover || ep.image || FALLBACK_COVER,
    genres: ep.genres || [],
    energy: ep.energy || '',
    mood: ep.mood || '',
    tone: ep.tone || '',
    pubDateFormatted: ep.formattedDate,
    pubDate: ep.firstAiredAt || ep.formattedDate,
  })
}
</script>
