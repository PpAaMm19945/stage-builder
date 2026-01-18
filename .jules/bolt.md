## 2024-05-23 - N+1 Query Optimization in Planner
**Learning:** The `scoreActivity` function in `cloudflare/src/planner.ts` was executing a database query for every activity candidate in every time slot. This resulted in O(N*M) database calls (Activities * Slots), which could easily exceed 500+ queries per plan generation.
**Action:** Implemented a `prefetchActivityHistory` function to fetch all relevant history for the parent in 2 batch queries (one for observations, one for completions) at the start of the planning process. The `scoreActivity` function was refactored to be synchronous, using an in-memory lookup map. This reduces database calls from ~500 to 2, significantly improving performance and reducing D1 billable reads.

## 2026-01-13 - Static API Endpoint Caching
**Learning:** The global API middleware in `cloudflare/src/index.ts` enforces `Cache-Control: no-store, max-age=0` for all `/api/*` routes to protect sensitive user data. However, this includes heavy, static endpoints like `/api/books` (R2 listing) and `/api/formations` (large DB queries), causing unnecessary server load and latency on every page navigation.
**Action:** Overrode the `Cache-Control` header in specific static handlers (`/api/books`, `/api/formations`, `/api/hymns`, `/api/catechism`) to allow browser caching (`public, max-age=3600`). This maintains security for user-specific routes while significantly speeding up content browsing.

## 2026-05-25 - Dashboard DailyRhythm Performance
**Learning:** The `Dashboard` component was re-creating the `timelineItems` array and handler functions on every render. This caused the `DailyRhythm` component (which renders a potentially long list of items) to re-render fully, even for small state changes like opening a book or checking a checkbox. Additionally, the list items within `DailyRhythm` were not memoized, leading to O(N) re-renders for N items.
**Action:**
1. Extracted `RhythmItemRow` into a memoized component.
2. Memoized `timelineItems` creation in `Dashboard` using `useMemo`.
3. Memoized handlers (`handleRhythmComplete`, `handleBookClick`, `handleSwap`) using `useCallback`.
4. Ensured all hooks in `Dashboard` are called before any conditional returns (e.g. loading states) to adhere to Rules of Hooks.
