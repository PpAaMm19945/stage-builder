

# Fix: BookReader Progress Bar & Page Numbering + Build Error

## Two Issues

### Issue 1: Build Error in ConflictResolver.tsx

The API returns `SpineConflict[]` (with fields `id`, `version`, `week`, `description`, `severity`, `resolved`) but the component's local `Conflict` interface expects `week_number`, `subject`, `conflicting_entries`. These types don't match.

**Fix:** Replace the local `Conflict` interface with `SpineConflict` from `@/types/admin-ai`, and update all references in the component to use the correct field names (`week` instead of `week_number`, etc.).

### Issue 2: BookReader Progress Bar + Page Numbering

The progress bar and page label use two different counting systems that conflict:

- `count` = carousel snap count (Cover + all image pages + End slide) -- set by the Embla carousel API
- `totalPages` = just the content images (from `imagePages.length`)

**The bugs:**

1. **Progress bar** (line 391): `current / count` -- since `count` includes Cover + End, the bar reaches ~95% on the last real page and 100% on the End slide. But `count` is set asynchronously by the carousel, causing it to sometimes be wrong early on.

2. **Page label** (line 417): `current === (count || totalPages + 2)` checks for "The End" but uses `count` (carousel) OR `totalPages + 2` as a fallback. If `count` initializes to a small value before all slides load, early pages incorrectly match the "end" condition.

3. **"Page X of Y"** (line 418): Shows `current - 1` as page number (subtracting 1 for the cover), but `validImagePages.length` as total. These are correct in isolation but the "end" check above fires too early, skipping this display.

**Fix:** Simplify the entire numbering system to derive everything from `totalPages` (the actual content page count):

```text
Total slides = 1 (cover) + totalPages (content) + 1 (end) = totalPages + 2

Progress: (current - 1) / (totalPages + 1)
  - Page 1 (cover): 0%
  - Page 2 (first content): 1/(totalPages+1)
  - Last content page: totalPages/(totalPages+1) 
  - End slide: 100%

Label:
  - current === 1: "Cover"
  - current === totalPages + 2: "The End"  
  - Otherwise: "Page {current - 1} of {totalPages}"
```

This removes dependence on `count` (the async carousel value) for display purposes, using it only for carousel mechanics.

---

## Technical Changes

### File: `src/components/admin/spine/ConflictResolver.tsx`
- Import `SpineConflict` from `@/types/admin-ai`
- Remove local `Conflict` interface
- Update `useState<Conflict[]>` to `useState<SpineConflict[]>`
- Update field references throughout (`week_number` to `week`, remove `subject`/`conflicting_entries` usage or adapt rendering)

### File: `src/components/books/BookReader.tsx`
- **Progress bar** (line 391): Change `current / count` to `(current - 1) / (totalPages + 1)` -- this makes cover = 0%, end = 100%
- **Page label** (lines 416-420): Replace the `count`-dependent logic:
  - `current === 1` -> "Cover"
  - `current > totalPages + 1` -> "The End"
  - else -> `Page ${current - 1} of ${totalPages}`
- **Close handler** (line 314): Replace `count` reference with `totalPages + 2`
- **Progress bar guard** (line 387): Change `count > 0` to `totalPages > 0` so the bar shows as soon as pages are known, not waiting for carousel init

