import { authedFetch } from '@/lib/authClient'
import { todayRangeISO } from '@/lib/timezone'

type ScheduleItem = {
  _id: string
  title: string
  scheduledAt: string
  scheduledEnd: string
  showHandle?: string
  cover?: any
}

export async function getNowPlaying({ signal }: { signal?: AbortSignal } = {}): Promise<ScheduleItem | null> {
  const now = new Date().toISOString()
  
  const params = new URLSearchParams()
  params.set('where[and][0][scheduledAt][less_than_or_equal]', now)
  params.set('where[and][1][scheduledEnd][greater_than]', now)
  params.set('where[and][2][scheduledAt][exists]', 'true')
  params.set('sort', 'scheduledAt')
  params.set('limit', '50')
  params.set('depth', '1')

  const res = await authedFetch(`/episodes?${params.toString()}`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const json = await res.json()
  
  return json.docs?.[0] ?? null
}

export async function getTodayUpcoming({ signal, limit = 20 }: { signal?: AbortSignal; limit?: number } = {}): Promise<ScheduleItem[]> {
  const { start, end } = todayRangeISO()
  const params = new URLSearchParams()
  params.set('where[and][0][scheduledAt][greater_than_or_equal]', start)
  params.set('where[and][1][scheduledAt][less_than]', end)
  params.set('where[and][2][scheduledAt][exists]', 'true')
  params.set('sort', 'scheduledAt')
  params.set('limit', String(limit))
  params.set('depth', '1')

  const res = await authedFetch(`/episodes?${params.toString()}`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const json = await res.json()
  return json?.docs ?? []
}

