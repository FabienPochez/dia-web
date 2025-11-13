import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'
import { getNowPlaying } from '@/api/payload/schedule'
import { registerAppLifecycle, isAppActive } from '@/composables/useAppLifecycle.js'

// Shared state for live schedule data
const currentShow = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isRefreshing = ref(false)

let activeTimeout = null
let heartbeatTimeout = null
let lifecycleUnregister = null
let appIsActive = typeof window === 'undefined' ? true : isAppActive()

const PRE_ROLL_MS = 90_000
const CONFIRM_MS = 30_000
const HEARTBEAT_MS = 5 * 60_000
const JITTER_RANGE_MS = 20_000
let fetchCount = 0

// Cover image resolver
function absoluteMediaUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `https://content.diaradio.live${path}`
}

// Computed properties for live show data
const liveMeta = computed(() => ({
  title: currentShow.value?.title || 'Dia Radio Live Feed',
  cover: currentShow.value?.cover?.url ? absoluteMediaUrl(currentShow.value.cover.url) : '/img/fallback-live.jpg'
}))

const timeRange = computed(() => {
  if (!currentShow.value?.scheduledAt || !currentShow.value?.scheduledEnd) return 'LIVE'
  const start = new Date(currentShow.value.scheduledAt).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  })
  const end = new Date(currentShow.value.scheduledEnd).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  })
  return `${start} – ${end}`
})

// Fetch live schedule data
async function fetchLiveSchedule(isInitialLoad = false) {
  fetchCount++
  try {
    if (isInitialLoad) {
      isLoading.value = true
    } else {
      isRefreshing.value = true
    }
    error.value = null
    
    const result = await getNowPlaying()
    console.log('🎵 useLiveSchedule getNowPlaying result:', result)
    currentShow.value = result
    scheduleNextTimers(result)
  } catch (err) {
    error.value = err.message
    console.warn('⚠️ useLiveSchedule failed to fetch current show:', err.message)
  } finally {
    if (isInitialLoad) {
      isLoading.value = false
    } else {
      isRefreshing.value = false
    }
  }
}

function jitter() {
  return (Math.random() - 0.5) * JITTER_RANGE_MS
}

function clearTimers() {
  if (activeTimeout) {
    clearTimeout(activeTimeout)
    activeTimeout = null
  }
  if (heartbeatTimeout) {
    clearTimeout(heartbeatTimeout)
    heartbeatTimeout = null
  }
}

function scheduleHeartbeat() {
  heartbeatTimeout = setTimeout(() => {
    heartbeatTimeout = null
    if (!appIsActive) return
    console.log('[LiveSchedule] heartbeat fetch')
    fetchLiveSchedule(false)
  }, HEARTBEAT_MS + jitter())
}

function scheduleNextTimers(show) {
  clearTimers()
  scheduleHeartbeat()

  if (!show?.scheduledEnd) return

  const now = Date.now()
  const end = new Date(show.scheduledEnd).getTime()
  if (Number.isNaN(end)) return

  const preDelay = Math.max(0, end - now - PRE_ROLL_MS + jitter())
  const confirmDelay = Math.max(0, end - now + CONFIRM_MS + jitter())

  const tick = async (label) => {
    if (!appIsActive) return
    console.log(`[LiveSchedule] boundary tick: ${label}`)
    await fetchLiveSchedule(false)
  }

  activeTimeout = setTimeout(() => tick('pre-roll'), preDelay)
  heartbeatTimeout = setTimeout(() => tick('confirm'), confirmDelay)
}

function startSchedule() {
  if (!appIsActive) return
  if (!currentShow.value) {
    fetchLiveSchedule(true)
  } else {
    scheduleNextTimers(currentShow.value)
  }
}

function stopSchedule() {
  clearTimers()
}

// Auto-start polling when composable is first used
let usageCount = 0
function trackUsage() {
  usageCount++
  ensureLifecycleHook()
  if (usageCount === 1) {
    startSchedule()
  }
}

function untrackUsage() {
  usageCount--
  if (usageCount <= 0) {
    usageCount = 0
    stopSchedule()
    if (lifecycleUnregister) {
      lifecycleUnregister()
      lifecycleUnregister = null
    }
  }
}

function ensureLifecycleHook() {
  if (lifecycleUnregister || typeof window === 'undefined') return
  lifecycleUnregister = registerAppLifecycle({
    onForeground: () => {
      appIsActive = true
      if (usageCount > 0) startSchedule()
    },
    onBackground: () => {
      appIsActive = false
      stopSchedule()
    }
  })
}

export function useLiveSchedule() {
  // Track usage for auto-start/stop
  onMounted(() => {
    trackUsage()
  })
  
  onUnmounted(() => {
    untrackUsage()
  })
  
  return {
    // Live show data
    currentShow: readonly(currentShow),
    liveMeta,
    timeRange,
    
    // Loading states
    isLoading: readonly(isLoading),
    isRefreshing: readonly(isRefreshing),
    error: readonly(error),
    
    // Manual control (if needed)
    fetchLiveSchedule,
    startSchedule,
    stopSchedule,
    getFetchCount: () => fetchCount
  }
}

