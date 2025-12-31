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
import { ref, onMounted, computed } from 'vue'
import { usePlayer } from '@/composables/usePlayer.js'
import PodcastGrid from '@/components/podcast/PodcastGrid.vue'
import { useInfiniteObserver } from '@/composables/useInfiniteObserver'
import { authedFetch } from '@/lib/authClient'

const { isEpisodePlaying, toggleEpisode } = usePlayer()

// API base URL
const viteEnv = (globalThis)?.import?.meta?.env
const baseUrl = viteEnv?.VITE_CONTENT_API_URL || 'https://content.diaradio.live/api'
const mediaBase = baseUrl.replace(/\/api$/, '')

// Page state
const items = ref([])
const page = ref(0)
const totalPages = ref(0)
const isLoading = ref(false)
const error = ref(null)
const abortController = ref(null)

// Helper to dedupe items by ID
function dedupeItems(existing, newItems) {
  const existingIds = new Set(existing.map(item => item.id))
  return newItems.filter(item => !existingIds.has(item.id))
}

// Helper function for absolute media URLs
function absoluteMediaUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `${mediaBase}${path}`
}

function formatDateFR(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).split('/').join('.')
}

// Helper to extract string value from mood/tone/energy (handles both string and object)
function extractStringValue(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  // If it's an object, try common property names
  return value.value || value.name || value.label || ''
}

// Fetch episodes
async function fetchEpisodes(pageNum = 1) {
  // Cancel previous request if exists
  if (abortController.value) {
    abortController.value.abort()
  }
  
  // Create new abort controller
  abortController.value = new AbortController()
  isLoading.value = true
  error.value = null
  
  try {
    const url = `/episodes?where[and][0][publishedStatus][equals]=published&sort=-firstAiredAt&limit=20&page=${pageNum}&depth=1`
    
    const res = await authedFetch(url, { signal: abortController.value.signal })
    const json = await res.json()
    
    const episodes = json.docs.map((track) => {
      const coverUrl = track.cover?.url || track.show?.cover?.url
      const date = track.firstAiredAt || track.createdAt
      
      return {
        id: track.id,
        track_id: track.track_id,
        title: track.title || 'Untitled',
        realDuration: track.realDuration,
        description: track.description || '',
        audioUrl: `https://stream.diaradio.live/stream/${track.track_id}`,
        image: absoluteMediaUrl(coverUrl) || '/img/fallback-live.jpg',
        genres: Array.isArray(track.genres)
          ? track.genres.map((g) => typeof g === 'string' ? g : g.name).filter(Boolean)
          : [],
        formattedDate: formatDateFR(date),
        energy: extractStringValue(track.energy),
        mood: extractStringValue(track.mood),
        tone: extractStringValue(track.tone),
      }
    })
    
    // Append new items with deduplication
    items.value = pageNum === 1 ? episodes : [...items.value, ...dedupeItems(items.value, episodes)]
    page.value = pageNum
    totalPages.value = json.totalPages
  } catch (err) {
    if (err.name === 'AbortError') {
      return
    }
    console.error('❌ Failed to fetch episodes:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
    abortController.value = null
  }
}

// Load next page
async function loadNext() {
  if (isLoading.value || page.value >= totalPages.value) {
    return
  }
  
  await fetchEpisodes(page.value + 1)
}

// Setup infinite scroll observer
const { infiniteSentinel } = useInfiniteObserver(loadNext)

// Initialize
onMounted(async () => {
  if (items.value.length === 0) {
    await fetchEpisodes(1)
  }
})
</script>

