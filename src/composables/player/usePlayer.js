import { reactive, readonly, ref, computed } from 'vue'
import { createHtml5Adapter } from './adapters/html5Adapter'
import { registerAppLifecycle, isAppActive } from '@/composables/useAppLifecycle.js'

const __DBG__ = Boolean(globalThis.DIA_DEBUG)

// Adapter singleton
let __adapter = null
let lifecycleUnregister = null
let appIsActive = typeof window === 'undefined' ? true : isAppActive()

// Reactive state
const state = reactive({
  current: {
    id: '',
    title: '',
    src: '',
    mode: '',
    cover: '',
    genres: [],
    energy: '',
    mood: '',
    tone: '',
    firstAiredAt: ''
  },
  isPlaying: false
})

// Refs
export const audioRef = ref(null)
const isPlayingRef = ref(false)
const currentTimeRef = ref(0)
const durationRef = ref(null)
const isLiveRef = ref(false)
const seekBusyRef = ref(false)
const uiTimeRef = ref(0)
const isUiFrozenRef = ref(false)

// Stream reconnect state (simplified for web)
const isReconnectingRef = ref(false)
const retryCountRef = ref(0)
const outageStartedAtRef = ref(null)

function selectAdapterOnce() {
  if (__adapter) return __adapter
  
  __adapter = createHtml5Adapter()
  
  // Wire audioRef
  try { 
    audioRef.value = __adapter.getAudio?.() || null 
  } catch (e) {
    if (__DBG__) console.warn('[PLAYER] Failed to get HTML5 audio element:', e)
  }
  
  // Wire state sync
  setupStateSync()
  
  return __adapter
}

function ensureLifecycle() {
  if (lifecycleUnregister || typeof window === 'undefined') return
  lifecycleUnregister = registerAppLifecycle({
    onForeground: () => {
      appIsActive = true
      if (state.isPlaying && __adapter?.startPlaybackMonitor) {
        __adapter.startPlaybackMonitor()
      }
    },
    onBackground: () => {
      appIsActive = false
      if (__adapter?.stopPlaybackMonitor) {
        __adapter.stopPlaybackMonitor()
      }
    }
  })
}

// Set up event listeners to keep state in sync
let stateSyncWired = false
function setupStateSync() {
  if (stateSyncWired) return
  stateSyncWired = true
  
  const adapter = selectAdapterOnce()
  
  adapter.on?.('play', () => { 
    if (__DBG__) console.log('[FACADE EVT] play'); 
    state.isPlaying = true
    isPlayingRef.value = true
  })
  
  adapter.on?.('pause', () => { 
    if (__DBG__) console.log('[FACADE EVT] pause'); 
    state.isPlaying = false
    isPlayingRef.value = false
  })
  
  adapter.on?.('time', ({ current, duration }) => {
    currentTimeRef.value = current
    uiTimeRef.value = current
    if (!isLiveRef.value && duration > 0) {
      durationRef.value = duration
    }
  })
  
  adapter.on?.('durationchange', (duration) => {
    if (!isLiveRef.value && duration > 0) {
      durationRef.value = duration
    }
  })
  
  adapter.on?.('loadedmetadata', (duration) => {
    if (!isLiveRef.value && duration > 0) {
      durationRef.value = duration
    }
  })
}

ensureLifecycle()

// Helper functions
function isEpisodePlaying(episodeId) {
  return state.current.mode === 'podcast' && state.current.id === episodeId && state.isPlaying
}

async function toggleEpisode(episode) {
  if (state.current.mode === 'podcast' && state.current.id === episode.id && state.isPlaying) {
    pause()
  } else {
    await setAndPlay({
      id: episode.id,
      src: episode.src,
      title: episode.title,
      mode: 'podcast',
      cover: episode.cover ?? '',
      genres: episode.genres || [],
      energy: episode.energy || '',
      mood: episode.mood || '',
      tone: episode.tone || '',
      realDuration: episode.realDuration,
      episodeDate: episode.pubDateFormatted || episode.pubDate
    })
  }
}

async function setSource({ id, src, title, mode = 'podcast', cover = '', genres, energy, mood, tone, realDuration, episodeDate }) {
  if (__DBG__) console.log('[FACADE API] setSource()', { id, src, title, mode });
  
  const adapter = selectAdapterOnce()
  
  // Reset time on new source
  const isNewStream = state.current.src !== src || state.current.mode !== mode
  if (isNewStream) {
    currentTimeRef.value = 0
    durationRef.value = null
    uiTimeRef.value = 0
    seekBusyRef.value = false
    
    // Live/podcast detection
    if (mode === 'live') {
      isLiveRef.value = true
      durationRef.value = 0
    } else if (mode === 'podcast') {
      isLiveRef.value = false
      const metadataDuration = Number.isFinite(realDuration) && realDuration > 0 ? realDuration : 0
      if (metadataDuration > 0) {
        durationRef.value = metadataDuration
      } else {
        durationRef.value = null
      }
    }
    
    // Load new source
    try {
      await adapter.load({
        url: src,
        title,
        artwork: cover,
        live: mode === 'live',
        autoplay: false
      })
      
      audioRef.value = adapter.getAudio?.() || null
    } catch (e) {
      if (__DBG__) console.warn('Load interrupted or blocked:', e)
    }
  }

  // Update state
  state.current.id = id
  state.current.title = title
  state.current.src = src
  state.current.mode = mode
  state.current.cover = cover
  state.current.energy = energy || ''
  state.current.mood = mood || ''
  state.current.tone = tone || ''
  state.current.realDuration = realDuration
  state.current.firstAiredAt = episodeDate || ''

  if (Array.isArray(genres)) {
    state.current.genres = genres
  }

  state.isPlaying = false
  isPlayingRef.value = false

  return !!isNewStream
}

