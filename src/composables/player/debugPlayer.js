/**
 * Debug utility to monitor player state and detect issues
 * Enable with: window.DIA_DEBUG = true
 */

export function setupPlayerDebugging() {
  if (typeof window === 'undefined') return
  
  const debugLog = []
  
  function log(event, data) {
    const entry = {
      timestamp: Date.now(),
      event,
      data
    }
    debugLog.push(entry)
    console.log(`[PLAYER DEBUG] ${event}`, data)
    
    // Keep only last 100 entries
    if (debugLog.length > 100) {
      debugLog.shift()
    }
  }
  
  // Monitor audio element state
  function monitorAudioElement(audio) {
    if (!audio) {
      log('MONITOR_ERROR', { message: 'No audio element provided' })
      return
    }
    
    log('MONITOR_STARTED', { audioSrc: audio.src, audioElement: audio })
    
    // Check every 2 seconds
    const interval = setInterval(() => {
      const state = {
        paused: audio.paused,
        ended: audio.ended,
        readyState: audio.readyState,
        networkState: audio.networkState,
        currentTime: audio.currentTime,
        duration: audio.duration,
        src: audio.src,
        error: audio.error ? {
          code: audio.error.code,
          message: audio.error.message
        } : null
      }
      
      // Detect issues
      if (!audio.paused && audio.ended) {
        log('ISSUE_DETECTED', { type: 'playback_ended_unexpectedly', state })
      }
      
      if (!audio.paused && audio.networkState === 2) {
        log('ISSUE_DETECTED', { type: 'network_error', state })
      }
      
      if (!audio.paused && audio.readyState < 2) {
        log('ISSUE_DETECTED', { type: 'low_ready_state', state })
      }
      
      if (audio.error) {
        log('ISSUE_DETECTED', { type: 'audio_error', state })
      }
      
      // Detect if playback stopped unexpectedly (was playing, now paused)
      const wasPlaying = !audio.paused
      if (wasPlaying && audio.paused && !audio.ended) {
        log('ISSUE_DETECTED', { type: 'playback_stopped_unexpectedly', state })
      }
      
      log('STATE_CHECK', state)
    }, 2000)
    
    // Monitor all audio events
    const events = [
      'play', 'pause', 'ended', 'error', 'stalled', 'suspend',
      'abort', 'emptied', 'loadstart', 'loadeddata', 'loadedmetadata',
      'canplay', 'canplaythrough', 'waiting', 'playing', 'seeking', 'seeked',
      'timeupdate', 'durationchange', 'volumechange', 'ratechange'
    ]
    
    events.forEach(eventName => {
      audio.addEventListener(eventName, (e) => {
        log(`AUDIO_EVENT_${eventName.toUpperCase()}`, {
          type: e.type,
          target: {
            paused: audio.paused,
            ended: audio.ended,
            readyState: audio.readyState,
            networkState: audio.networkState,
            currentTime: audio.currentTime
          }
        })
      })
    })
    
    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      log('VISIBILITY_CHANGE', {
        hidden: document.hidden,
        audioState: {
          paused: audio.paused,
          ended: audio.ended,
          readyState: audio.readyState,
          networkState: audio.networkState
        }
      })
    })
    
    // Monitor page focus
    window.addEventListener('blur', () => {
      log('WINDOW_BLUR', {
        audioState: {
          paused: audio.paused,
          ended: audio.ended,
          readyState: audio.readyState,
          networkState: audio.networkState
        }
      })
    })
    
    window.addEventListener('focus', () => {
      log('WINDOW_FOCUS', {
        audioState: {
          paused: audio.paused,
          ended: audio.ended,
          readyState: audio.readyState,
          networkState: audio.networkState
        }
      })
    })
    
    return () => {
      clearInterval(interval)
    }
  }
  
  // Expose debug functions to window
  window.__DIA_PLAYER_DEBUG__ = {
    log,
    getLogs: () => [...debugLog],
    clearLogs: () => { debugLog.length = 0 },
    monitorAudioElement,
    getAudioState: (audio) => {
      if (!audio) return null
      return {
        paused: audio.paused,
        ended: audio.ended,
        readyState: audio.readyState,
        networkState: audio.networkState,
        currentTime: audio.currentTime,
        duration: audio.duration,
        src: audio.src,
        error: audio.error,
        buffered: audio.buffered.length > 0 ? {
          start: audio.buffered.start(0),
          end: audio.buffered.end(0)
        } : null
      }
    }
  }
  
  console.log('[PLAYER DEBUG] Debugging enabled. Use window.__DIA_PLAYER_DEBUG__ to access debug functions')
}

