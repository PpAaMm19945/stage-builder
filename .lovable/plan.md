
# Fix Completion, Regeneration, and Add Thinking Indicator

## Issue 1: Completion returns 405 (Method Not Allowed)

**Root Cause**: In `DailyAnchorView.tsx` (line 37), the completion call uses a relative URL:
```typescript
fetch('/api/anchor/complete', { method: 'POST', ... })
```
This sends the POST to the Pages domain (e.g., `stage-builder-9hh.pages.dev/api/anchor/complete`), not to the Worker (`stage-builder.antmwes104-1.workers.dev/api/anchor/complete`). Pages doesn't have this route, so it returns 405.

Additionally, the body sends `{ date: anchor?.date }` but the backend expects `{ anchorId }`.

**Fix**: Use the `API_URL` constant and send the correct `anchorId` field:
```typescript
import { API_URL } from '@/lib/api';

const res = await fetch(`${API_URL}/api/anchor/complete`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('schoolos_token')}`,
    },
    body: JSON.stringify({ anchorId: anchor.id }),
});
```

Alternatively, add a `complete` method to the `anchor` API object in `src/lib/api.ts` for consistency, then call it from `DailyAnchorView`.

**Files**: `src/lib/api.ts` (add `complete` method), `src/components/anchor/DailyAnchorView.tsx` (use it)

---

## Issue 2: Regeneration creates empty card in chat, anchor view unchanged

**Root Cause**: When the user asks for an adjustment in chat, Cortex sends back an `event: anchor` SSE with new anchor JSON. The chat stream handler (`useChatStream.ts` line 88) attaches it to the message as `anchorPayload`, which renders a new `AnchorBriefingMessage` in the chat. However:
- The main `DailyAnchorView` uses `useAnchor()` (React Query with key `['daily-anchor']`), and this query is never invalidated after the chat-based regeneration.
- The `localStorage` anchor cache (`anchor_fetch_{userId}`) blocks re-fetch.

**Fix**: After a chat-based regeneration (anchor SSE received), invalidate the `daily-anchor` query so the main view refreshes:

In `ChatPanel.tsx`, when anchor payload is received via `handleMessageUpdate`, check if the message has an `anchorPayload` and invalidate:
```typescript
const handleMessageUpdate = useCallback((message: Message) => {
    setMessages(prev => { ... });
    
    // If this message contains a new anchor, refresh the main anchor view
    if (message.anchorPayload) {
        queryClient.invalidateQueries({ queryKey: ['daily-anchor'] });
        // Clear localStorage cache so useAnchor re-fetches
        if (userId) {
            localStorage.removeItem(`anchor_fetch_${userId}`);
        }
    }
}, [userId, queryClient]);
```

**Files**: `src/components/chat/ChatPanel.tsx`

---

## Issue 3: No "thinking" indicator with timer

**Root Cause**: The `ThinkingMessage` component exists and has a working `seconds.milliseconds` timer, but it's commented out in `ChatPanel.tsx` (lines 451-457).

**Fix**: Uncomment the `ThinkingMessage` and import it:

```tsx
{chatState.mode === 'THINKING' && chatState.thinkingText && (
    <ThinkingMessage
        text={chatState.thinkingText}
        steps={chatState.streamingSteps}
    />
)}
```

Also add `ThinkingMessage` to the imports from `./messages`.

**Files**: `src/components/chat/ChatPanel.tsx`

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/api.ts` | Add `complete(anchorId, feedback?)` method to `anchor` object |
| `src/components/anchor/DailyAnchorView.tsx` | Use `anchor.complete()` instead of raw `fetch` with wrong URL |
| `src/components/chat/ChatPanel.tsx` | Invalidate `daily-anchor` query when anchor SSE arrives; uncomment ThinkingMessage |
