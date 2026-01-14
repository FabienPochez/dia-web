# Immediate Debug Check

Since the stream stopped with no logs, run these commands in the browser console to check what happened:

## 1. Check if debug is working:
```javascript
console.log('Debug enabled:', window.DIA_DEBUG)
console.log('Debug utility:', window.__DIA_PLAYER_DEBUG__)
```

## 2. Find the audio element:
```javascript
// Try different ways to find it
const audio1 = document.querySelector('audio')
const audio2 = document.querySelector('audio[src*="livestream"]')
const audio3 = document.body.querySelector('audio')

console.log('Audio elements found:', { audio1, audio2, audio3 })

// Or check all audio elements
const allAudio = document.querySelectorAll('audio')
console.log('All audio elements:', Array.from(allAudio))
```

## 3. Check current audio state:
```javascript
const audio = document.querySelector('audio') || document.body.querySelector('audio')

if (audio) {
  console.log('=== AUDIO STATE ===')
  console.log('paused:', audio.paused)
  console.log('ended:', audio.ended)
  console.log('readyState:', audio.readyState, '(0=nothing, 1=metadata, 2=current data, 3=future data, 4=enough data)')
  console.log('networkState:', audio.networkState, '(0=empty, 1=idle, 2=loading, 3=no source)')
  console.log('currentTime:', audio.currentTime)
  console.log('duration:', audio.duration)
  console.log('src:', audio.src)
  console.log('error:', audio.error)
  console.log('buffered:', audio.buffered.length > 0 ? {
    start: audio.buffered.start(0),
    end: audio.buffered.end(0)
  } : 'empty')
} else {
  console.log('No audio element found!')
}
```

## 4. Check player state (if accessible):
```javascript
// Try to access Vue component state
const app = document.querySelector('#app').__vue_app__
console.log('Vue app:', app)
```

## 5. Check if debug logs exist:
```javascript
if (window.__DIA_PLAYER_DEBUG__) {
  const logs = window.__DIA_PLAYER_DEBUG__.getLogs()
  console.log('Total logs:', logs.length)
  console.table(logs.slice(-20)) // Last 20 entries
  
  // Filter for issues
  const issues = logs.filter(l => 
    l.event.includes('ISSUE') || 
    l.event.includes('ERROR') || 
    l.event.includes('STALLED') ||
    l.event.includes('PAUSE')
  )
  console.table(issues)
} else {
  console.log('Debug utility not found!')
}
```

## 6. Check network tab:
- Open DevTools Network tab
- Filter for "livestream.diaradio.live"
- Look for failed requests or interrupted connections
- Check if there are any CORS errors

## 7. Check if pause was called programmatically:
```javascript
// Check if there are any recent pause calls in the stack
console.trace('Current stack trace')
```

Run these and share the output!


