

# Anchor Card: Hymn Player + Book Cover & Reader Fixes

## Current Status

**Hymn Player**: Already integrated in the Liturgy section and hooked to the global audio player. It shows when `hymn_audio_url` is provided by the AI. No changes needed here -- it's working.

**Book Cover**: Not loading because the AI-generated anchor never includes `cover_image` in its output (the AI prompt doesn't ask for it, and the pre-built plan path doesn't set it either). The cover placeholder icon shows instead.

**Book Reader Pages**: Not loading because the `BookReader` needs a valid `series` and `pageCount` to resolve page images from R2. The anchor card hardcodes `pageCount: 12` and defaults `series` to `'library'`, which doesn't match actual R2 paths.

## Plan

### 1. Resolve book covers dynamically (AnchorCard.tsx)

Instead of relying on `book.cover_image` (which the AI never provides), use the existing `useBookAssetUrl` hook to resolve the cover from R2 -- the same way `BookReader` and `BookLibrary` do.

- Import `useBookAssetUrl` into the `BookContent` component
- Call `useBookAssetUrl(series, bookId, 'cover')` to get the actual R2 cover URL
- Use the resolved URL in the `<img>` tag
- Change the cover container from portrait (`w-20 h-28`) to landscape (`w-32 h-24`) since all picture books have landscape covers

### 2. Set cover_image and series in the backend (anchor-generator.ts)

When the anchor generator builds the `book_nook` object (both from pre-built plans and AI generation), enrich it with:

- `cover_image`: constructed from the book's data (e.g., the `cover_image` field from `data.ts`)
- `series`: already extracted via `extractSeriesFromBook` for pre-built plans; for AI-generated ones, look it up from the books list

This ensures the frontend always has the data it needs even without the R2 hook fallback.

### 3. Fix BookReader page loading from anchor (AnchorCard.tsx)

The `bookForReader` object hardcodes `pageCount: 12`. Instead:

- Look up the book in the static book data (or pass through from the anchor payload) to get the correct page count
- Ensure `series` is correctly passed through so `useBookPageUrls` can resolve pages from R2

### 4. Enrich AI prompt to return series with book_nook

Update the AI prompt's `book_nook` schema to include `series` so the AI returns it alongside `id` and `title`. This data is already in the AVAILABLE BOOKS list context.

## Technical Details

### Files to Change

1. **`src/components/anchor/AnchorCard.tsx`**
   - `BookContent`: Add `useBookAssetUrl` hook for cover resolution
   - Change cover container to landscape aspect ratio
   - Look up pageCount from book data or use a sensible default

2. **`cloudflare/src/ai/anchor-generator.ts`**
   - In `generateWithAI` response mapping (line 466): enrich `book_nook` with `cover_image` and `series` from the books data list
   - In `buildFromPlan` (line 267): add `cover_image` from `plan.book.cover_image`
   - Update AI prompt schema to include `"series": "string"` in book_nook

3. **`cloudflare/src/ai/data.ts`**
   - Add `series` field to each book entry (derived from the path, e.g., `my_first_books`, `african_men_of_faith`) so the AI can return it

## Expected Result

- Book covers will display as landscape thumbnails in the anchor card
- The BookReader opened from the anchor will load all page images correctly from R2
- The hymn player continues to work as-is in the Liturgy section
