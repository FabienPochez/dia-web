# Reviewer Pack: Episode API Runaway (CPU Spike)

## 1. SUMMARY

- **Root cause**: `useLiveSchedule.js` → `scheduleNextTimers()` schedules a `setTimeout(..., preDelay)` where `preDelay` can be **0** when the current show is within 90 seconds of its `scheduledEnd`.
- **Runaway path**: `preDelay = 0` → tick fires immediately → `fetchLiveSchedule()` → `getNowPlaying()` (same query) → same show returned → `preDelay` still 0 → re-schedule with 0 → **tight loop**.
- **Exact API**: `GET /api/episodes?where[and][0][scheduledAt][less_than_or_equal]=...&where[and][1][scheduledEnd][greater_than]=...&where[and][2][scheduledAt][exists]=true&sort=scheduledAt&limit=50&depth=1` issued by `getNowPlaying()` in `src/api/payload/schedule.ts`.
- **Trigger components**: `LiveCard.vue` and `SimplePlayer.vue` both use `useLiveSchedule()`, which shares module-level state; first mount starts the schedule.
- **Polling design**: Intended refresh cadence is heartbeat (5 min), pre-roll (90 s before show end), and confirm (30 s after show end); no `setInterval`.
- **Bug**: `Math.max(0, end - now - PRE_ROLL_MS + jitter())` yields 0 when `end - now < 90_000`, causing immediate re-scheduling and thus multiple requests per second.
- **WhatsNext.vue** uses a different query (`scheduledAt[greater_than]` for future episodes) and polls at 30 s; not the runaway source.
- **setDefaultLive()** in `usePlayer.js` calls `getNowPlaying()` once on SimplePlayer mount; not the looping trigger.
- **Proposed fix**: Enforce a minimum delay (e.g. 10–15 s) for boundary timers so `preDelay` and `confirmDelay` never schedule sub-second ticks.

---

## 2. DIFFS (unified diff only)

```diff
--- a/src/composables/useLiveSchedule.js
+++ b/src/composables/useLiveSchedule.js
@@ -16,6 +16,7 @@ const HEARTBEAT_MS = 5 * 60_000
 const JITTER_RANGE_MS = 20_000
 let fetchCount = 0
+const MIN_BOUNDARY_DELAY_MS = 15_000

 function scheduleNextTimers(show) {
   clearTimers()
@@ -106,8 +107,11 @@ function scheduleNextTimers(show) {
   const preDelay = Math.max(0, end - now - PRE_ROLL_MS + jitter())
   const confirmDelay = Math.max(0, end - now + CONFIRM_MS + jitter())
 
-  activeTimeout = setTimeout(() => tick('pre-roll'), preDelay)
-  heartbeatTimeout = setTimeout(() => tick('confirm'), confirmDelay)
+  if (preDelay >= MIN_BOUNDARY_DELAY_MS) {
+    activeTimeout = setTimeout(() => tick('pre-roll'), preDelay)
+  }
+  heartbeatTimeout = setTimeout(() => tick('confirm'), Math.max(MIN_BOUNDARY_DELAY_MS, confirmDelay))
 }
```

---

## 3. LOGIC FLOW: Why Multiple Requests Per Second Occur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ useLiveSchedule (module-level state)                                         │
│ - LiveCard + SimplePlayer both call useLiveSchedule()                        │
│ - First mount → trackUsage() → usageCount=1 → startSchedule()                │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ fetchLiveSchedule(true)                                                      │
│   → getNowPlaying()  [GET /api/episodes?scheduledAt<=now&scheduledEnd>now]   │
│   → currentShow = result                                                     │
│   → scheduleNextTimers(result)                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ scheduleNextTimers(show)                                                     │
│   preDelay = max(0, end - now - 90_000 + jitter())                           │
│   confirmDelay = max(0, end - now + 30_000 + jitter())                        │
│                                                                              │
│   If show ends in 60 seconds:                                                 │
│     preDelay = max(0, 60000 - 90000 + jitter) = 0  ← BUG                     │
│     activeTimeout = setTimeout(tick, 0)  → fires on next tick                │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ tick('pre-roll')                                                             │
│   → fetchLiveSchedule(false)                                                 │
│   → getNowPlaying()  [same API request]                                      │
│   → API still returns SAME show (it is still "now playing")                   │
│   → scheduleNextTimers(sameShow)                                             │
│   → preDelay still 0  → setTimeout(tick, 0) again                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         └──────────► LOOP (many req/sec)
```

**Critical path**: Within the last 90 seconds of a show, `preDelay` becomes 0. The pre-roll tick runs immediately, fetches, receives the same show, and schedules another immediate tick. Because the show has not ended, the API response is unchanged, so the loop continues until the show actually ends (or the tab is closed).

---

## 4. Proposed Minimal Fix

1. **Location**: `src/composables/useLiveSchedule.js`, `scheduleNextTimers()`.

2. **Change**: Enforce a minimum delay for boundary timers:
   - Add `const MIN_BOUNDARY_DELAY_MS = 15_000`.
   - Schedule the pre-roll timer only if `preDelay >= MIN_BOUNDARY_DELAY_MS` (skip when already in the pre-roll window).
   - Use `Math.max(MIN_BOUNDARY_DELAY_MS, confirmDelay)` for the confirm timer so it never runs in under 15 seconds.

3. **Effect**:
   - When the show is within 90 s of end, the pre-roll timer is not scheduled, avoiding the 0-delay loop.
   - The confirm timer still runs at least 15 s later and will refresh when the show changes.
   - Heartbeat (5 min) remains the only other refresh when there is no valid show end.

4. **No refactor**: No new endpoint, no architecture change, only a guard on timer scheduling.

---

## 5. Call Graph (getNowPlaying)

| Caller                     | When                    | Shared / Duplicate |
|---------------------------|-------------------------|-------------------|
| useLiveSchedule            | Initial + heartbeat + boundary ticks | Primary (shared) |
| usePlayer.setDefaultLive() | SimplePlayer onMounted  | One-time, separate fetch |

---

## 6. Files Involved

| File                         | Role                                |
|------------------------------|-------------------------------------|
| `src/api/payload/schedule.ts` | `getNowPlaying()` – builds the query |
| `src/composables/useLiveSchedule.js` | Schedules fetches, contains runaway bug |
| `src/components/live/LiveCard.vue`   | Uses `useLiveSchedule()`            |
| `src/components/player/SimplePlayer.vue` | Uses `useLiveSchedule()` + `setDefaultLive()` |
| `src/components/live/WhatsNext.vue`  | Different query, 30 s polling        |
