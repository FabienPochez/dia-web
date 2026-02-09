/**
 * Fetch episode by slug from Payload CMS.
 * Returns normalized episode object for modal/playback, or null if not found.
 */
import { authedFetch } from '@/lib/authClient'

const API_URL = (globalThis as any)?.import?.meta?.env?.VITE_CONTENT_API_URL || 'https://content.diaradio.live/api'
const MEDIA_BASE = API_URL.replace(/\/api$/, '')

function absoluteMediaUrl(path: string | undefined | null): string | null {
  if (!path) return null
  return path.startsWith('http') ? path : `${MEDIA_BASE}${path}`
}

function formatDateFR(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).split('/').join('.')
}

function extractStringValue(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  const obj = value as { value?: string; name?: string; label?: string }
  return obj.value || obj.name || obj.label || ''
}

/** Episode shape for modal display and playback */
export interface EpisodeForModal {
  id: string
  slug?: string
  track_id?: string
  title: string
  realDuration?: number
  description?: string
  src: string
  cover: string
  genres: string[]
  energy?: string
  mood?: string
  tone?: string
  formattedDate?: string | null
  firstAiredAt?: string
  show?: { id: string; title?: string }
}

function mapPayloadDocToEpisode(doc: Record<string, unknown>): EpisodeForModal {
  const coverUrl = (doc.cover as { url?: string })?.url || (doc.show as { cover?: { url?: string } })?.cover?.url
  const date = (doc.firstAiredAt || doc.createdAt) as string | undefined
  const genres = Array.isArray(doc.genres)
    ? (doc.genres as unknown[]).map((g) => (typeof g === 'string' ? g : (g as { name?: string })?.name)).filter(Boolean)
    : []

  return {
    id: String(doc.id),
    slug: doc.slug as string | undefined,
    track_id: doc.track_id as string | undefined,
    title: (doc.title as string) || 'Untitled',
    realDuration: doc.realDuration as number | undefined,
    description: (doc.description as string) || '',
    src: doc.track_id
      ? `https://stream.diaradio.live/stream/${doc.track_id}`
      : '',
    cover: absoluteMediaUrl(coverUrl) || '/img/fallback-live.jpg',
    genres,
    energy: extractStringValue(doc.energy),
    mood: extractStringValue(doc.mood),
    tone: extractStringValue(doc.tone),
    formattedDate: formatDateFR(date),
    firstAiredAt: date,
    show: doc.show && typeof doc.show === 'object'
      ? { id: String((doc.show as { id?: string }).id), title: (doc.show as { title?: string }).title }
      : undefined,
  }
}

export async function fetchEpisodeBySlug(slug: string): Promise<EpisodeForModal | null> {
  const params = new URLSearchParams({
    'where[slug][equals]': slug,
    'limit': '1',
    'depth': '2',
  })
  const res = await authedFetch(`/episodes?${params.toString()}`)
  if (!res.ok) return null
  const data = await res.json()
  const docs = data.docs
  if (!docs || docs.length === 0) return null
  return mapPayloadDocToEpisode(docs[0])
}
