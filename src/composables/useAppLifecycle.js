// useAppLifecycle.js - Web-only version

const foregroundCallbacks = new Set()
const backgroundCallbacks = new Set()

let listenersInitialized = false
let appActive = true
let lastChangeSource = 'init'

const AUTH_REFRESH_DEBOUNCE_MS = 60000 // 60 seconds
let lastAuthRefresh = 0

function notify(set, payload) {
  set.forEach((cb) => {
    try {
      cb(payload)
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[Lifecycle] listener error', err)
    }
  })
}

function setActiveState(nextActive, source) {
  if (appActive === nextActive) return
  appActive = nextActive
  lastChangeSource = source
  if (nextActive) {
    notify(foregroundCallbacks, { source })
    maybeRefreshAuth()
  } else {
    notify(backgroundCallbacks, { source })
  }
}

async function maybeRefreshAuth() {
  if (typeof window === 'undefined') return
  const now = Date.now()
  if (now - lastAuthRefresh < AUTH_REFRESH_DEBOUNCE_MS) return
  lastAuthRefresh = now
  try {
    const { refresh } = await import('@/lib/authClient')
    await refresh().catch((err) => {
      if (import.meta.env.DEV) console.warn('Auth refresh on resume failed:', err)
    })
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Auth refresh hook load failed:', err)
  }
}

function ensureListeners() {
  if (listenersInitialized || typeof window === 'undefined') return
  listenersInitialized = true

  appActive = typeof document !== 'undefined' ? !document.hidden : true
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      setActiveState(!document.hidden, 'visibilitychange')
    })
  }
}

export function registerAppLifecycle({ onForeground, onBackground } = {}) {
  ensureListeners()
  if (onForeground) foregroundCallbacks.add(onForeground)
  if (onBackground) backgroundCallbacks.add(onBackground)

  return () => {
    if (onForeground) foregroundCallbacks.delete(onForeground)
    if (onBackground) backgroundCallbacks.delete(onBackground)
  }
}

export function isAppActive() {
  ensureListeners()
  return appActive
}

export function lastLifecycleSource() {
  return lastChangeSource
}

