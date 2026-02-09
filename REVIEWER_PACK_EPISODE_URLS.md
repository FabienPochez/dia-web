# Reviewer Pack: Shareable Episode URLs

## 1. SUMMARY

- Added `/episodes/:slug` route that renders the same `WaitingPage` as `/`, ensuring player persists and no audio interruption.
- Introduced shadcn-vue Dialog modal (`EpisodeModal`, `EpisodeModalContent`) for episode details when visiting `/episodes/:slug`.
- Extracted `useEpisodes` composable to share episode list between PodcastList and WaitingPage; avoids duplicate fetches when resolving slug from list.
- Added `fetchEpisodeBySlug` API in `api/payload/episodes.ts` for episodes not yet in the list.
- Modal Play button uses existing `usePlayer().toggleEpisode()`—same as episode cards; no new player instance.
- On modal close (overlay, ESC, close button): `router.replace('/')` for clean Back button behavior.
- Refactored PodcastList to consume `useEpisodes`; added `slug` to episode mapping.
- Vercel SPA fallback already covers `/episodes/:slug`; no 404 on refresh.
- Docs: `docs/EPISODE_ROUTE_MODAL.md` describes behavior and limitations (no SSR meta yet).
- `/reset-password`, `/privacy`, `/terms` unchanged.

## 2. DIFFS

### Modified files

```diff
--- a/src/router/index.js
+++ b/src/router/index.js
@@ -12,6 +12,11 @@ const routes = [
     name: 'Home',
     component: WaitingPage
   },
+  {
+    path: '/episodes/:slug',
+    name: 'Episode',
+    component: WaitingPage
+  },
   {
     path: '/reset-password',
```

```diff
--- a/src/components/WaitingPage.vue
+++ b/src/components/WaitingPage.vue
+import { ref, watch } from 'vue'
+import { useRoute, useRouter } from 'vue-router'
+import EpisodeModal from './episodes/EpisodeModal.vue'
+import { useEpisodes } from '@/composables/useEpisodes'
+import { fetchEpisodeBySlug } from '@/api/payload/episodes'
+const route = useRoute()
+const router = useRouter()
+const { items, fetchEpisodes, findEpisodeBySlug } = useEpisodes()
+const selectedEpisode = ref(null)
+const isEpisodeModalOpen = ref(false)
+const episodeNotFound = ref(false)
+watch(() => route.params.slug, async (slug) => { ... }, { immediate: true })
+function handleEpisodeModalClose() { router.replace('/'); ... }
+    <EpisodeModal :open="isEpisodeModalOpen" :episode="selectedEpisode" :episode-not-found="episodeNotFound" @close="handleEpisodeModalClose" />
```

```diff
--- a/src/components/podcast/PodcastList.vue
+++ b/src/components/podcast/PodcastList.vue
-import { ref, onMounted, computed } from 'vue'
-import { authedFetch } from '@/lib/authClient'
+import { onMounted } from 'vue'
+import { useEpisodes } from '@/composables/useEpisodes'
 const { isEpisodePlaying, toggleEpisode } = usePlayer()
+const { items, isLoading, fetchEpisodes, loadNext } = useEpisodes()
-// [~90 lines of fetch/dedupe/map logic removed]
```

### New files

- `src/api/payload/episodes.ts` – `fetchEpisodeBySlug(slug)`, `EpisodeForModal` type, Payload mapping
- `src/composables/useEpisodes.js` – shared episode list, `findEpisodeBySlug`, `toPlaybackShape`
- `src/components/episodes/EpisodeModal.vue` – Dialog wrapper, props: `open`, `episode`, `episodeNotFound`, emit: `close`
- `src/components/episodes/EpisodeModalContent.vue` – cover, title, date, show, genres, description, Play button
- `src/components/ui/dialog/*` – shadcn-vue Dialog primitives (added via CLI)
- `docs/EPISODE_ROUTE_MODAL.md` – behavior and limitations
- `REVIEWER_PACK_EPISODE_URLS.md` – this pack

### Dependencies

- `reka-ui` bumped to ^2.8.0 (via shadcn-vue dialog add)

## 3. LOGS

Build output (no errors):

```
✓ 2210 modules transformed.
✓ built in 1.81s
```

## 4. QUESTIONS & RISKS

- **Payload episode slug**: Assumes episodes have a `slug` field in Payload CMS. If not, `where[slug][equals]` will fail; add a fallback or field mapping if needed.
- **Auth for episodes**: Uses `authedFetch` for both list and slug fetch. If Payload episodes are public, consider a non-authed path for slug-only fetch to avoid auth complexity.
- **Browser Back**: Navigating `/` → `/episodes/x` → Back goes to `/`; modal closes and URL updates. `replace('/')` prevents stacking `/episodes/x` in history on close.
- **Refresh on /episodes/:slug**: Vercel `rewrites` sends all routes to `index.html`; SPA handles routing. No 404.
- **Player location**: Player remains in WaitingPage; `/` and `/episodes/:slug` both use WaitingPage, so no remount. Navigating to `/reset-password` etc. still unmounts the player (unchanged).
- **Episode shape compatibility**: `EpisodeModalContent` accepts both list items (`audioUrl`, `image`) and API result (`src`, `cover`) for flexibility.
