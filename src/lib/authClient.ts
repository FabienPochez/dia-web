// authClient.ts - Web-only version (localStorage only)

type User = { id: string; email: string; role?: string; [k: string]: any }
type Mode = 'header'

const viteEnv = (globalThis as any)?.import?.meta?.env as
  | { VITE_CONTENT_API_URL?: string }
  | undefined;

const API_URL = viteEnv?.VITE_CONTENT_API_URL || 'https://content.diaradio.live/api'
const SKEW_MS = 2 * 60 * 1000
const MIN_TIMER_MS = 10 * 1000

if (import.meta.env.DEV) {
  console.log('[AUTH/DEBUG] API base URL:', API_URL)
}

type RequestOpts = RequestInit & { skipAuthHeader?: boolean }
const TOKEN_KEY = 'auth-token'

// Web-only storage using localStorage
const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    } catch {}
  },
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch {}
  },
}

function decodeJwt<T = any>(token: string | null): (T & { exp?: number }) | null {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function msUntil(exp?: number): number {
  if (!exp) return MIN_TIMER_MS
  const now = Date.now()
  const expMs = exp * 1000
  const delay = expMs - now - SKEW_MS
  return Math.max(delay, MIN_TIMER_MS)
}

let mode: Mode = 'header'
let token: string | null = null
let user: User | null = null
let refreshTimer: number | null = null
let __refreshInFlight = false
let __refreshPromise: Promise<User | null> | null = null
let __initInFlight = false
let __booted = false

function setMode(next: Mode) { 
  if (next !== 'header') {
    throw new Error('Only header mode supported')
  }
  mode = next; 
  console.log('[AUTH] setMode()', next) 
}
export function getMode() { return mode }

function clearAuthState() {
  console.log('[AUTH] clearAuthState() mode=', mode)
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = null
  user = null
  token = null
}

function clearAllTimers() {
  console.log('[AUTH] clearAllTimers()')
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
}

export function isBooted() { return __booted }

function scheduleRefreshFromToken(t?: string | null) {
  console.log('[AUTH] scheduleRefreshFromToken()', t ? 'token present' : 'no token')
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
  const data = decodeJwt(t || null)
  console.log('[AUTH] decoded token', data)
  if (!data?.exp) return
  const delay = msUntil(data.exp)
  console.log('[AUTH] scheduling refresh in', delay, 'ms')
  refreshTimer = setTimeout(() => refresh(), delay) as unknown as number
}

function scheduleRefreshFromExp(exp?: number) {
  console.log('[AUTH/DEBUG] scheduleRefreshFromExp() SET', { exp, existingTimer: !!refreshTimer })
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
  if (!exp) return
  
  const jitter = 5000
  const delay = Math.max(msUntil(exp) - jitter, 1000)
  console.log('[AUTH] scheduling refresh in', delay, 'ms (with 5s jitter)')
  refreshTimer = setTimeout(() => refresh(), delay) as unknown as number
}

export async function authedFetch(path: string, init: RequestOpts = {}) {
  console.log('[AUTH] authedFetch()', path, 'skipAuthHeader=', init.skipAuthHeader)
  const url = `${API_URL}${path}`
  const headers = new Headers(init.headers || {})

  const needAuthHeader = !init.skipAuthHeader
  if (needAuthHeader) {
    try {
      token ||= await storage.get(TOKEN_KEY)
      console.log('[AUTH] loaded token from storage', token ? 'present' : 'null')
      if (token) headers.set('Authorization', `Bearer ${token}`)
    } catch (e: any) {
      console.log('[AUTH] storage.get error', e?.message || e)
    }
  } else {
    console.log('[AUTH] skipAuthHeader=true -> not loading token')
  }

  console.log('[AUTH] fetch request', {
    url,
    method: init.method || 'GET',
    hasAuth: headers.has('Authorization'),
    authScheme: headers.get('Authorization')?.split(' ')?.[0] || null,
  })
  
  try {
    const res = await fetch(url, { ...init, headers })
    console.log('[AUTH] fetch response', { url, status: res.status })
    
    if (res.status === 401 && needAuthHeader) {
      console.log('[AUTH] 401 detected, attempting refresh and retry')
      try {
        const refreshedUser = await refresh()
        if (refreshedUser) {
          const freshToken = await storage.get(TOKEN_KEY)
          if (freshToken) {
            headers.set('Authorization', `Bearer ${freshToken}`)
            console.log('[AUTH] retrying request with fresh token')
            return await fetch(url, { ...init, headers })
          }
        }
      } catch (refreshError) {
        console.log('[AUTH] refresh failed during 401 retry:', refreshError)
        clearAuthState()
        await storage.remove(TOKEN_KEY)
      }
    }
    
    if (!res.ok) {
      let body = ''
      try { body = await res.text() } catch {}
      console.log('[AUTH] fetch response body (non-OK)', { url, status: res.status, body: body?.slice?.(0, 500) })
    }
    return res
  } catch (e: any) {
    console.log('[AUTH] fetch NETWORK ERROR', { url, message: e?.message })
    throw e
  }
}

let __loginInFlight = false
export async function login(email: string, password: string) {
  if (__loginInFlight) { console.log('[AUTH] login() blocked (in flight)'); return null }
  __loginInFlight = true
  console.log('[AUTH] login()', email)
  const res = await authedFetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    skipAuthHeader: true,
  })
  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    console.log('[AUTH] login() failed', { status: res.status, body: body?.slice?.(0, 500) })
    __loginInFlight = false
    throw new Error('Login failed')
  }
  const data = (await res.json()) as { user: User; token?: string; exp?: number }
  user = data.user
  console.log('[AUTH] login success', { user, tokenLen: data.token?.length, exp: data.exp })

  token = data.token || null
  if (!token) throw new Error('No token returned')
  await storage.set(TOKEN_KEY, token)
  console.log('[AUTH] stored token in storage')
  scheduleRefreshFromToken(token)
  
  try {
      const verified = await me()
      console.log('[AUTH] post-login me() verified', !!verified, verified?.email)
      if (verified) user = verified
  } catch (e:any) {
      console.log('[AUTH] post-login me() error', e?.message || e)
  }
  
  __loginInFlight = false
  return user
}

