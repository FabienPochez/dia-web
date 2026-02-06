# Nuxt 3 Integration Audit — Legal Pages (/privacy, /terms)
## Reviewer Pack

---

## 1. SUMMARY

- **Current Stack**: Vue 3.4.0 SPA with Vite 5.0.0, vue-router 4.6.3 (HTML5 history mode), static hosting on Vercel
- **Routes**: `/` (WaitingPage), `/reset-password` (ResetPassword with query token), catch-all redirects to `/`
- **Router Config**: `createWebHistory()` (no base path), PostHog analytics tracking via `afterEach` guard
- **Build Output**: Static SPA (`vite build` → `dist/`), served via Vercel rewrite rule (`/(.*)` → `/index.html`)
- **Integration Risk Assessment**: Option C (static HTML) = lowest risk, Option B (Nuxt micro-app) = medium risk, Option A (full migration) = highest risk
- **Recommended Path**: **Option C** — serve static HTML files for `/privacy` and `/terms` without Nuxt (fastest, zero breaking changes)
- **Alternative Path**: **Option B** — Nuxt micro-app mounted at `/legal/*` subpath (if Nuxt features needed later)
- **Critical Constraint**: `/reset-password` route must remain functional (uses `route.query.token` for password reset flow)
- **Vercel Config**: Already configured for SPA routing; static files in `public/` are served directly before rewrite rule
- **No Nuxt Currently**: Zero Nuxt dependencies or configuration files present

---

## 2. DIFFS

**No changes** — Audit-only review, no code modifications made.

---

## 3. LOGS

No commands executed — audit performed via file system inspection only.

---

## 4. QUESTIONS & RISKS

- **Q1**: Do `/privacy` and `/terms` need dynamic content, SEO meta tags, or server-side rendering, or are they static HTML?
- **Q2**: Should legal pages share the same design system (Tailwind CSS, shadcn-vue components) as the main app, or can they be standalone?
- **Q3**: Will legal pages need to be updated frequently, or are they one-time static content?
- **Q4**: Is there a requirement to use Nuxt specifically, or is the goal just to publish `/privacy` and `/terms` quickly?
- **Risk 1**: Full Nuxt migration (Option A) would require converting all routes to `pages/` directory, replacing `<router-view>` with `<NuxtPage>`, and potential conflicts with vue-router
- **Risk 2**: Nuxt micro-app (Option B) requires careful routing configuration to avoid conflicts between vue-router and Nuxt router, especially for `/reset-password`
- **Risk 3**: Adding Nuxt increases bundle size and build complexity; static HTML (Option C) has zero runtime overhead
- **Risk 4**: Vercel rewrite rule `/(.*)` → `/index.html` must be preserved; static files in `public/` are served before the rewrite, so `/privacy.html` would work but `/privacy` (without extension) needs routing consideration

---

## DETAILED ANALYSIS

### 1. Current Stack + Constraints

#### Framework & Build Tool
- **Vue**: `3.4.0` (Composition API, `<script setup>`)
- **Build Tool**: `Vite 5.0.0` with `@vitejs/plugin-vue`
- **Router**: `vue-router 4.6.3` using `createWebHistory()` (HTML5 history mode, no base path)
- **Architecture**: **SPA (Single Page Application)** — no SSR, no server-side rendering
- **Entry Point**: `src/main.js` → `createApp(App)` → `app.use(router)` → `app.mount('#app')`
- **Root Component**: `src/App.vue` contains `<router-view />` only

#### Hosting Target Assumptions
- **Platform**: Vercel (static hosting)
- **Deployment Config**: `vercel.json` with SPA rewrite rule:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Build Output**: `vite build` produces static files in `dist/` directory
- **Static Assets**: Files in `public/` are served directly (before rewrite rule applies)
- **No SSR Required**: Current setup is pure client-side SPA

#### Dependencies & Tooling
- **UI Framework**: Tailwind CSS v4, shadcn-vue components
- **Analytics**: PostHog (`posthog-js`) with route tracking
- **State Management**: None (local component state, composables)
- **API Client**: Axios, custom `authClient.ts` for JWT authentication

---

### 2. Routing Inventory

#### Current Routes
```javascript
// src/router/index.js
const routes = [
  { path: '/', name: 'Home', component: WaitingPage },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/:pathMatch(.*)*', redirect: '/' }  // catch-all → home
]
```

**Route Details:**
- **`/`**: Home page (`WaitingPage.vue`) — main landing page with live shows
- **`/reset-password`**: Password reset page (`ResetPassword.vue`) — **CRITICAL ROUTE**
  - Uses `route.query.token` to extract reset token from URL query string
  - Example: `/reset-password?token=abc123`
  - Must remain functional — users receive email links with this format
