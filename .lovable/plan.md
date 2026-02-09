
# Fix Chat Messages, Remove Icons, and Show Anchor Summary

## Issues Found

### 1. Chat messages appear empty (Critical)
The backend (Cortex/Gemini) sends streamed data as `{"content":"Hi there! "}`, but the frontend parser in `useChatStream.ts` only extracts text from `parsed.response`. Since `parsed.content` is never checked, the text is silently discarded and messages render as empty bubbles.

### 2. Robot icon looks "scary"
The chat header, assistant messages, user messages, and empty state all use the Phosphor `Robot` icon. The user wants a cleaner look with no icons, similar to Lovable's chat interface.

### 3. Anchor summary not appearing
The anchor fetch calls `/api/anchor/today`, which was previously failing with a D1 error (now fixed). Additionally, the `localStorage` guard (`anchor_fetch_{userId}`) may have cached a failed state from earlier attempts, preventing re-fetch. The anchor summary should now work once the cache is cleared on error.

---

## Changes

### File 1: `src/components/chat/hooks/useChatStream.ts`
**Fix the JSON content extraction to also check for `content` field**

In the standard text parsing block (~line 192), change:
```typescript
if (parsed.response && typeof parsed.response === 'string') {
    textToAdd = parsed.response;
}
```
To:
```typescript
if (parsed.response && typeof parsed.response === 'string') {
    textToAdd = parsed.response;
} else if (parsed.content && typeof parsed.content === 'string') {
    textToAdd = parsed.content;
}
```

Apply the same fix to the `extractResponse` helper (~line 178):
```typescript
const extractResponse = (jsonStr: string): string => {
    try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.response && typeof parsed.response === 'string') return parsed.response;
        if (parsed.content && typeof parsed.content === 'string') return parsed.content;
    } catch { /* ignore */ }
    return '';
};
```

### File 2: `src/components/chat/ChatPanel.tsx`
**Remove all Robot/User icons and simplify the layout**

- Remove the `Robot` and `User` imports from `@phosphor-icons/react`
- Remove the Robot icon from the header title (just show "Your Guide" text)
- Remove the 8x8 avatar circles next to assistant and user messages
- Remove the Robot icon from the empty-state welcome section
- Remove the `pl-11` left padding on anchor/action cards (no longer needed without avatar column)
- Keep the clean bubble layout for messages

### File 3: `src/components/coach/FrontdeskChat.tsx`
**Same icon removal for the legacy Frontdesk chat**

- Remove the `Robot` and `User` icons from message avatars and header
- Update header to just show "Your Guide" without the Robot icon

### File 4: `src/components/chat/ChatPanel.tsx` (Anchor cache fix)
**Clear failed anchor cache so it retries**

In the anchor fetch error handler (~line 148), change:
```typescript
localStorage.setItem(anchorKey, today + '_failed');
```
To:
```typescript
localStorage.removeItem(anchorKey);
```

This ensures a failed anchor fetch doesn't permanently block retries for the rest of the day.

---

## Expected Result

- Chat messages will display the streamed text content correctly
- No icons/avatars next to messages or in the header -- clean, minimal look
- Anchor summary will appear once the API responds successfully (the D1 error was fixed previously)
