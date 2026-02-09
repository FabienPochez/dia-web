<template>
  <div class="space-y-4">
    <!-- Cover with play overlay (NowPlayingDrawer-style) -->
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

    <!-- Date + Share (same line, NowPlayingDrawer-style) -->
    <div class="flex items-end justify-between gap-3 pt-1 pb-1">
      <div v-if="episode?.formattedDate || episode?.firstAiredAt" class="text-sm text-neutral-400">
        {{ episode?.formattedDate || formatDate(episode?.firstAiredAt) }}
      </div>
      <Button
        v-if="episode?.slug"
        variant="ghost"
        size="sm"
        class="text-white hover:bg-white/10 flex-shrink-0"
        @click="handleShare"
      >
        <Share2 class="w-4 h-4" />
      </Button>
    </div>

    <!-- Title + SoundCloud (same line) -->
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-xl font-semibold uppercase flex-1">{{ episode?.title || 'Untitled' }}</h2>
      <a
        v-if="soundcloudUrl"
        :href="soundcloudUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-shrink-0 hover:opacity-80 transition-opacity"
        title="Open on SoundCloud"
      >
        <img
          src="/img/soundcloud_logo_big_white.png"
          alt="SoundCloud"
          class="h-6 w-auto"
        />
      </a>
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
    <div v-if="description" class="text-sm text-neutral-300 whitespace-pre-wrap pt-2 border-t border-neutral-700">
      {{ description }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Share2 } from 'lucide-vue-next'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePlayer } from '@/composables/usePlayer.js'

const FALLBACK_COVER = '/img/fallback-live.jpg'
const SHARE_URL_BASE = 'https://diaradio.live'

const props = defineProps({
  episode: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
})

defineEmits(['close'])

const { isEpisodePlaying, toggleEpisode } = usePlayer()

const coverUrl = computed(() => props.episode?.cover || props.episode?.image || FALLBACK_COVER)

const soundcloudUrl = computed(() => {
  const ep = props.episode
  return ep?.soundcloudUrl || ep?.soundcloud || (ep?.url?.includes?.('soundcloud.com') ? ep.url : null) || null
})

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

async function handleShare() {
  const slug = props.episode?.slug
  if (!slug) return
  const url = `${SHARE_URL_BASE}/episodes/${slug}`
  const title = props.episode?.title || 'Check out this episode on DIA Radio'
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
      // Could add a toast here if dia-web has one
    }
  } catch (err) {
    if (err?.name !== 'AbortError') {
      await navigator.clipboard.writeText(url).catch(() => {})
    }
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