- **Catch-all**: All other paths redirect to `/`

#### Router Configuration
- **History Mode**: `createWebHistory()` (HTML5 history API, no hash routing)
- **Base Path**: None (root domain `/`)
- **Router Guards**: 
  - `router.afterEach()` hook captures PostHog pageview events
  - No `beforeEach` guards, no authentication checks in router

#### Router Usage in Components
- `ResetPassword.vue` uses `useRoute()` and `useRouter()`:
  - `route.query.token` — reads token from URL
  - `router.push('/')` — navigates to home on logo click

#### Vercel Routing Behavior
- Static files in `public/` are served **before** the rewrite rule
- Example: `public/privacy.html` → accessible at `/privacy.html` (with extension)
- For `/privacy` (no extension) → rewrite rule sends to `/index.html` → Vue Router handles it
- **Implication**: Static HTML files need `.html` extension OR must be added as Vue Router routes

---

### 3. Integration Strategy Options

### Option A: Full Migration to Nuxt 3 (Pages Directory)

**Approach**: Convert entire app to Nuxt 3, use `pages/` directory for file-based routing.

**Expected Impact:**
- **High**: Complete restructure of project
- **Routes**: Convert to `pages/index.vue`, `pages/reset-password.vue`, `pages/privacy.vue`, `pages/terms.vue`
- **Router**: Remove `vue-router`, use Nuxt's built-in router (`<NuxtPage>` instead of `<router-view>`)
- **Entry Point**: Replace `src/main.js` with Nuxt app structure (`app.vue`, `nuxt.config.ts`)
- **Build**: Replace `vite build` with `nuxt build` (Nuxt uses Vite internally but config differs)

**Steps Required:**
1. Install Nuxt 3: `npm install nuxt@^3`
2. Create `nuxt.config.ts` with Vue 3 compatibility settings
3. Move `src/components/` → `components/` (Nuxt auto-imports)
4. Move `src/composables/` → `composables/` (Nuxt auto-imports)
5. Create `pages/index.vue` (replace `WaitingPage` route)
6. Create `pages/reset-password.vue` (migrate `ResetPassword` component)
7. Create `pages/privacy.vue` and `pages/terms.vue` (new legal pages)
8. Replace `src/App.vue` with `app.vue` (use `<NuxtPage>`)
9. Remove `src/router/index.js` (Nuxt handles routing)
10. Update `vite.config.js` → `nuxt.config.ts` (merge configs)
11. Update PostHog tracking to use Nuxt `useRouter()` composable
12. Test `/reset-password?token=...` flow (critical)
13. Update `vercel.json` if Nuxt SSR is enabled (may need serverless function)

**Risk Level**: **HIGH**
- Breaking changes to existing routes
- Potential conflicts with vue-router → Nuxt router migration
- PostHog tracking may break if not updated correctly
- `/reset-password` route must be tested thoroughly
- Build process changes (Vite → Nuxt build)
- Possible bundle size increase

**Pros:**
- Unified framework (Nuxt for everything)
- File-based routing is intuitive
- Future SSR/SSG capabilities if needed
- Auto-imports for components/composables

**Cons:**
- High migration effort (days/weeks)
- Risk of breaking existing functionality
- Learning curve for Nuxt-specific APIs
- Overkill for just adding 2 static pages

---

### Option B: Nuxt as "Legal Micro-App" (Subpath Mount)

**Approach**: Keep main Vue SPA as-is, mount Nuxt app under `/legal/*` subpath for legal pages.

**Expected Impact:**
- **Medium**: Dual-framework setup (Vue SPA + Nuxt micro-app)
- **Routes**: Main app routes unchanged; Nuxt handles `/legal/privacy`, `/legal/terms`
- **Router**: Two routers coexist (vue-router for main app, Nuxt router for `/legal/*`)
- **Build**: Two build processes (`vite build` for main app, `nuxt build` for legal pages)
- **Deployment**: Merge outputs or serve Nuxt from subdirectory

**Steps Required:**
1. Create `legal-app/` directory for Nuxt micro-app
2. Install Nuxt 3 in `legal-app/`: `npm install nuxt@^3`
3. Create `legal-app/nuxt.config.ts` with `base: '/legal'` or `router.base: '/legal'`
4. Create `legal-app/pages/privacy.vue` and `legal-app/pages/terms.vue`
5. Configure Vercel to serve `/legal/*` from Nuxt build output
   - Option B1: Separate Vercel project for legal pages
   - Option B2: Build both apps and merge `dist/` outputs
   - Option B3: Use Vercel rewrites to proxy `/legal/*` to Nuxt app
