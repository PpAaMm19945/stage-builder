

# Book Completion, Progress Tracking, and Content Safety

## What This Plan Covers

1. Make progress saving work for both guests and signed-in users
2. Add a "times read" counter for completed books
3. Hide unfinished books from the library and AI suggestions
4. Fix the Anchor Card so picture books can be opened (not just markdown books)
5. Fix author attribution for Gospel Series books

---

## Completed vs. Draft Series (Your Input Applied)

**Published series** (have images in R2, ready to read):
- `african_men_of_faith` -- all picture books (Athanasius, Augustine, Cyprian, Moses, Perpetua)
- `the_gospel_series` -- all picture books (King Nebuchadnezzar, Pharaoh, etc.)
- `my_first_books` -- all picture books

**Draft series** (still being built, should be hidden):
- `working_fathers_of_soroti`
- `sanyus_growing_heart`
- `african_history` (textbook, markdown-based)
- `young_historians_africa`
- `the_a_to_z_picture_books_for_kids`

**Author fix:** The Gospel Series currently shows "HomeLine Library" as author in the AI data. This will be corrected to "Anthony Mwesigwa" everywhere.

---

## Fix 1: Guest vs. Signed-In Progress

**Problem:** `progress.save()` calls `requireAuth()` on the backend, so guest saves silently fail. The parameter names also don't match cleanly.

**Changes:**

**`src/components/books/BookReader.tsx`:**
- Before calling `progress.save()`, check `!!user`
- If guest: save to `localStorage` (key: `fp_book_progress_{bookId}`) with `{ current_page, total_pages, timestamp }`
- If signed in: call the API as before, but fix the parameter to send `contentId` instead of `activityId`
- On book open: check localStorage first (works for both), then API (signed-in only)
- Close dialog messaging:
  - **Signed in:** "Yes, mark complete" / "No, continue later (Save page)" (current behavior)
  - **Guest:** "Yes, mark complete" becomes disabled with text "Sign in to save completion" + small link to `/login`. "Save page" still works via localStorage with a note: "Progress saved on this device. Sign in to sync across devices."
- Resume dialog: works for both guests (localStorage) and signed-in users (API), same UI

**`src/lib/api.ts` (`progress.save`):**
- Change parameter names from `{ activityId, progressData }` to `{ contentId, data, contentType }` to match what the backend actually parses

---

## Fix 2: Completion Counter

**Problem:** The `/api/reading/complete` endpoint requires books to exist in the `formations` database table. Picture books from R2 are not in that table, so completion fails with a 404.

**Changes:**

**`cloudflare/src/routes/library.ts` (reading/complete endpoint, lines 1116-1135):**
- Remove the `formations` table lookup
- Use `${series}/${bookId}` directly as the `book_id` in the `reading_sessions` INSERT
- This lets any R2-hosted book be completed without needing a formations seed

**`cloudflare/src/routes/library.ts` (new endpoint or extend reading/history):**
- Add a query to return per-book read counts: `SELECT book_id, COUNT(*) as times_read FROM reading_sessions WHERE parent_id = ? GROUP BY book_id`
- Return this alongside the history response

**Frontend (`src/components/books/BookCard.tsx` or `BookSeriesRow.tsx`):**
- For signed-in users, show a small "Read Nx" badge on books that have completion records

---

## Fix 3: Filter Incomplete Books

Two places need filtering: the R2 library listing and the hardcoded AI data.

### 3A: R2 Library (`fetchAllBooks` in `cloudflare/src/routes/library.ts`)

**Strategy:** Default books to `"published"` (since most R2 books are complete). Explicitly mark draft series.

- After parsing each book's metadata, check for a `status` field
- If `status === "draft"`, skip the book
- If no `status` field, default to `"published"` (included)

**R2 metadata changes needed (you do this manually):**

You will need to add `"status": "draft"` to the `metadata.json` files for these series/books in your R2 bucket. Here is how:

1. Go to your Cloudflare Dashboard
2. Navigate to R2 > your bucket > browse to each series folder
3. Find the `metadata.json` file for each draft series/book
4. Download it, add `"status": "draft"` to the JSON, re-upload

The specific files to edit:
- `working_fathers_of_soroti/{each_book}/metadata.json`
- `sanyus_growing_heart/{each_book}/metadata.json`
- `young_historians_africa/{each_book}/metadata.json` (if exists)
- `the_a_to_z_picture_books_for_kids/{each_book}/metadata.json` (if exists)
- `african_history/{each_book}/metadata.json` (if exists)

Alternatively, I can add a hardcoded blocklist in `fetchAllBooks` so you don't need to touch R2 at all. This is simpler and I recommend it:

```
const DRAFT_SERIES = [
  'working_fathers_of_soroti',
  'sanyus_growing_heart', 
  'young_historians_africa',
  'the_a_to_z_picture_books_for_kids',
  'african_history'
];
```

Books in these series are filtered out. When you finish a series, you remove it from the list.

### 3B: AI Data (`cloudflare/src/ai/data.ts` and `arc-generator.ts`)

The AI uses a hardcoded `BOOKS_DATA` array (not the R2 listing). It currently includes Sanyu and Working Fathers books.

- Filter `BOOKS_DATA` in `arc-generator.ts` line 317 to exclude draft series before sending to the AI prompt
- Fix author: change "HomeLine Library" to "Anthony Mwesigwa" for all Gospel Series entries in `data.ts`
- Add `series` field to each `BookData` entry so filtering works (currently only has `id`, `title`, `path` -- the series is embedded in the path but not as a field)

---

## Fix 4: Anchor Card Book Opening

**Problem:** `BookContent` in `AnchorCard.tsx` hardcodes `renderFormat: 'markdown'` and only shows the "Read This Book" button when `content_path` exists. Picture books have no `content_path` -- they use image pages from R2.

**Changes:**

**`src/components/anchor/AnchorCard.tsx` (BookContent, lines 419-464):**
- Detect render format: if the book's series is a known picture book series, set `renderFormat: 'images'` instead of `'markdown'`
- Remove the `{book.content_path && ...}` guard on the "Read This Book" button -- always show it
- The `BookReader` already handles image-based books via `useBookPageUrls` when `renderFormat` is `'images'`

**`cloudflare/src/ai/anchor-generator.ts`:**
- When building `book_nook` in the anchor response, include `render_format: 'images'` for picture books so the frontend knows how to render
- Add `series` to the `book_nook` payload so the reader can resolve R2 pages

---

## Technical Summary

| Fix | Files Changed | Risk |
|-----|--------------|------|
| 1. Guest/auth progress | `BookReader.tsx`, `api.ts` | Medium |
| 2. Completion counter | `library.ts` (backend) | Low |
| 3A. Filter drafts (R2) | `library.ts` (backend) | Low |
| 3B. Filter drafts (AI) | `data.ts`, `arc-generator.ts` | Low |
| 4. Anchor book opening | `AnchorCard.tsx`, `anchor-generator.ts` | Low |

