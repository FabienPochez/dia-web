// authClient.ts - Web-only version (localStorage only)

type User = { id: string; email: string; role?: string; [k: string]: any }
type Mode = 'header'

const viteEnv = (globalThis as any)?.import?.meta?.env as
  | { VITE_CONTENT_API_URL?: string }
  | undefined;

const API_URL = viteEnv?.VITE_CONTENT_API_URL || 'https://content.diaradio.live/api'
const SKEW_MS = 2 * 60 * 1000
const MIN_TIMER_MS = 10 * 1000

const isDev = import.meta.env.DEV
const authLog = (...args: any[]) => {
  if (isDev) console.log(...args)
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
  authLog('[AUTH] setMode()', next) 
}
export function getMode() { return mode }

function clearAuthState() {
  authLog('[AUTH] clearAuthState() mode=', mode)
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = null
  user = null
  token = null
}

function clearAllTimers() {
  authLog('[AUTH] clearAllTimers()')
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
}

export function isBooted() { return __booted }

function scheduleRefreshFromToken(t?: string | null) {
  authLog('[AUTH] scheduleRefreshFromToken()', t ? 'token present' : 'no token')
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
  const data = decodeJwt(t || null)
  authLog('[AUTH] decoded token', data)
  if (!data?.exp) return
  const delay = msUntil(data.exp)
  authLog('[AUTH] scheduling refresh in', delay, 'ms')
  refreshTimer = setTimeout(() => refresh(), delay) as unknown as number
}

function scheduleRefreshFromExp(exp?: number) {
  authLog('[AUTH/DEBUG] scheduleRefreshFromExp() SET', { exp, existingTimer: !!refreshTimer })
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
  if (!exp) return
  
  const jitter = 5000
  const delay = Math.max(msUntil(exp) - jitter, 1000)
  authLog('[AUTH] scheduling refresh in', delay, 'ms (with 5s jitter)')
  refreshTimer = setTimeout(() => refresh(), delay) as unknown as number
}

export async function authedFetch(path: string, init: RequestOpts = {}) {
  authLog('[AUTH] authedFetch()', path, 'skipAuthHeader=', init.skipAuthHeader)
  const url = `${API_URL}${path}`
  const headers = new Headers(init.headers || {})

  const needAuthHeader = !init.skipAuthHeader
  if (needAuthHeader) {
    try {
      token ||= await storage.get(TOKEN_KEY)
      authLog('[AUTH] loaded token from storage', token ? 'present' : 'null')
      if (token) headers.set('Authorization', `Bearer ${token}`)
    } catch (e: any) {
      authLog('[AUTH] storage.get error', e?.message || e)
    }
  } else {
    authLog('[AUTH] skipAuthHeader=true -> not loading token')
  }

  authLog('[AUTH] fetch request', {
    url,
    method: init.method || 'GET',
    hasAuth: headers.has('Authorization'),
    authScheme: headers.get('Authorization')?.split(' ')?.[0] || null,
  })
  
  try {
    const res = await fetch(url, { ...init, headers })
    authLog('[AUTH] fetch response', { url, status: res.status })
    
    if (res.status === 401 && needAuthHeader) {
      authLog('[AUTH] 401 detected, attempting refresh and retry')
      try {
        const refreshedUser = await refresh()
        if (refreshedUser) {
          const freshToken = await storage.get(TOKEN_KEY)
          if (freshToken) {
            headers.set('Authorization', `Bearer ${freshToken}`)
            authLog('[AUTH] retrying request with fresh token')
            return await fetch(url, { ...init, headers })
          }
        }
      } catch (refreshError) {
        authLog('[AUTH] refresh failed during 401 retry:', refreshError)
        clearAuthState()
        await storage.remove(TOKEN_KEY)
      }
    }
    
    if (!res.ok) {
      let body = ''
      try { body = await res.text() } catch {}
      authLog('[AUTH] fetch response body (non-OK)', { url, status: res.status, body: body?.slice?.(0, 500) })
    }
    return res
  } catch (e: any) {
    authLog('[AUTH] fetch NETWORK ERROR', { url, message: e?.message })
    throw e
  }
}