export async function me(): Promise<User | null> {
  console.log('[AUTH] me()')
  const res = await authedFetch('/users/me', { method: 'GET' })
  if (!res.ok) return null
  const data = (await res.json()) as { user: User; token?: string; exp?: number }
  
  user = { ...user, ...data.user }
  
  console.log('[AUTH] me() success', { user, tokenLen: data.token?.length, exp: data.exp })
  if (mode === 'header' && data.token) {
    token = data.token; await storage.set(TOKEN_KEY, token)
    console.log('[AUTH] me() stored new token')
    const payload = decodeJwt<{ exp?: number }>(token)
    console.log('[AUTH] me() decoded token', payload)
    if (payload?.exp) scheduleRefreshFromExp(payload.exp)
  } else if (data.token) {
    scheduleRefreshFromToken(data.token)
  } else if (data.exp) {
    scheduleRefreshFromExp(data.exp)
  }
  return user
}

export async function refresh() {
  if (__refreshInFlight && __refreshPromise) {
    console.log('[AUTH] refresh() blocked (in flight)')
    return __refreshPromise
  }
  
  __refreshInFlight = true
  __refreshPromise = _refresh()
  
  try {
    return await __refreshPromise
  } finally {
    __refreshInFlight = false
    __refreshPromise = null
  }
}

async function _refresh() {
  console.log('[AUTH] _refresh() start')
  
  token ||= await storage.get(TOKEN_KEY)
  console.log('[AUTH] _refresh() loaded token', token ? 'present' : 'null')
  const payload = decodeJwt<{ exp?: number }>(token)
  console.log('[AUTH] _refresh() decoded token', payload)
  
  if (!token || !payload?.exp || Date.now() >= (payload.exp * 1000 - SKEW_MS)) {
    clearAuthState()
    await storage.remove(TOKEN_KEY)
    console.log('[AUTH] _refresh() token invalid -> cleared')
    return null
  }
  
  scheduleRefreshFromExp(payload.exp)
  
  if (!user && token) {
    console.log('[AUTH] _refresh() token valid but no user, calling /me to restore state')
    try {
      const restoredUser = await me()
      if (restoredUser) {
        console.log('[AUTH] _refresh() user state restored:', restoredUser.email)
        return restoredUser
      }
    } catch (error) {
      console.log('[AUTH] _refresh() /me call failed:', error)
      clearAuthState()
      await storage.remove(TOKEN_KEY)
      return null
    }
  }
  
  console.log('[AUTH] _refresh() done user=', user)
  return user
}

export async function logout() {
  console.log('[AUTH] logout()')
  
  clearAllTimers()
  clearAuthState()
  
  try { await authedFetch('/users/logout', { method: 'POST', skipAuthHeader: true }) } catch {}
  
  await storage.remove(TOKEN_KEY)
  console.log('[AUTH] logout() done')
}

export function getUser() { return user }

export async function init(options?: { mode?: Mode }) {
  console.log('[AUTH/DEBUG] init() START', { options, __booted, __initInFlight })
  
  if (__initInFlight) {
    console.log('[AUTH] init() blocked (in flight)')
    return user
  }
  
  if (__booted && !options?.mode) {
    console.log('[AUTH] init() blocked (already booted)')
    return user
  }
  
  __initInFlight = true
  try {
    console.log('[AUTH] init()')
    
    if (options?.mode && options.mode !== 'header') {
      throw new Error('Only header mode supported')
    }
    setMode('header')
    
    token = await storage.get(TOKEN_KEY)
    console.log('[AUTH] init() loaded token', token ? 'present' : 'null')
    if (token) {
      const payload = decodeJwt<{ exp?: number }>(token)
      console.log('[AUTH] init() decoded token', payload)
      if (payload?.exp) scheduleRefreshFromExp(payload.exp)
    }
    
    console.log('[AUTH] init() complete, returning current user state')
    __booted = true
    return user
  } finally {
    __initInFlight = false
  }
}

