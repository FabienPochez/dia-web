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

## 2026-02-09

- **feat · seo** — SSR metadata for shared episode links: Vercel Edge Middleware returns OG/Twitter meta to crawlers (Twitter, Facebook, Discord, etc.); humans get SPA pass-through (2026-02-09).
- **feat · infra** — Added middleware.ts with bot detection, Payload API fetch by slug, minimal HTML response; docs/EPISODE_SHARE_META.md (2026-02-09).

## 2026-02-06

- **feat · support** — Added Support page at /support route with contact information (support@diaradio.live).
- **feat · legal** — Added Privacy Policy page at /privacy route with full privacy policy content (13 sections covering data collection, analytics, account deletion, and user rights).
- **feat · legal** — Added Terms of Service page at /terms route with complete terms content (11 sections covering service usage, accounts, content, and liability).
- **feat · routing** — Added /privacy, /terms, and /support routes to Vue Router for legal and support pages (Option C implementation from audit).
- **feat · ui** — Updated ResetPassword page to match WaitingPage branding: replaced logo GIF with SVG (DIA-LOGO-ALT.svg), replaced static GIF with AnimatedLogo component, and matched padding (py-[1vh]).
- **docs · audit** — Added Nuxt 3 integration audit document analyzing options for adding /privacy and /terms static pages.

## Unreleased

