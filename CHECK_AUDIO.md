# Quick Audio State Check

Run this in the browser console to check the audio element state:

```javascript
// Find the audio element
const audio = document.querySelector('audio') || document.body.querySelector('audio')

if (audio) {
  console.log('=== AUDIO ELEMENT STATE ===')
  console.log('paused:', audio.paused)
  console.log('ended:', audio.ended)
  console.log('readyState:', audio.readyState, '(0=nothing, 1=metadata, 2=current data, 3=future data, 4=enough data)')
  console.log('networkState:', audio.networkState, '(0=empty, 1=idle, 2=loading, 3=no source)')
  console.log('currentTime:', audio.currentTime)
  console.log('duration:', audio.duration)
  console.log('volume:', audio.volume)
  console.log('muted:', audio.muted)
  console.log('src:', audio.src)
  console.log('error:', audio.error)
  console.log('buffered:', audio.buffered.length > 0 ? {
    start: audio.buffered.start(0),
    end: audio.buffered.end(0)
  } : 'empty')
  
  // Check if actually playing
  console.log('\n=== PLAYBACK CHECK ===')
  console.log('Actually playing:', !audio.paused && !audio.ended && audio.readyState >= 2)
  console.log('Has data:', audio.readyState >= 2)
  console.log('Network OK:', audio.networkState !== 3)
} else {
  console.log('❌ No audio element found!')
}
```

Key things to check:
- `paused: false` but no sound = might be muted or volume 0
- `readyState < 2` = not enough data loaded
- `networkState === 3` = network error
- `error` = audio error occurred


