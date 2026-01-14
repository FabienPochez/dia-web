# Radio Stream Cutting Out - Investigation Guide

## Potential Issues Found

### 1. **Error/Stalled Events Not Handled**
- The `html5Adapter.js` emits `error` and `stalled` events (lines 190-218)
- But `usePlayer.js` doesn't listen for these events
- When the stream encounters an error or stalls, nothing happens - playback just stops

### 2. **No Visibility Recovery**
- The visibility handler only logs when the page becomes hidden/visible
- Doesn't check if playback stopped when tab was hidden
- Doesn't attempt to resume playback when tab becomes visible again

### 3. **No Network State Monitoring**
- The code doesn't check `audio.networkState` to detect connection issues
- Network state 2 = NETWORK_NO_SOURCE or NETWORK_ERROR
- Could indicate the stream connection was lost

### 4. **Browser Tab Throttling**
- Some browsers throttle background tabs
- Audio may pause when tab is inactive
- No recovery mechanism when tab becomes active again

## How to Investigate

### Enable Debug Mode

1. **In Browser Console:**
   ```javascript
   window.DIA_DEBUG = true
   // Then refresh the page
   ```

2. **Or via Environment Variable:**
   ```bash
   VITE_DIA_DEBUG=1 npm run dev
   ```

### Debug Tools Available

Once debug mode is enabled, you'll have access to:

```javascript
// Get current audio state
window.__DIA_PLAYER_DEBUG__.getAudioState(audioElement)

// View all debug logs
window.__DIA_PLAYER_DEBUG__.getLogs()

// Clear logs
window.__DIA_PLAYER_DEBUG__.clearLogs()
```

### What to Look For

When the stream cuts out, check the console for:

1. **`ISSUE_DETECTED`** entries - These indicate problems:
   - `playback_ended_unexpectedly` - Stream ended when it shouldn't
   - `network_error` - Network connection issue
   - `low_ready_state` - Audio not ready
   - `audio_error` - Audio element error

2. **`AUDIO_EVENT_*`** entries - Shows what events fired:
   - `AUDIO_EVENT_ERROR` - Error occurred
   - `AUDIO_EVENT_STALLED` - Stream stalled
   - `AUDIO_EVENT_ENDED` - Stream ended
   - `AUDIO_EVENT_PAUSE` - Playback paused

3. **`VISIBILITY_CHANGE`** entries - Check if tab visibility correlates with cuts

4. **`STATE_CHECK`** entries - Regular state snapshots every 2 seconds

### Manual Investigation Steps

1. **Open browser console** and enable debug mode
2. **Start playing the live stream**
3. **Monitor the console** for any `ISSUE_DETECTED` entries
4. **When the stream cuts out**, immediately check:
   ```javascript
   // Get the audio element
   const audio = document.querySelector('audio')
   
   // Check its state
   window.__DIA_PLAYER_DEBUG__.getAudioState(audio)
   
   // View recent logs
   const logs = window.__DIA_PLAYER_DEBUG__.getLogs()
   console.table(logs.filter(l => l.event.includes('ISSUE') || l.event.includes('ERROR')))
   ```

5. **Check network tab** in DevTools for failed requests to `livestream.diaradio.live`

6. **Try switching tabs** - Does it cut out when you switch away and come back?

### Common Causes to Check

- **Network interruption** - Check if your internet connection is stable
- **Browser throttling** - Some browsers pause audio in background tabs
- **CORS issues** - Check Network tab for CORS errors
- **Stream server issues** - Verify the stream URL is accessible
- **Browser autoplay policies** - Some browsers block autoplay after user interaction

## Next Steps

After gathering debug information, we can:
1. Add proper error handling
2. Implement automatic reconnection
3. Add visibility recovery
4. Monitor network state
5. Handle browser throttling