- **feat · player** — EpisodeModal uses PlayerOverlayControls (NowPlayingDrawer-style): gradient overlay, play/pause, skip ±30s, progress bar with seek; accepts episode prop for modal context (2026-02-09).
- **feat · ui** — EpisodeModalContent: NowPlayingDrawer-style layout (date+share, title+SoundCloud, genres, description); share button (Web Share API or clipboard); soundcloudUrl from Payload (2026-02-09).
- **feat · assets** — Added SoundCloud logos (white/black); removed old logo GIFs and PNGs; updated fallback-live.jpg (2026-02-09).
- **feat · podcast** — Episode cards clickable on image and title to open EpisodeModal with episode details (2026-02-09).
- **fix · player** — PlayPauseButton: call onToggle synchronously (removed requestAnimationFrame) so audio.play() runs within user gesture for autoplay policy (2026-02-09).
- **feat · routing** — Added shareable episode URLs at /episodes/:slug; opens modal with episode details; Play uses existing global player; closing modal replaces URL with / (2026-02-09).
- **feat · ui** — Added EpisodeModal (shadcn-vue Dialog) with EpisodeModalContent for episode cover, title, date, genres, description, and Play button (2026-02-09).
- **feat · api** — Added fetchEpisodeBySlug in api/payload/episodes.ts for Payload CMS slug resolution (2026-02-09).
- **refactor · podcast** — Extracted useEpisodes composable; PodcastList now consumes shared list; added slug to episode mapping (2026-02-09).
- **feat · ui** — Updated logo card: replaced GIF with SVG (DIA-LOGO-ALT.svg) and replaced animated GIF with animated PNG sequence (DIA_SIGLE_01-03) with fade transitions (2026-01-14).
- **feat · player** — Updated timeline/scrubber design to match app: replaced Slider with ProgressBar component (5px normal height, 8px when scrubbing, pink #A54995) (2026-01-14).
- **feat · ios** — Added iOS Universal Links support with AASA file for /episodes/* paths (2026-01-14).

### iOS Universal Links — 2026-01-14
- **What changed**: Implemented Apple App Site Association (AASA) file for iOS Universal Links on diaradio.live.
- **Why**: Enable deep linking from iOS app to web episodes via Universal Links.
- **Technical**:
  - Created extensionless AASA file at `/.well-known/apple-app-site-association`
  - Added Vercel rewrite rule to serve AASA file with correct Content-Type header
  - Configured appID `2F9LBWAS5U.live.diaradio` with path pattern `/episodes/*`
- **Files**: `public/.well-known/apple-app-site-association`, `public/.well-known/apple-app-site-association.json`, `vercel.json`
- **Impact**: iOS users can open episode links directly in the app when installed

- **fix · player** — Added silent pause/play detection to sync player state when browser pauses/plays audio without firing events.
- **feat · debug** — Added player debugging utility for investigating stream interruptions and state mismatches.
- **fix · schedule** — Removed publishedStatus filter from schedule queries to display new and live shows without published dates.

### Field Rename — 2025-12-31
- **refactor · api** — Renamed `publishedAt` to `firstAiredAt` in API queries and data extraction.
- **refactor · player** — Updated player state to use `firstAiredAt` instead of `publishedAt` for episode dates.
- **refactor · components** — Updated PodcastCard and PodcastGrid components to use `firstAiredAt` prop.

### PostHog Analytics — 2025-12-02
- **feat · analytics** — Installed and configured PostHog for web analytics and event tracking.
- **feat · composables** — Created usePostHog composable to initialize PostHog with API key and configuration.
- **feat · composables** — Created useAnalytics composable providing track function for event tracking.
- **feat · routing** — Integrated PostHog pageview tracking with Vue Router navigation.
- **feat · analytics** — Registered `platform: 'webapp'` as PostHog super property for automatic event tagging.

### Podcast List — 2025-11-27
- **feat · podcast** — Added podcast list in third column of WaitingPage with infinite scroll and skeleton loading.
- **feat · components** — Copied and adapted PodcastCard, PodcastGrid, and PodcastCardSkeleton components from dia-radio-app-rss.
- **feat · composables** — Created useInfiniteObserver composable for infinite scroll functionality using IntersectionObserver.
- **feat · ui** — Added `genre-solid` variant to Badge component for podcast genre display.
- **feat · integration** — Integrated podcast list with existing player system (supports both live and podcast playback).

### Reset Password Page — 2025-11-27
- **feat · auth** — Added `/reset-password` route with form to reset Dia app account passwords.
- **feat · routing** — Installed and configured Vue Router for multi-page navigation.
- **feat · ui** — Created ResetPassword component with 2-column layout matching WaitingPage branding.
- **feat · validation** — Implemented password validation (minimum 8 characters, password match check).
- **feat · api** — Integrated with Payload CMS `/api/users/reset-password` endpoint with error handling.
- **fix · player** — Fixed SimplePlayer height to remain fixed at 60px on window resize (added min-h/max-h constraints).

### Debug & Logging — 2025-11-13
- **fix · debug** — Gated all debug console logs behind DEV environment checks to prevent production logging.

### Layout & UI Improvements — 2025-11-13
- **feat · layout** — Redesigned WaitingPage with responsive 3-column layout (desktop) and single column (mobile).
- **feat · layout** — Removed app-scroll class from main App container for standard web scrolling.
- **feat · ui** — Updated WaitingPage styling with cards, social links (Instagram, Facebook, SoundCloud), and brand messaging.
- **feat · ui** — Added logo assets in public/img directory.
- **fix · ui** — Removed hover effects and click handlers from WhatsNext component items (display-only).

### Player & Components — 2025-11-13
- **feat · player** — Added live info preload to SimplePlayer component on mount (setDefaultLive).
- **feat · player** — Updated SimplePlayer styling (rounded-lg, shadow, border).
- **feat · component** — Improved WhatsNext component layout and spacing with flex-col gap-4.

### SEO & Meta Tags — 2025-11-13
- **feat · seo** — Added comprehensive meta tags in index.html (description, keywords, author, robots, canonical).
- **feat · seo** — Implemented Open Graph meta tags for social media sharing (Facebook).
- **feat · seo** — Added Twitter Card meta tags (summary_large_image).
- **feat · seo** — Added geographic metadata (geo.region=FR, geo.placename="Parc ducontenia, Saint-jean-De-Luz 64500").
- **feat · seo** — Implemented favicon using logo-smiley.png with multiple sizes (32x32, 192x192, 512x512, apple-touch-icon).
- **feat · seo** — Set HTML lang attribute to "en" (English) and added language meta tag.

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