async function play() {
  if (__DBG__) console.log('[FACADE] play() called')
  const adapter = selectAdapterOnce()
  await adapter.play()
}

function pause() {
  const adapter = selectAdapterOnce()
  adapter.pause()
  
  state.isPlaying = false
  isPlayingRef.value = false
}

async function seek(seconds) {
  if (isLiveRef.value) {
    if (__DBG__) console.log('[FACADE API] seek() blocked - live mode');
    return;
  }
  
  const maxDuration = (state.current.realDuration ?? durationRef.value ?? 0) - 1
  if (maxDuration <= 0) {
    if (__DBG__) console.log('[FACADE API] seek() blocked - no duration available');
    return;
  }
  
  const target = Math.floor(Math.min(seconds, maxDuration))
  seekBusyRef.value = true
  
  try {
    const adapter = selectAdapterOnce()
    await adapter.seek(target)
    currentTimeRef.value = target
    uiTimeRef.value = target
  } catch (e) {
    if (__DBG__) console.warn('[FACADE] seek error:', e)
  } finally {
    seekBusyRef.value = false
  }
}

async function setAndPlay({ id, src, title, mode = 'podcast', cover = '', genres, energy, mood, tone, realDuration, episodeDate }) {
  if (!src) return
  if (__DBG__) console.log('[PLAYER] setAndPlay', { id, title, mode })

  await setSource({ id, src, title, mode, cover, genres, energy, mood, tone, realDuration, episodeDate })
  
  try {
    await play()
  } catch (e) {
    if (__DBG__) console.warn('[PLAYER] play() failed:', e)
  }
}

async function setDefaultLive() {
  setSource({
    id: LIVE_ID,
    title: 'Dia! Live Radio',
    src: 'https://livestream.diaradio.live/main',
    mode: 'live',
    cover: ''
  })
  
  try {
    const { getNowPlaying } = await import('@/api/payload/schedule')
    const result = await getNowPlaying()
    if (result) {
      const coverUrl = result.cover?.url ? 
        (result.cover.url.startsWith('http') ? result.cover.url : `https://content.diaradio.live${result.cover.url}`) : 
        '/img/fallback-live.jpg'
      
      setSource({
        id: LIVE_ID,
        title: result.title || 'Dia Radio Live Feed',
        src: 'https://livestream.diaradio.live/main',
        mode: 'live',
        cover: coverUrl
      })
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('⚠️ setDefaultLive failed to fetch current show:', err.message)
  }
}

function updateMeta(metadata) {
  Object.assign(state.current, metadata)
}

function updateNowPlayingMetadata(metadata) {
  // Web-only: update MediaSession if available
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title || state.current.title,
      artist: metadata.artistName || 'DIA! Radio',
      album: 'DIA! Radio',
      artwork: [
        { src: metadata.artworkSource || state.current.cover || '/img/fallback-live.jpg', sizes: '512x512', type: 'image/jpeg' }
      ]
    })
  }
}

function cleanup() {
  if (__adapter?.stopPlaybackMonitor) {
    __adapter.stopPlaybackMonitor()
  }
  
  if (__adapter) {
    __adapter.teardown()
    __adapter = null
  }
}

// Computed properties
const isPlaying = computed(() => isPlayingRef.value)
const currentTime = computed(() => currentTimeRef.value)
const displayCurrentTime = computed(() => uiTimeRef.value)
const duration = computed(() => durationRef.value)
const isLive = computed(() => isLiveRef.value)
const seekBusy = computed(() => seekBusyRef.value)

function isOutageWindow() {
  const now = new Date()
  const minute = now.getMinutes()
  return minute >= 0 && minute <= 3
}

export function usePlayer() {
  selectAdapterOnce()
  
  return {
    current: readonly(state.current),
    setSource,
    setAndPlay,
    play,
    pause,
    seek,
    isEpisodePlaying,
    toggleEpisode,
    isPlaying,
    currentTime,
    displayCurrentTime,
    duration,
    isLive,
    audioRef: readonly(audioRef),
    setDefaultLive,
    updateMeta,
    updateNowPlayingMetadata,
    seekBusy,
    uiTimeRef,
    isUiFrozenRef,
    isStalled: computed(() => false),
    isReconnecting: readonly(isReconnectingRef),
    retryCount: readonly(retryCountRef),
    outageStartedAt: readonly(outageStartedAtRef),
    isOutageWindow: computed(() => isOutageWindow()),
    cleanup,
    getAdapterType: () => 'html5'
  }
}

// Export constants
export const LIVE_ID = 'live-radio'

// Export the activateAudioSession function (no-op for web)
export const activateAudioSession = async () => {
  // No-op for web
}

// Export the init function for app boot (no-op for web)
export const initPlayerBuildGate = async () => {
  // No-op for web
}

