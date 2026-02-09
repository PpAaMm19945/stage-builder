
# Fix the Recurring "Lion" Search and Other Chat Issues

## Root Cause

The "lion" book search is a real row stored in the `ai_logs` database table. Every day when a new chat session starts (no local session yet), `ChatPanel.tsx` falls back to `ai.getInteractionLog()`, which fetches the last 50 entries from `ai_logs` -- including that old lion search. Since the query has no date filter, it keeps resurfacing forever.

## Changes

### 1. Add a date filter to the interaction log query

**File:** `cloudflare/src/routes/ai.ts` (line 128-130)

Change the query from:
```sql
SELECT * FROM ai_logs WHERE parent_id = ? ORDER BY created_at DESC LIMIT 50
```
To:
```sql
SELECT * FROM ai_logs WHERE parent_id = ? AND created_at >= date('now', '-1 day') ORDER BY created_at DESC LIMIT 20
```

This ensures only the last 24 hours of logs are returned as chat history. Old interactions like the lion search will no longer appear.

### 2. Clean up stale ai_logs data

**New migration file:** `cloudflare/migrations/v2_0065_cleanup_stale_logs.sql`

```sql
DELETE FROM ai_logs WHERE created_at < date('now', '-7 days');
```

This one-time cleanup removes old log entries. Going forward, the date filter in the query prevents them from appearing.

### 3. Time-aware greeting

**File:** `src/components/chat/ChatPanel.tsx` (around line 367)

Replace static "Good morning!" with a helper that checks the hour:
- Before 12pm: "Good morning!"
- 12pm to 5pm: "Good afternoon!"  
- After 5pm: "Good evening!"

### 4. Stop token-burning reload loop

**File:** `src/components/chat/ChatPanel.tsx` (around lines 131-147)

Add a guard so that if the anchor fetch fails, it records the failure in localStorage with today's date (e.g., `today_failed`) and does not retry on subsequent reloads. Add a small "Retry" button in the UI so you can manually trigger it when ready, instead of burning tokens on every page load.

```
Before call:  localStorage.setItem(key, today + '_pending')
On success:   localStorage.setItem(key, today)  
On failure:   localStorage.setItem(key, today + '_failed')
Guard check:  skip if value starts with today
```

Show a gentle fallback message: "Could not load today's plan. Tap to retry." with a button.

## What stays the same

- The `ai.getInteractionLog()` fallback logic in ChatPanel stays -- it is needed for chat persistence across reloads
- The local session storage (IndexedDB) remains the primary source
- No changes to the anchor generation pipeline

## Files touched

1. `cloudflare/src/routes/ai.ts` -- date filter on interaction query
2. `cloudflare/migrations/v2_0065_cleanup_stale_logs.sql` -- one-time cleanup
3. `src/components/chat/ChatPanel.tsx` -- time greeting + retry guard
