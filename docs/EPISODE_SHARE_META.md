# SSR Metadata for Shared Episode Links

## What it does

When someone shares a link like `https://www.diaradio.live/episodes/:slug`, link preview bots (Twitter/X, Facebook, Discord, iMessage, WhatsApp, Slack, etc.) receive a minimal HTML page with correct Open Graph and Twitter Card meta tags. This enables rich previews with episode title, description, and cover image.

Humans visiting the same URL get the normal SPA: the Vue app loads, and the episode modal opens. No intermediary HTML page.

## How it works

- **Vercel Edge Middleware** (`middleware.ts` at project root) runs before the request hits the SPA.
- If the path is `/episodes/:slug`:
  - **Bot detection**: User-Agent is matched against a conservative allowlist (Twitterbot, facebookexternalhit, Discordbot, Slackbot, etc.).
  - **If crawler**: Fetch episode by slug from Payload API, build HTML with OG/Twitter meta, return it directly. No redirect, no meta-refresh, no JS.
  - **If human**: Pass-through to the SPA (via `next()`). The SPA handles the route and opens the modal as usual.

## Limitations

- **SPA still has no SSR**. This is for **preview bots only**. The main app remains a client-rendered Vue SPA.
- Meta tags are not available for normal browser visits (they load `index.html`).
- If Payload API requires auth for episodes, the middleware falls back to generic meta (title: "Episode – DIA! Radio", description: "Listen on DIA! Radio").

## Required env vars

| Variable | Description |
|----------|-------------|
| `PAYLOAD_PUBLIC_API_BASE` | Payload API base URL, e.g. `https://content.diaradio.live`. Optional; defaults to `https://content.diaradio.live`. |
| `VITE_PAYLOAD_API_BASE` | Alternative (if set, `/api` suffix is stripped). Used only when `PAYLOAD_PUBLIC_API_BASE` is not set. |

Set these in the Vercel project dashboard (Environment Variables) for production/preview.

## Testing

### Simulate bot with curl

```bash
curl -A "Twitterbot/1.0" -i https://your-preview-url.vercel.app/episodes/your-episode-slug
```

- Response should have `content-type: text/html; charset=utf-8`.
- Body should contain `og:title`, `og:description`, `og:image`, and `twitter:card` meta tags.

### Normal browser

- Open `/episodes/:slug` in a browser. SPA loads, modal opens, audio works.
- No raw HTML page; behavior unchanged.

### Validators

After deployment, use:

- Facebook Sharing Debugger
- X (Twitter) Card Validator  
- Discord link unfurl (paste link in a channel)

## Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Vercel Edge Middleware: bot detection, Payload fetch, meta HTML response |
| `docs/EPISODE_SHARE_META.md` | This document |
