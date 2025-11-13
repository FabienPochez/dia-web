// Establish global debug flag (defaults to false unless explicitly enabled)
const envDebug = String(import.meta.env.VITE_DIA_DEBUG ?? '').toLowerCase()
const debugEnabledFromEnv = ['1', 'true', 'yes', 'on'].includes(envDebug)
if (globalThis.DIA_DEBUG === undefined) {
  globalThis.DIA_DEBUG = debugEnabledFromEnv
}
const __DBG__ = Boolean(globalThis.DIA_DEBUG)
const debugLog = (...args) => {
  if (__DBG__) console.log(...args)
}

debugLog('[BOOT] web bundle loaded')

import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import '@fontsource/inter/index.css'
import '@fontsource/azeret-mono/index.css'
import * as auth from '@/lib/authClient'

const app = createApp(App)
debugLog('[BOOT] About to mount Vue app to #app')
app.mount('#app')
debugLog('[BOOT] Vue app mounted successfully')

// Avoid duplicate listeners in dev/HMR
if (!window.__DIA_ERROR_LISTENERS__) {
  window.__DIA_ERROR_LISTENERS__ = true

  if (import.meta.env.DEV) {
    window.addEventListener('error', (e) => {
      console.log('[CRASH][window.error]', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error ? {
          name: e.error.name,
          message: e.error.message,
          stack: e.error.stack,
        } : null,
        errorString: e?.error?.stack || e?.error?.message || String(e?.error) || 'Unknown error',
      });
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.log('[CRASH][unhandledrejection]', {
        reason: e?.reason?.stack || e?.reason?.message || e?.reason || 'Unknown rejection',
        errorString: e?.reason?.stack || e?.reason?.message || String(e?.reason) || 'Unknown rejection',
      });
    });
  }
}

auth.init({
  mode: 'header', // JWT-only migration: always use header mode
})

document.title = 'DIA! Radio'

