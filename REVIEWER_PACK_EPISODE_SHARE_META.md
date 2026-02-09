# Reviewer Pack: SSR Metadata for Shared Episode Links

## 1. SUMMARY

- Added Vercel Edge Middleware (`middleware.ts`) at project root for `/episodes/:slug` paths.
- Bot detection via User-Agent allowlist: Twitterbot, facebookexternalhit, Facebot, Discordbot, Slackbot, WhatsApp, TelegramBot, Applebot, LinkedInBot, Pinterest, Googlebot, bingbot.
- Crawlers receive minimal HTML with OG/Twitter meta (title, description, image, canonical URL). No redirect, no meta-refresh.
- Humans get pass-through via `next()` from `@vercel/functions`; SPA loads normally, modal opens.
- Episode data fetched from Payload API: `GET ${API_BASE}/api/episodes?where[slug][equals]=${slug}&limit=1&depth=1`.
- Env vars: `PAYLOAD_PUBLIC_API_BASE` (or `VITE_PAYLOAD_API_BASE`). Default: `https://content.diaradio.live`.
- Added `docs/EPISODE_SHARE_META.md` (behavior, limitations, env vars, testing).
- Updated `docs/EPISODE_ROUTE_MODAL.md` to reference share meta.
- SPA behavior unchanged: `/episodes/:slug`, `/reset-password`, `/privacy`, `/terms` unaffected.

## 2. DIFFS

### New files

**middleware.ts** (root)
- Matcher: `/episodes/:path*`
- `isCrawler(ua)`, `escapeHtml(s)`, `buildMetaHtml(meta)`, `fetchEpisodeMeta(slug)`
- If crawler: fetch episode, build HTML with meta, return `new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })`
- Else: `next()` pass-through

**docs/EPISODE_SHARE_META.md**
- What it does, how it works, limitations, env vars, testing (curl, validators)

### Modified files

```diff
--- a/docs/EPISODE_ROUTE_MODAL.md
+++ b/docs/EPISODE_ROUTE_MODAL.md
- **No SSR meta**: Episode meta (title, description) for SEO is not yet server-rendered.
+- **SSR meta for bots only**: Link preview bots receive OG/Twitter meta via Vercel Edge Middleware; see `docs/EPISODE_SHARE_META.md`.
```

```diff
--- a/package.json
+++ b/package.json
   "devDependencies": {
+    "@vercel/functions": "^3.4.1",
```

## 3. LOGS

Build output (unchanged, Vite build succeeds):

```
✓ 2212 modules transformed.
✓ built in 1.80s
```

## 4. QUESTIONS & RISKS

- **Local testing**: Middleware runs only on Vercel. Use `vercel dev` or deploy a preview to test curl with bot UA.
- **Payload auth**: If Payload requires auth for episodes, fetch may fail; fallback meta (generic title/description) is used.
- **Cover URL**: Assumes Payload media URLs are relative (e.g. `/media/xxx.jpg`); absolute URLs used as-is.
- **Crawler allowlist**: New crawlers (e.g. Mastodon) need manual addition.
- **Missing UA**: Treated as human; pass-through.
- **@vercel/functions**: Requires Node 20+ per package; Vercel Edge uses compatible runtime.
