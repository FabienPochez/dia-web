import { ref } from 'vue'
import { logPlayerEvent } from '../../playerLogs.js'

// Constants
export const LIVE_ID = 'live-stream'

// Debug instrumentation
const __DBG__ = Boolean(globalThis.DIA_DEBUG)
const throttle = (fn, ms=1000) => {
  let t=0; return (...args) => { const now=Date.now(); if (now - t >= ms) { t = now; fn(...args) } };
};

export function createHtml5Adapter() {
  const audio = new Audio()
  audio.preload = 'metadata'
  
  // Ensure audio element is in DOM
  if (!audio.isConnected) {
    audio.style.display = 'none'
    document.body.appendChild(audio)
  }
  
  if (__DBG__) console.log('[AUDIO] created', audio, 'inDOM=', !!audio.parentNode);
  
  const state = {
    id: '',
    title: '',
    src: '',
    mode: '',
    cover: '',
    genres: [],
    energy: ''
  }

  let isPlaying = false
  const eventListeners = new Map()
  let playbackInterval = null
  let lastTime = 0

  // Event emitter functionality
  const listeners = new Map()
  const emit = (ev, p) => { 
    const set = listeners.get(ev); 
    if (set) for (const cb of set) cb(p); 
  }

  // Create the adapter object
  const adapter = {
    audio,
    state,
    isPlaying,
    eventListeners,
    playbackInterval,
    lastTime,
    
    // Event emitter methods
    on(ev, cb) { 
      if (!listeners.has(ev)) listeners.set(ev, new Set()); 
      listeners.get(ev).add(cb); 
      return () => listeners.get(ev).delete(cb); 
    },
    
    emit,
    
    // Adapter interface methods
    async load(options) {
      const { url, title, artwork, live, autoplay = false } = options
      if (__DBG__) console.log('[AUDIO] load()', { url: url, title: title });
      
      this.state.src = url
      this.state.title = title
      this.state.cover = artwork
      this.state.mode = live ? 'live' : 'podcast'
      
      audio.src = url
      audio.load()
      
      if (__DBG__) console.log('[AUDIO] load() called; preload=', audio.preload);
      
      // Reset playback state
      this.isPlaying = false
      this.lastTime = 0
      this.pendingAutoplay = autoplay
      
      // Clear any existing intervals
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval)
        this.playbackInterval = null
      }
    },
    
    async play() {
      if (__DBG__) console.log('[AUDIO API] play() called');
      try {
        await audio.play()
        if (__DBG__) console.log('✅ audio.play() successful');
      } catch (e) {
        if (__DBG__) console.warn('❌ audio.play() failed:', e);
        throw e
      }
    },
    
    async pause() {
      if (__DBG__) console.log('[AUDIO API] pause() called');
      audio.pause()
    },
    
    async stop() {
      if (__DBG__) console.log('[AUDIO API] stop() called');
      audio.pause()
      audio.currentTime = 0
      this.isPlaying = false
    },
    
    async seek(seconds) {
      if (__DBG__) console.log('[AUDIO API] seek()', { seconds, before: audio.currentTime });
      audio.currentTime = seconds
      if (__DBG__) console.log('[AUDIO API] seek() applied', { after: audio.currentTime });
      this.emitTimeUpdate?.()
    },
    
    getState() {
      return {
        isPlaying: this.isPlaying,
        currentTime: audio.currentTime,
        duration: audio.duration,
        volume: audio.volume
      }
    },
    
    async getPosition() {
      return {
        current: audio.currentTime,
        duration: audio.duration
      }
    },
    
    async setVolume(volume) {
      audio.volume = Math.max(0, Math.min(1, volume))
    },
    
    getAudio() {
      return audio
    },
    
    isReady() {
      return !!audio && typeof audio.readyState === 'number' && audio.readyState >= 2
    },
    
    async teardown() {
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval)
        this.playbackInterval = null
      }
      audio.pause()
      audio.src = ''
      listeners.clear()
      if (__DBG__) console.log('[AUDIO] teardown complete');
    }
  }

  // Setup audio event handlers
  const setupAudioEventHandlers = () => {
    const a = audio;
    const logTime = throttle(() => {
      if (!__DBG__) return;
      console.log('[AUDIO EVT] timeupdate', { ct: a.currentTime, dur: a.duration });
    }, 1000);

    a.onplay = () => { 
      if (__DBG__) console.log('[AUDIO EVT] play'); 
      isPlaying = true
      adapter.isPlaying = true
      emit('play'); 
      adapter.emitTimeUpdate?.(); 
      logPlayerEvent('Audio playing')
      adapter.startPlaybackMonitor?.()
    }

    a.onpause = () => { 
      if (__DBG__) console.log('[AUDIO EVT] pause'); 
      isPlaying = false
      adapter.isPlaying = false
      emit('pause'); 
      adapter.emitTimeUpdate?.(); 
      logPlayerEvent('Audio paused')
      adapter.stopPlaybackMonitor?.()
    }

    a.onstalled = () => {
      emit('stalled')
      logPlayerEvent('Playback stalled')
    }

    a.onvolumechange = () => {
      emit('volumechange', a.volume)
      logPlayerEvent('Volume changed', {
        volume: a.volume
      })
    }

    a.ondurationchange = () => { 
      if (__DBG__) console.log('[AUDIO EVT] durationchange', { dur: a.duration }); 
      emit('durationchange', a.duration)
      adapter.emitTimeUpdate?.(); 
      logPlayerEvent('Duration changed', {
        duration: a.duration
      })
    }

    a.onerror = () => { 
      if (__DBG__) console.warn('[AUDIO EVT] error', a.error); 
      emit('error', { code: a.error?.code, message: a.error?.message }); 
      logPlayerEvent('Audio error', {
        code: a.error?.code,
        message: a.error?.message
      })
    }

    a.onended = () => {
      emit('ended')
      logPlayerEvent('Playback ended')
    }

    a.ontimeupdate = () => { 
      emit('timeupdate', a.currentTime)
      adapter.emitTimeUpdate?.(); 
    }

    a.onloadedmetadata = () => { 
      if (__DBG__) console.log('[AUDIO EVT] loadedmetadata', { dur: a.duration }); 
      emit('loadedmetadata', a.duration)
      adapter.emitTimeUpdate?.()
      // Handle autoplay after metadata is loaded
      if (adapter.pendingAutoplay) {
        adapter.pendingAutoplay = false
        adapter.play().catch(e => {
          if (__DBG__) console.warn('[AUDIO] Autoplay failed:', e)
        })
      }
    }

    a.onseeking = () => { 
      if (__DBG__) console.log('[AUDIO EVT] seeking'); 
      emit('seeking')
    }

    a.onseeked = () => { 
      if (__DBG__) console.log('[AUDIO EVT] seeked'); 
      emit('seeked')
    }
  }

  // Setup visibility handling
  const setupVisibilityHandling = () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (__DBG__) console.log('[AUDIO] Page hidden');
      } else {
        if (__DBG__) console.log('[AUDIO] Page visible again');
      }
    })
  }

  // Setup playback monitoring
  const setupPlaybackMonitor = () => {
    if (playbackInterval) return
    
    playbackInterval = setInterval(() => {
      if (!isPlaying) return
      
      const currentTime = audio.currentTime
      const duration = audio.duration
      
      if (currentTime !== lastTime || duration) {
        lastTime = currentTime
        
        // Emit time update with current and duration
        emit('time', { current: currentTime, duration: duration })
        
        // Also emit individual events for backward compatibility
        emit('timeupdate', currentTime)
        if (duration) emit('durationchange', duration)
      }
    }, 1000)
  }

  // Add methods to adapter
  adapter.setupAudioEventHandlers = setupAudioEventHandlers
  adapter.setupVisibilityHandling = setupVisibilityHandling
  adapter.setupPlaybackMonitor = setupPlaybackMonitor
  adapter.startPlaybackMonitor = () => setupPlaybackMonitor()
  adapter.stopPlaybackMonitor = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
  }
  adapter.emitTimeUpdate = () => {
    const currentTime = audio.currentTime
    const duration = audio.duration
    emit('time', { current: currentTime, duration: duration })
  }

  // Initialize the adapter
  setupAudioEventHandlers()
  setupVisibilityHandling()

  return adapter
}

