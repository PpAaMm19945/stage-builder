

# Fix: Chat Adjustment Detection, Anchor Context, Loading UX, and AI Studio Docs

## What's Wrong Today

1. **Chat misses adjustment requests.** The frontend (`ChatPanel.tsx` line 247) only catches messages containing the exact words "adjust" or "regenerate." A parent saying "Can we do something indoors instead?" or "This is too hard" is never caught. It falls through to regular streaming chat, which cannot call the anchor generator.

2. **Cortex's own ADJUST regex also has gaps.** It includes "can we|instead|different" but misses common phrases like "too hard," "too easy," "indoor," "simpler," "shorter." And even when it DOES fire, it conflicts with the FEEDBACK regex (which catches "too hard" and "too easy" first, treating them as completion feedback instead of adjustment requests).

3. **Anchor generator is blind during adjustments.** When Cortex calls `generateAnchor` with adjustments, the prompt only says `Parent Adjustment Request: {text}`. It does NOT include the current anchor being modified, the children's names/ages/stages, available books, hymns, or catechism data. So the AI invents non-existent books and hymns.

4. **No loading timer.** `ThinkingMessage` shows a spinner but no elapsed time.

5. **AI Studio doc is stale.** The system prompts in `docs/AI_STUDIO_SETUP.md` don't reflect the current code (e.g., missing the constrained books/hymns/catechism lists, adjustment context, widened intent patterns).

---

## The Fix (5 Parts)

### Part A: Remove the frontend shortcut, route everything through Cortex

**File: `src/components/chat/ChatPanel.tsx`**

Delete lines 246-267 (the `isRegen` block). All user messages go to `sendMessage` which streams through Cortex. This eliminates the dual-path problem entirely.

### Part B: Widen and reorder intent detection in Cortex

**File: `cloudflare/src/ai/cortex.ts`**

1. Expand the `ADJUST` regex:
```
/\[ADJUST\]|adjust|can we do|instead|different|change|modify|something else|too hard|too easy|indoor|outdoor|shorter|longer|simpler|swap|replace|switch/i
```

2. Move ADJUST detection BEFORE FEEDBACK detection (currently FEEDBACK catches "too hard" / "too easy" first and misroutes them as completion feedback).

3. In `handleIntent` for `adjust` and `regenerate`, emit a structured SSE event so the frontend can render the result as an anchor card:
```
event: anchor
data: {full anchor JSON}

data: {"content": "I've adjusted today's plan: ..."}

data: [DONE]
```

### Part C: Add `event: anchor` handler in the stream parser

**File: `src/components/chat/hooks/useChatStream.ts`**

In the event type detection block (line 65-76), add:
```typescript
else if (eventType === 'anchor') currentEventType = 'anchor';
```

And in the data handler, before the standard text handler:
```typescript
if (currentEventType === 'anchor') {
    try {
        const anchorData = JSON.parse(data);
        aiMessage.anchorPayload = anchorData;
        onMessageUpdate({ ...aiMessage });
    } catch (e) { console.warn('Anchor parse error', e); }
    continue;
}
```

### Part D: Feed real data into the anchor generator prompt

**File: `cloudflare/src/ai/anchor-generator.ts`**

Update the `generateWithAI` method (around line 280-336) to inject:

1. **Children data** -- query `children` table for the household
2. **Current anchor** -- if adjusting, include the full current anchor JSON as "CURRENT PLAN (modify this)"
3. **Available books** -- from `BOOKS_DATA`, filtered for published (same filter as arc-generator)
4. **Available hymns** -- the 5 hardcoded hymns (same list as arc-generator line 323-329)
5. **Catechism range** -- from `CATECHISM_DATA`

Add to the system prompt:
```
CHILDREN IN THIS FAMILY:
- Samuel Nakamya, 56 months, stage: sapling
- Esther Nakamya, 27 months, stage: sprout
- Baby Joel Nakamya, 5 months, stage: seedling

AVAILABLE BOOKS (you MUST choose from this list):
- "Athanasius" (id: athanasius)
- "Augustine" (id: augustine)
...

AVAILABLE HYMNS (you MUST choose from this list):
- A Mighty Fortress (id: hymn_mighty_fortress)
- Amazing Grace (id: hymn_amazing_grace)
- Great Is Thy Faithfulness (id: hymn_great_is_thy)
- How Great Thou Art (id: hymn_how_great)
- Holy, Holy, Holy (id: hymn_holy_holy)

CATECHISM QUESTIONS (use from this range):
Q1: "Who made you?" / A: "God."
Q2: "What else did God make?" / A: "God made all things."
...
```

If adjusting, add:
```
CURRENT PLAN (the parent wants to change this):
{current anchor JSON}

Parent's request: "Can we do something indoors instead?"
```

### Part E: Add elapsed timer to ThinkingMessage

**File: `src/components/chat/messages/ThinkingMessage.tsx`**

Add a `useState` + `useEffect` with `setInterval(100ms)` that displays elapsed time as `0.0s`, `1.2s`, `14.7s` next to the spinner text.

### Part F: Update AI Studio Setup document

**File: `docs/AI_STUDIO_SETUP.md`**

Rewrite all 4 sections to reflect the actual current prompts:

**Section 1 -- Cortex (Parent Companion):**
- Update system prompt to match `buildAnchorSystemPrompt` exactly
- Add test chats that exercise the widened ADJUST detection (e.g., "This is too hard, can we do something simpler indoors?")
- Add a test for COMPLETE, SKIP, and a plain question

**Section 2 -- Anchor Generator:**
- Update system prompt to include the constrained books list, hymns list, catechism range, and children data
- Add a test user prompt that includes `CURRENT PLAN (modify this)` for adjustment testing
- Add a second test user prompt for fresh generation (no adjustment)

**Section 3 -- Formation Arc Generator:**
- Update to include the human-readable `PROGRESS SUMMARY` that was added in the earlier fix
- Verify the user prompt includes the correct available resources format

**Section 4 -- Spine Generator:**
- No changes needed (already accurate)

---

## File Change Summary

| File | Change |
|------|--------|
| `src/components/chat/ChatPanel.tsx` | Remove `isRegen` shortcut block (lines 246-267) |
| `cloudflare/src/ai/cortex.ts` | Widen ADJUST regex, reorder before FEEDBACK, emit `event: anchor` SSE |
| `src/components/chat/hooks/useChatStream.ts` | Add `anchor` event type handler |
| `cloudflare/src/ai/anchor-generator.ts` | Inject children, books, hymns, catechism, current anchor into AI prompt |
| `src/components/chat/messages/ThinkingMessage.tsx` | Add elapsed seconds.milliseconds timer |
| `docs/AI_STUDIO_SETUP.md` | Rewrite all system prompts to match current code |

