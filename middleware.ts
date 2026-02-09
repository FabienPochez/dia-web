/**
 * Vercel Edge Middleware: SSR metadata for shared episode links.
 * When a known crawler requests /episodes/:slug, return HTML with OG/Twitter meta.
 * Humans get pass-through to SPA.
 */
import { next } from '@vercel/functions'

const CRAWLER_UA =
  /Twitterbot|facebookexternalhit|Facebot|Discordbot|Slackbot|WhatsApp|TelegramBot|Applebot|LinkedInBot|Pinterest|Googlebot|bingbot/i

const API_BASE =
  (typeof process !== 'undefined' && process.env?.PAYLOAD_PUBLIC_API_BASE) ||
  (typeof process !== 'undefined' && process.env?.VITE_PAYLOAD_API_BASE?.replace?.(/\/api$/, '')) ||
  'https://content.diaradio.live'

const SITE_BASE = 'https://www.diaradio.live'
const DEFAULT_OG_IMAGE = `${SITE_BASE}/img/fallback-live.jpg`

function isCrawler(ua: string | null): boolean {
  if (!ua) return false
  return CRAWLER_UA.test(ua)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildMetaHtml(meta: {
  title: string
  description: string
  image: string
  url: string
}): string {
  const t = escapeHtml(meta.title)
  const d = escapeHtml(meta.description)
  const img = escapeHtml(meta.image)
  const url = escapeHtml(meta.url)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${t}</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <p>DIA! Radio — <a href="${url}">Opening episode…</a></p>
</body>
</html>`
}

async function fetchEpisodeMeta(slug: string): Promise<{
  title: string
  description: string
  image: string
} | null> {
  try {
    const url = `${API_BASE}/api/episodes?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const doc = data?.docs?.[0]
    if (!doc) return null

    const title = doc.title || 'Episode – DIA! Radio'
    const description =
      doc.description || doc.excerpt || 'Listen on DIA! Radio'
    let image = DEFAULT_OG_IMAGE
    const cover = doc.cover?.url || doc.show?.cover?.url
    if (cover) {
      const base = String(API_BASE).replace(/\/api$/, '')
      image = cover.startsWith('http') ? cover : `${base}${cover}`
    }
    return { title, description, image }
  } catch {
    return null
  }
}

export const config = {
  matcher: ['/episodes/:path*'],
}

export default async function middleware(request: Request) {
  const url = new URL(request.url)
  const match = url.pathname.match(/^\/episodes\/([^/]+)$/)
  if (!match) return next()

  const slug = match[1]
  const ua = request.headers.get('user-agent')

  if (!isCrawler(ua)) return next()

  const meta = await fetchEpisodeMeta(slug)
  const title = meta?.title ?? 'Episode – DIA! Radio'
  const description = meta?.description ?? 'Listen on DIA! Radio'
  const image = meta?.image ?? DEFAULT_OG_IMAGE
  const canonicalUrl = `${SITE_BASE}/episodes/${slug}`

  const html = buildMetaHtml({ title, description, image, url: canonicalUrl })

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
