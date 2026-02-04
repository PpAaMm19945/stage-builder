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

## 2026-05-26 - useStableValue Optimization
**Learning:** The `useStableValue` hook was unconditionally calling `JSON.stringify(value)` on every render to check for deep equality. For large objects (like the PDF data in Dashboard), this O(N) operation runs even when the input reference is stable (e.g. from `useMemo`).
**Action:** Added a fast-path reference equality check (`if (value === ref.current) return ref.current`) and implemented lazy initialization for the JSON ref. This reduces the cost to O(1) for stable references, significantly reducing overhead in the Dashboard during unrelated state changes.

## 2026-05-27 - Memoized Hooks for Render Performance
**Learning:** The `useGuestViewTracker` hook was returning a new `trackView` function instance on every render because it wasn't wrapped in `useCallback`. This caused consuming components like `BookLibrary` to recreate their handlers (`handleBookClick`) on every render, which in turn broke `React.memo` optimizations on child components (`BookCard`), leading to O(N) re-renders of the entire list whenever parent state changed.
**Action:** Always wrap returned functions in custom hooks with `useCallback` if they are likely to be used as dependencies in `useEffect` or other `useCallback` hooks in consuming components, especially when those components render large lists of memoized items.

## 2026-05-28 - BookReader Image Loading Optimization
**Learning:** The `BookReader` component was managing `loadedImages` state (a Set of indices) at the top level. Every time a single image loaded, the state update caused the entire `BookReader` and all `CarouselItem` children to re-render. For a 20-page book, this resulted in 20 full re-renders of the carousel.
**Action:** Extracted the image rendering logic into a `BookPageImage` component with its own local `isLoaded` state. This isolated the re-renders to the individual image component, reducing the parent's render count from O(N) to O(1) (only on mount and error).

## 2026-05-28 - Playwright Route Matching
**Learning:** In `verify_book_reader.py`, the pattern `page.route("**/*.png", ...)` failed to intercept requests to `/api/books/.../pages/01` because the URL lacked a file extension, even though the content type was image/png. This caused the test to trigger the error handling path (skipping pages), inadvertently verifying the error propagation logic.
**Action:** When mocking API endpoints that serve files without extensions, use path-based patterns (e.g., `**/pages/*`) instead of extension-based patterns.

## 2026-05-29 - Unstable Date Objects in Memoization
**Learning:** React's `useMemo` and `React.memo` rely on referential equality. Passing `new Date()` as a prop (like `WeekStrip` receiving `weekStart` from `Dashboard`) guarantees a re-render every time the parent renders, even if the time is identical.
**Action:** When memoizing components or hooks dependent on Dates, extract primitive timestamps (e.g. `date.valueOf()`) for the dependency array or `React.memo` comparator. This isolates the component from reference instability in parent state.

## 2026-05-29 - Parallelize R2 Metadata Fetching
**Learning:** The `/api/series` and `/api/series/:id` endpoints were fetching metadata for each item sequentially in a `for` loop. For a series with 20 books, this caused 20 sequential round-trips to R2, significantly increasing latency.
**Action:** Refactored the loops to use `Promise.all` to fetch all metadata in parallel. This changes the latency profile from O(N) to O(1) (bounded by concurrency limits), drastically reducing load times for the library views.

## 2026-05-29 - BookReader Eager Loading Priority
**Learning:** The `BookReader` used a static logic (`index < 3 ? "eager" : "lazy"`) for image loading, ignoring the user's current position in the book. If a user navigated to page 50, the image would be loaded lazily, delaying LCP.
**Action:** Implemented dynamic priority logic where the current page and immediate next page receive `loading="eager"` and `fetchPriority="high"`. This ensures near-instant rendering during navigation while maintaining lazy loading for distant pages.

## 2026-06-01 - Manifest-Based Caching for Book Metadata
**Learning:** `fetchAllBooks` was fetching `metadata.json` for every book in the manifest on every cache miss (5 mins). For 500+ books, this caused 500+ R2 Class B operations per worker every 5 minutes, increasing costs and latency.
**Action:** Implemented `MANIFEST_BOOKS_CACHE` which stores the parsed book list alongside the manifest source. Before fetching metadata, we now compare the current `manifest.json` with the cached manifest using `areManifestsEqual`. If they match, we return the cached book list instantly (0 R2 reads), drastically reducing backend load.

## 2026-06-03 - Memoized BookReader Prompts & LCP Fix
**Learning:** The `BookReader` was performing an O(N) `find()` operation on `readingPrompts` for every page in the `Carousel`, inside the render loop. For a book with many pages and prompts, this unnecessary computation ran on every slide change (re-render). Additionally, React 18 requires the `fetchpriority` attribute (lowercase) for correct browser handling, but `BookPageImage` was using `fetchPriority`, which may be ignored by some browsers or cause React warnings.
**Action:**
1. Memoized `readingPrompts` into a `Map<number, string>` using `useMemo` for O(1) lookup.
2. Updated `BookReader` and `BookPageImage` to use `fetchpriority` (lowercase) with `@ts-expect-error` to ensure images are prioritized correctly for LCP without React type errors.

## 2026-06-05 - Library Tab Caching
**Learning:** The Library page uses `TabsContent` which unmounts inactive tabs. Without `staleTime`, switching between 'Books', 'Hymns', and 'Formations' triggered a new network request every time, even though the content is static.
**Action:** Added `staleTime: 1000 * 60 * 5` (5 minutes) to the `useQuery` hooks in `BookLibrary`, `HymnBrowser`, and `ActivityBrowser`. This allows instant tab switching by serving data from memory.

## 2026-06-05 - Deprecated Dashboard Component
**Learning:** `src/pages/Dashboard.tsx` appears to be the main dashboard but is NOT connected to the `/dashboard` route in `App.tsx`. The actual dashboard is `DailyAnchorView`.
**Action:** Always verify component usage via `App.tsx` routes or `grep` before optimizing, especially for 'main' pages that might have been recently refactored.

## 2026-06-06 - Skipping Redundant Asset URL Queries
**Learning:** The `BookCard` component was firing `useBookAssetUrl` for every book in the library (O(N)), even when the book object already contained a valid, fully-resolved cover URL (passed from the API). This caused hundreds of unnecessary query initiations and effect setups during the initial render of the library.
**Action:** Modified `useBookAssetUrl` to accept an `{ enabled: boolean }` option and updated `BookCard` (and `BookReader`) to pass `enabled: !externalCover`. This ensures the query hook remains idle when the data is already present, significantly reducing the initial render overhead.
