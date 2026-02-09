
# Fix Completion, Progress Saving, and Reading Completion

## Issue 1: Anchor Completion Still Failing (400 Bad Request)

**Root Cause**: The `anchor.complete()` API method sends `{ date, feedback }` but the backend expects `{ anchorId }`. The fix from the last round changed the URL routing (fixing the 405) but the payload is still wrong.

In `src/lib/api.ts` line 798:
```typescript
complete: (date: string, feedback?: string) =>
    apiRequest('/api/anchor/complete', {
      method: 'POST',
      body: JSON.stringify({ date, feedback }),  // WRONG - backend expects anchorId
    }),
```

**Fix**: Change the `complete` method to accept and send `anchorId`:
```typescript
complete: (anchorId: string, feedback?: { rating?: number; notes?: string; lovedIt?: boolean }) =>
    apiRequest('/api/anchor/complete', {
      method: 'POST',
      body: JSON.stringify({ anchorId, ...feedback }),
    }),
```

Then in `DailyAnchorView.tsx` line 38, change:
```typescript
await anchorApi.complete(anchor.date);
```
To:
```typescript
await anchorApi.complete(anchor.id);
```

## Issue 2: Progress Save 500 (Internal Server Error)

**Root Cause**: The `content_progress` table likely doesn't exist in D1. The backend tries to SELECT/INSERT into it and crashes with a 500.

**Fix**: Add a `CREATE TABLE IF NOT EXISTS` guard in the progress save route (`cloudflare/src/routes/reading_progress.ts`) before the SELECT/INSERT, or ensure the table is created during deployment. Since this is a backend Cloudflare Worker file, we will add a safe table creation check at the start of the save handler.

## Issue 3: Reading Complete 400 (Bad Request)

**Root Cause**: When the BookReader is opened from the Anchor card, `book.series` is set to the `seriesId` extracted from the anchor payload. If the AI didn't return a `series` field, the fallback logic may produce an incorrect value. The backend's `/api/reading/complete` requires both `series` and `bookId` to be non-empty strings, so if `series` is empty/undefined, it returns 400.

**Fix**: Ensure `seriesId` in `AnchorCard.tsx` always has a valid fallback. The `BookContent` component already extracts it, but we need to verify it never passes an empty string. Add a guard so the reading complete call only fires when series is valid.

## Issue 4: CORS error on manifest.json (Non-critical)

The console shows a CORS error fetching `manifest.json` directly from the R2 public bucket URL. This happens because R2 public access doesn't include CORS headers. The book pages themselves load fine because they go through the Worker proxy. This error comes from a direct R2 fetch (likely in the `useBookPageUrls` hook). This is a pre-existing issue and not blocking -- the pages load correctly via the proxy.

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/api.ts` | Fix `anchor.complete()` to send `anchorId` instead of `date` |
| `src/components/anchor/DailyAnchorView.tsx` | Pass `anchor.id` instead of `anchor.date` to `complete()` |
| `cloudflare/src/routes/reading_progress.ts` | Add table creation guard for `content_progress` table |

## Expected Result

- "Complete Today's Anchor" button works and marks the day complete
- Book progress saves without 500 errors
- Reading completion logs correctly when series data is present