let __loginInFlight = false
export async function login(email: string, password: string) {
  if (__loginInFlight) { authLog('[AUTH] login() blocked (in flight)'); return null }
  __loginInFlight = true
  authLog('[AUTH] login()', email)
  const res = await authedFetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    skipAuthHeader: true,
  })
  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    authLog('[AUTH] login() failed', { status: res.status, body: body?.slice?.(0, 500) })
    __loginInFlight = false
    throw new Error('Login failed')
  }
  const data = (await res.json()) as { user: User; token?: string; exp?: number }
  user = data.user
  authLog('[AUTH] login success', { user, tokenLen: data.token?.length, exp: data.exp })

  token = data.token || null
  if (!token) throw new Error('No token returned')
  await storage.set(TOKEN_KEY, token)
  authLog('[AUTH] stored token in storage')
  scheduleRefreshFromToken(token)
  
  try {
      const verified = await me()
      authLog('[AUTH] post-login me() verified', !!verified, verified?.email)
      if (verified) user = verified
  } catch (e:any) {
      authLog('[AUTH] post-login me() error', e?.message || e)
  }
  
  __loginInFlight = false
  return user
}

export async function me(): Promise<User | null> {
  authLog('[AUTH] me()')
  const res = await authedFetch('/users/me', { method: 'GET' })
  if (!res.ok) return null
  const data = (await res.json()) as { user: User; token?: string; exp?: number }
  
  user = { ...user, ...data.user }
  
  authLog('[AUTH] me() success', { user, tokenLen: data.token?.length, exp: data.exp })
  if (mode === 'header' && data.token) {
    token = data.token; await storage.set(TOKEN_KEY, token)
    authLog('[AUTH] me() stored new token')
    const payload = decodeJwt<{ exp?: number }>(token)
    authLog('[AUTH] me() decoded token', payload)
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
    authLog('[AUTH] refresh() blocked (in flight)')
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
  authLog('[AUTH] _refresh() start')
  
  token ||= await storage.get(TOKEN_KEY)
  authLog('[AUTH] _refresh() loaded token', token ? 'present' : 'null')
  const payload = decodeJwt<{ exp?: number }>(token)
  authLog('[AUTH] _refresh() decoded token', payload)
  
  if (!token || !payload?.exp || Date.now() >= (payload.exp * 1000 - SKEW_MS)) {
    clearAuthState()
    await storage.remove(TOKEN_KEY)
    authLog('[AUTH] _refresh() token invalid -> cleared')
    return null
  }
  
  scheduleRefreshFromExp(payload.exp)
  
  if (!user && token) {
    authLog('[AUTH] _refresh() token valid but no user, calling /me to restore state')
    try {
      const restoredUser = await me()
      if (restoredUser) {
        authLog('[AUTH] _refresh() user state restored:', restoredUser.email)
        return restoredUser
      }
    } catch (error) {
      authLog('[AUTH] _refresh() /me call failed:', error)
      clearAuthState()
      await storage.remove(TOKEN_KEY)
      return null
    }
  }
  
  authLog('[AUTH] _refresh() done user=', user)
  return user
}

export async function logout() {
  authLog('[AUTH] logout()')
  
  clearAllTimers()
  clearAuthState()
  
  try { await authedFetch('/users/logout', { method: 'POST', skipAuthHeader: true }) } catch {}
  
  await storage.remove(TOKEN_KEY)
  authLog('[AUTH] logout() done')
}

export function getUser() { return user }

export async function init(options?: { mode?: Mode }) {
  authLog('[AUTH/DEBUG] init() START', { options, __booted, __initInFlight })
  
  if (__initInFlight) {
    authLog('[AUTH] init() blocked (in flight)')
    return user
  }
  
  if (__booted && !options?.mode) {
    authLog('[AUTH] init() blocked (already booted)')
    return user
  }
  
  __initInFlight = true
  try {
    authLog('[AUTH] init()')
    
    if (options?.mode && options.mode !== 'header') {
      throw new Error('Only header mode supported')
    }
    setMode('header')
    
    token = await storage.get(TOKEN_KEY)
    authLog('[AUTH] init() loaded token', token ? 'present' : 'null')
    if (token) {
      const payload = decodeJwt<{ exp?: number }>(token)
      authLog('[AUTH] init() decoded token', payload)
      if (payload?.exp) scheduleRefreshFromExp(payload.exp)
    }
    
    authLog('[AUTH] init() complete, returning current user state')
    __booted = true
    return user
  } finally {
    __initInFlight = false
  }
}

