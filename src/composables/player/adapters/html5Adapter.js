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
      if (__DBG__) console.log('[AUDIO API] play() called', {
        paused: audio.paused,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
      try {
        await audio.play()
        if (__DBG__) console.log('✅ audio.play() successful');
      } catch (e) {
        if (__DBG__) console.warn('❌ audio.play() failed:', e);
        
        // If play was interrupted by pause, check if we should retry
        if (e.name === 'AbortError' && e.message?.includes('interrupted by a call to pause')) {
          if (__DBG__) console.warn('[AUDIO] Play interrupted by pause - checking if should retry...');
          // Wait a bit and check if audio should actually be playing
          await new Promise(resolve => setTimeout(resolve, 100));
          // If audio is not paused and we think it should be playing, retry
          if (!audio.paused || adapter.isPlaying) {
            if (__DBG__) console.log('[AUDIO] Retrying play() after interruption');
            try {
              await audio.play()
              if (__DBG__) console.log('✅ audio.play() retry successful');
            } catch (retryError) {
              if (__DBG__) console.warn('❌ audio.play() retry failed:', retryError);
              throw retryError
            }
          } else {
            if (__DBG__) console.log('[AUDIO] Not retrying - audio should be paused');
            throw e
          }
        } else {
          throw e
        }
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
      if (__DBG__) console.log('[AUDIO EVT] pause', {
        paused: a.paused,
        ended: a.ended,
        readyState: a.readyState,
        networkState: a.networkState,
        error: a.error,
        currentTime: a.currentTime,
        src: a.src
      }); 
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
        if (__DBG__) console.log('[AUDIO] Page hidden', {
          paused: audio.paused,
          isPlaying: adapter.isPlaying,
          readyState: audio.readyState,
          networkState: audio.networkState
        });
      } else {
        if (__DBG__) console.log('[AUDIO] Page visible again', {
          paused: audio.paused,
          isPlaying: adapter.isPlaying,
          readyState: audio.readyState,
          networkState: audio.networkState,
          error: audio.error
        });
        
        // Check if audio was paused silently (browser paused it without firing pause event)
        // But only if it's been paused for a moment (not just transitioning from play())
        if (adapter.isPlaying && audio.paused && !audio.ended) {
          // Give it a moment - play() might be in progress
          setTimeout(() => {
            if (adapter.isPlaying && audio.paused && !audio.ended) {
              if (__DBG__) console.warn('[AUDIO] ⚠️ Audio paused silently - was playing but now paused after visibility change');
              // Sync state - audio is actually paused
              isPlaying = false
              adapter.isPlaying = false
              emit('pause');
              adapter.emitTimeUpdate?.();
              logPlayerEvent('Audio paused (silent)')
              adapter.stopPlaybackMonitor?.()
            }
          }, 200)
        }
      }
    })
  }

  // Setup playback monitoring
  const setupPlaybackMonitor = () => {
    if (playbackInterval) return
    
    playbackInterval = setInterval(() => {
      // Check for state mismatches in both directions
      
      // Case 1: Player thinks it's playing but audio is paused
      if (isPlaying && audio.paused && !audio.ended) {
        // Check both cases: if playback started (lastTime > 0) OR if it never started but should have (readyState check)
        const neverStarted = lastTime === 0 && audio.readyState === 0 && audio.networkState === 1
        
        if (lastTime > 0 || neverStarted) {
          if (__DBG__) console.warn('[AUDIO] ⚠️ Silent pause detected: was playing but audio is now paused', {
            lastTime,
            readyState: audio.readyState,
            networkState: audio.networkState,
            neverStarted
          });
          // Sync state - audio is actually paused
          isPlaying = false
          adapter.isPlaying = false
          emit('pause');
          adapter.emitTimeUpdate?.();
          logPlayerEvent('Audio paused (silent)')
          adapter.stopPlaybackMonitor?.()
          return
        }
      }
      
      // Case 2: Player thinks it's paused but audio is actually playing
      if (!isPlaying && !audio.paused && !audio.ended && audio.readyState >= 2) {
        if (__DBG__) console.warn('[AUDIO] ⚠️ Silent play detected: was paused but audio is now playing', {
          lastTime,
          readyState: audio.readyState,
          networkState: audio.networkState,
          currentTime: audio.currentTime
        });
        // Sync state - audio is actually playing
        isPlaying = true
        adapter.isPlaying = true
        emit('play');
        adapter.emitTimeUpdate?.();
        logPlayerEvent('Audio playing (silent)')
        adapter.startPlaybackMonitor?.()
        // Don't return - continue to update time
      }
      
      // Only update time if we think we're playing
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
  
  // Setup debugging if enabled (check again after a short delay in case debug utility loads after adapter)
  if (__DBG__ && typeof window !== 'undefined') {
    const tryAttachDebug = () => {
      if (window.__DIA_PLAYER_DEBUG__) {
        console.log('[AUDIO] Attaching debug monitor to audio element')
        window.__DIA_PLAYER_DEBUG__.monitorAudioElement(audio)
      } else {
        // Retry a few times
        setTimeout(tryAttachDebug, 200)
      }
    }
    setTimeout(tryAttachDebug, 100)
  }

  return adapter
}

