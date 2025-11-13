<!--
──────────────────────────────────────────────────────────────
 DIA! RADIO WEB CHANGELOG POLICY — QUICK REFERENCE
──────────────────────────────────────────────────────────────

WHEN TO ADD
- After pushing a functional, user-visible, or ops-relevant change.
- Skip pure refactors unless behavior changed.
- Always add under ## Unreleased, newest at the top.

ONE-LINER FORMAT
- **type · area** — concise one-liner (refs)

DETAIL BLOCK (only when significant change, optional)
### <Short Title>
- **What changed**: plain English summary
- **Why**: the problem it solves
- **Technical**: key changes (≤3 bullets)
- **Files**: key files touched
- **Impact**: user/ops benefit

EXAMPLE
- **feat · player** — Added HTML5 audio player with play/pause controls.

### HTML5 Audio Player Implementation
- **What changed**: Created SimplePlayer component with HTML5 audio support.
- **Why**: Need basic audio playback for live stream and podcast episodes.
- **Technical**:
  - Created usePlayer composable with HTML5 adapter
  - Implemented play/pause/seek functionality
  - Added MediaSession API support for web
- **Files**: src/components/player/SimplePlayer.vue, src/composables/player/usePlayer.js
- **Impact**: Users can play live radio and podcast episodes

──────────────────────────────────────────────────────────────
-->


# Changelog

## Unreleased

### Initial Setup — 2025-11-13
- **feat · setup** — Initial project setup with Vue 3, Tailwind CSS v4, and shadcn-vue.
- **feat · player** — Created HTML5 audio player (SimplePlayer) with play/pause and seek controls.
- **feat · live** — Implemented LiveCard component to display current live show with cover image and play controls.
- **feat · schedule** — Added WhatsNext component to show upcoming shows for today and tomorrow.
- **feat · composables** — Created usePlayer composable with HTML5 adapter for web-only audio playback.
- **feat · composables** — Implemented useLiveSchedule composable for fetching and managing live schedule data.
- **feat · api** — Set up API integration with Payload CMS for fetching episodes and schedule data.
- **feat · auth** — Created web-only authClient using localStorage (no Capacitor dependencies).
- **feat · ui** — Installed and configured shadcn-vue components: Card, Button, Badge, Skeleton, Slider.
- **feat · layout** — Created WaitingPage component combining LiveCard, WhatsNext, and SimplePlayer.

### Initial Project Setup
- **What changed**: Set up new Vue 3 web project for DIA! Radio website with waiting page featuring audio player, live card, and upcoming shows.
- **Why**: Need a simple web presence while the full website is being developed.
- **Technical**:
  - Vue 3 + Vite + Tailwind CSS v4 + shadcn-vue stack
  - HTML5 audio player (no Capacitor/native dependencies)
  - Reused components and composables from dia-radio-app-rss, adapted for web-only
  - API integration with content.diaradio.live for live schedule and episodes
- **Files**: 
  - Core: src/main.js, src/App.vue, src/index.css
  - Components: src/components/WaitingPage.vue, src/components/player/SimplePlayer.vue, src/components/live/LiveCard.vue, src/components/live/WhatsNext.vue
  - Composables: src/composables/player/usePlayer.js, src/composables/useLiveSchedule.js
  - API: src/api/payload/schedule.ts, src/lib/authClient.ts
- **Impact**: Basic waiting page is functional with live radio playback and schedule display

