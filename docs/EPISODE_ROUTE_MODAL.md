# Shareable Episode URLs and Modal

## Overview

The dia-web app supports shareable episode URLs at `/episodes/:slug`. Visiting such a URL shows the waiting page (same layout as `/`) and opens a modal dialog with episode details. The modal's Play button controls the existing global player—no remount, no playback interruption when navigating back to `/`.

## Behavior

- **Route**: `/episodes/:slug` renders the same `WaitingPage` component as `/`, so the player persists.
- **Modal**: Uses shadcn-vue Dialog. Opens when `route.params.slug` is set.
- **Episode resolution**: First checks the already-loaded recent episodes list (no duplicate fetch). If not found, fetches by slug from Payload API.
- **Close**: Overlay click, ESC, or close button calls `router.replace('/')`, so Back button behavior is clean.
- **Playback**: Modal Play button calls `usePlayer().toggleEpisode()`—same as episode cards.

## Limitations

- **SSR meta for bots only**: Link preview bots receive OG/Twitter meta via Vercel Edge Middleware; see `docs/EPISODE_SHARE_META.md`. Normal browser visits still load the SPA; meta is not injected for humans.
- **Refresh on Vercel**: The SPA fallback in `vercel.json` ensures `/episodes/:slug` loads correctly on refresh (all routes fallback to `index.html`).

## Files

| File | Purpose |
|------|---------|
| `src/router/index.js` | Route `/episodes/:slug` → `WaitingPage` |
| `src/components/episodes/EpisodeModal.vue` | Dialog wrapper |
| `src/components/episodes/EpisodeModalContent.vue` | Episode details + Play button |
| `src/api/payload/episodes.ts` | `fetchEpisodeBySlug()` |
| `src/composables/useEpisodes.js` | Shared episodes list (used by PodcastList + modal) |
| `src/components/WaitingPage.vue` | Slug watcher + modal integration |