6. Ensure CSS/styling consistency (share Tailwind config or duplicate)
7. Test that `/reset-password` still works (should be unaffected)

**Risk Level**: **MEDIUM**
- Complex deployment setup (two apps, two builds)
- Potential CSS/styling conflicts if not shared
- Routing edge cases (what if user navigates from main app to `/legal/*`?)
- Build process complexity (two separate builds or merged outputs)
- Vercel configuration complexity

**Pros:**
- Main app remains unchanged (low risk)
- Nuxt available for future legal page features
- Isolated legal pages (easier to maintain separately)

**Cons:**
- Dual-framework overhead
- Complex build/deployment setup
- Potential routing confusion (`/legal/privacy` vs `/privacy`)
- More moving parts to maintain

---

### Option C: Static HTML Pages (No Nuxt)

**Approach**: Create static HTML files for `/privacy` and `/terms`, serve them directly or via Vue Router.

**Expected Impact:**
- **Low**: Minimal changes to existing codebase
- **Routes**: Add two routes to `vue-router` OR serve static HTML files
- **Router**: Option C1: Add routes to vue-router, Option C2: Serve static files from `public/`
- **Build**: No changes to build process
- **Deployment**: Static files served as-is

**Implementation Options:**

**C1: Vue Router Routes (Recommended)**
- Create `src/pages/Privacy.vue` and `src/pages/Terms.vue` (or `src/components/legal/`)
- Add routes to `src/router/index.js`:
  ```javascript
  { path: '/privacy', component: Privacy },
  { path: '/terms', component: Terms }
  ```
- Benefits: Shared Tailwind CSS, consistent styling, PostHog tracking works
- Risk: Very low (just adding routes)

**C2: Static HTML Files**
- Create `public/privacy.html` and `public/terms.html`
- Accessible at `/privacy.html` and `/terms.html` (with extension)
- For extensionless URLs (`/privacy`, `/terms`), either:
  - Add Vue Router routes that redirect to `.html` files, OR
  - Use Vercel rewrites to serve HTML files without extension
- Risk: Very low, but URLs have `.html` extension unless configured

**C3: Hybrid (Static HTML + Router Redirect)**
- Create `public/privacy.html` and `public/terms.html`
- Add Vue Router routes that load HTML content via `<iframe>` or fetch + render
- Not recommended (complex, poor UX)

**Steps Required (C1 — Recommended):**
1. Create `src/components/legal/Privacy.vue` and `src/components/legal/Terms.vue`
2. Add routes to `src/router/index.js`:
   ```javascript
   import Privacy from '@/components/legal/Privacy.vue'
   import Terms from '@/components/legal/Terms.vue'
   
   { path: '/privacy', name: 'Privacy', component: Privacy },
   { path: '/terms', name: 'Terms', component: Terms }
   ```
3. Place routes **before** catch-all route (order matters)
4. Test `/privacy` and `/terms` routes
5. Verify PostHog tracking works (should auto-track via `afterEach`)

**Risk Level**: **LOWEST**
- Minimal code changes (2 components + 2 routes)
- No new dependencies
- No build process changes
- No router conflicts
- `/reset-password` unaffected
- Fastest to implement (hours, not days)

**Pros:**
- Fastest implementation (1-2 hours)
- Zero breaking changes
- Shared styling (Tailwind CSS)
- PostHog tracking works automatically
- No new dependencies
- Easy to update content later

