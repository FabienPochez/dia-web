/**
 * Shared episodes list for PodcastList and WaitingPage (episode modal by slug).
 * Reuses loading logic and avoids duplicate network calls.
 */
import { ref, shallowRef } from 'vue'
import { authedFetch } from '@/lib/authClient'

const viteEnv = (globalThis)?.import?.meta?.env
const baseUrl = viteEnv?.VITE_CONTENT_API_URL || 'https://content.diaradio.live/api'
const mediaBase = baseUrl.replace(/\/api$/, '')

// Shared state (singleton)
const items = shallowRef([])
const page = ref(0)
const totalPages = ref(0)
const isLoading = ref(false)
const error = ref(null)
let abortController = null

function dedupeItems(existing, newItems) {
  const existingIds = new Set(existing.map((item) => item.id))
  return newItems.filter((item) => !existingIds.has(item.id))
}

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

function extractStringValue(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.value || value.name || value.label || ''
}

function mapTrackToItem(track) {
  const coverUrl = track.cover?.url || track.show?.cover?.url
  const date = track.firstAiredAt || track.createdAt
  return {
    id: track.id,
    slug: track.slug,
    track_id: track.track_id,
    title: track.title || 'Untitled',
    realDuration: track.realDuration,
    description: track.description || '',
    audioUrl: `https://stream.diaradio.live/stream/${track.track_id}`,
    image: absoluteMediaUrl(coverUrl) || '/img/fallback-live.jpg',
    genres: Array.isArray(track.genres)
      ? track.genres.map((g) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
      : [],
    formattedDate: formatDateFR(date),
    energy: extractStringValue(track.energy),
    mood: extractStringValue(track.mood),
    tone: extractStringValue(track.tone),
  }
}

/**
 * @param {number} pageNum
 * @returns {Promise<void>}
 */
async function fetchEpisodes(pageNum = 1) {
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()
  isLoading.value = true
  error.value = null

  try {
    const url = `/episodes?where[and][0][publishedStatus][equals]=published&sort=-firstAiredAt&limit=20&page=${pageNum}&depth=1`
    const res = await authedFetch(url, { signal: abortController.signal })
    const json = await res.json()

    const episodes = json.docs.map(mapTrackToItem)
    items.value = pageNum === 1 ? episodes : [...items.value, ...dedupeItems(items.value, episodes)]
    page.value = pageNum
    totalPages.value = json.totalPages
  } catch (err) {
    if (err.name === 'AbortError') return
    console.error('❌ Failed to fetch episodes:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
    abortController = null
  }
}

async function loadNext() {
  if (isLoading.value || page.value >= totalPages.value) return
  await fetchEpisodes(page.value + 1)
}

/** Find episode by slug in loaded items */
function findEpisodeBySlug(slug) {
  return items.value.find((e) => e.slug === slug) || null
}

/** Convert list item to playback shape for toggleEpisode */
function toPlaybackShape(item) {
  return {
    id: item.id,
    src: item.audioUrl,
    title: item.title,
    realDuration: item.realDuration,
    cover: item.image,
    genres: item.genres || [],
    energy: item.energy || '',
    mood: item.mood || '',
    tone: item.tone || '',
    pubDateFormatted: item.formattedDate,
    pubDate: item.formattedDate,
  }
}

export function useEpisodes() {
  return {
    items,
    page,
    totalPages,
    isLoading,
    error,
    fetchEpisodes,
    loadNext,
    findEpisodeBySlug,
    toPlaybackShape,
  }
}