**Cons:**
- Not using Nuxt (if Nuxt is a hard requirement, this won't work)
- No SSR/SSG benefits (but not needed for static legal pages)
- Manual route management (but only 2 routes)

---

### 4. Recommended Path: Option C (Static HTML via Vue Router)

**Rationale:**
- **Lowest Risk**: No breaking changes, existing routes remain functional
- **Fastest**: Can be implemented in 1-2 hours
- **Simplest**: No new dependencies, no build process changes
- **Maintainable**: Legal pages are Vue components, easy to update
- **Consistent**: Shares Tailwind CSS and design system with main app
- **Tracking**: PostHog analytics works automatically via existing `afterEach` hook

**Why Not Option A (Full Migration)?**
- Overkill for adding 2 static pages
- High risk of breaking `/reset-password` route
- Significant time investment (days/weeks)
- No clear benefit for static legal pages

**Why Not Option B (Nuxt Micro-App)?**
- Complex deployment setup
- Dual-framework overhead
- Unnecessary complexity for static content
- Harder to maintain

**When to Consider Option A or B:**
- If legal pages need dynamic content or SSR
- If you plan to migrate entire app to Nuxt eventually
- If you need Nuxt-specific features (middleware, plugins, modules)

---

### 5. Next Steps Checklist (Option C — Recommended)

#### Phase 1: Create Legal Page Components
- [ ] Create `src/components/legal/Privacy.vue` component
  - Use Tailwind CSS classes (match existing design system)
  - Include privacy policy content (text/markdown)
  - Optional: Use shadcn-vue components for consistent UI
- [ ] Create `src/components/legal/Terms.vue` component
  - Use Tailwind CSS classes (match existing design system)
  - Include terms of service content (text/markdown)
  - Optional: Use shadcn-vue components for consistent UI

#### Phase 2: Add Routes
- [ ] Open `src/router/index.js`
- [ ] Import Privacy and Terms components:
  ```javascript
  import Privacy from '@/components/legal/Privacy.vue'
  import Terms from '@/components/legal/Terms.vue'
  ```
- [ ] Add routes to `routes` array **before** catch-all route:
  ```javascript
  { path: '/privacy', name: 'Privacy', component: Privacy },
  { path: '/terms', name: 'Terms', component: Terms },
  ```
- [ ] Verify route order: `/`, `/reset-password`, `/privacy`, `/terms`, catch-all

#### Phase 3: Testing
- [ ] Test `/privacy` route (should render Privacy component)
- [ ] Test `/terms` route (should render Terms component)
- [ ] Test `/reset-password?token=test` (should still work — critical)
- [ ] Test `/` route (should still work)
- [ ] Verify PostHog tracking fires for `/privacy` and `/terms` (check browser console/PostHog dashboard)
- [ ] Test navigation between routes (e.g., from `/` to `/privacy`)

#### Phase 4: Content & Styling
- [ ] Add privacy policy content to `Privacy.vue` (text, HTML, or markdown)
- [ ] Add terms of service content to `Terms.vue` (text, HTML, or markdown)
- [ ] Style pages to match main app design (dark theme, Tailwind classes)
- [ ] Optional: Add navigation links (e.g., footer links to `/privacy` and `/terms`)

#### Phase 5: Deployment
- [ ] Run `npm run build` locally to verify build succeeds
- [ ] Test production build locally: `npm run serve`
- [ ] Deploy to Vercel (should work automatically — no config changes needed)
- [ ] Verify `/privacy` and `/terms` are accessible on production
- [ ] Verify `/reset-password` still works on production (critical)

#### Alternative: Option C2 (Static HTML Files)
If you prefer static HTML files instead of Vue components:
- [ ] Create `public/privacy.html` and `public/terms.html`
- [ ] Add Vue Router routes that redirect to `.html` files:
  ```javascript
  { path: '/privacy', redirect: '/privacy.html' },
  { path: '/terms', redirect: '/terms.html' }
  ```
- [ ] Or configure Vercel rewrites to serve HTML without extension (more complex)

---

## APPENDIX: File Structure Reference

### Current Structure
```
dia-web/
├── public/              # Static assets (served directly)
│   ├── .well-known/
│   └── img/
├── src/
│   ├── components/
│   │   ├── ResetPassword.vue    # /reset-password route
│   │   ├── WaitingPage.vue      # / route
│   │   └── ...
│   ├── router/
│   │   └── index.js             # vue-router config
│   ├── App.vue                   # Root component (<router-view />)
│   └── main.js                   # Entry point
├── index.html
├── vite.config.js
├── vercel.json                   # SPA rewrite rule
└── package.json
```

### After Option C Implementation
```
dia-web/
├── src/
│   ├── components/
│   │   ├── legal/
│   │   │   ├── Privacy.vue      # NEW: /privacy route
│   │   │   └── Terms.vue        # NEW: /terms route
│   │   ├── ResetPassword.vue
│   │   └── ...
│   ├── router/
│   │   └── index.js             # MODIFIED: Added 2 routes
│   └── ...
└── ...
```

---

## CONCLUSION

**Recommended Approach**: **Option C (Static HTML via Vue Router)** — add `/privacy` and `/terms` as Vue Router routes with simple Vue components.

**Rationale**: Fastest, lowest risk, zero breaking changes, maintains consistency with existing app.

**Estimated Time**: 1-2 hours for implementation + content writing.

**Risk**: Minimal — only adding routes, no changes to existing functionality.

**Next Action**: Create `src/components/legal/Privacy.vue` and `src/components/legal/Terms.vue`, then add routes to `src/router/index.js`.

---

*Audit completed: 2026-02-06*
*No code changes made — audit-only review*
