# Codebase Audit: The Three AI Engines
**Date:** 2026-02-06  
**Purpose:** Map the problem, evaluate the approach, and propose the correct path forward.

---

## 1. The Problem We're Solving

**One sentence:** Help Christian parents run meaningful daily formation (faith, character, habits, pre-academic readiness) for children aged 0–6, using AI to plan, personalize, and adapt — so parents want to come back every day.

**What "come back every day" requires:**
- One clear thing to do today (the Daily Anchor)
- Confidence that it's the *right* thing (AI transparency)
- Ability to adjust without friction (chat)
- Visible progress over weeks (not just days)

---

## 2. Current Architecture: Three Disconnected AI Engines

### Engine Map

```
ENGINE 1: ArcGenerator                ENGINE 2: AnchorGenerator           ENGINE 3: Cortex (Chatbot)
─────────────────────────             ──────────────────────────          ──────────────────────────
File: arc-generator.ts                File: anchor-generator.ts           Files: cortex.ts, router.ts,
                                                                          frontdesk.ts, triage.ts
Model: gemini-3-flash-preview         Model: gemini-3-flash-preview       Models: llama-3-8b + gemini-2.0-flash
                                                                          
Purpose: Generate a 2-week            Purpose: Generate one day's         Purpose: Chat with parent
"Formation Arc" plan                   anchor from the arc                 about... everything?

Trigger: When no active arc           Trigger: GET /api/anchor/today      Trigger: User sends message
exists (lazy)                         (lazy, cached daily)                in chat panel

Output: arc_data JSON stored          Output: anchor_data JSON            Output: Streamed text +
in formation_arcs table               in daily_anchors table              action cards

Talks to Engine 2? NO                 Talks to Engine 1? YES              Talks to Engine 1/2? NO
(Engine 2 calls Engine 1)             (Fetches/generates arc first)       (Completely separate)
```

### The Fundamental Disconnects

| Problem | Where | Impact |
|---------|-------|--------|
| **Chatbot has no knowledge of today's anchor** | `cortex.ts` system prompt (line 476-553) | Bot talks about "daily rhythm", "schedule", "FamilyPath" — all legacy concepts. It cannot discuss the anchor because it never receives it. |
| **Chatbot uses wrong models** | `cortex.ts` line 647, `router.ts` line 67 | Router uses `llama-3-8b-instruct` (Cloudflare Workers AI). Chat uses `gemini-2.0-flash-exp`. Neither uses `gemini-3-flash-preview`. |
| **Chatbot has wrong identity** | `frontdesk.ts` line 31, `cortex.ts` line 508 | Still calls itself "FamilyPath Frontdesk Officer" and describes capabilities that don't exist (schedule changes, basket toggles). |
| **Two chat backends exist** | `frontdesk.ts` AND `cortex.ts` | `FrontdeskOfficer` class imports `RhythmGenerator` (legacy). `Cortex` class has its own chat. Both handle `/api/chat`. Unclear which is active. |
| **ArcGenerator is untestable** | `arc-generator.ts` line 139 | Missing closing brace — `generateArc()` has a `try {` with no `catch/finally`. The method `getActiveArc` is defined inside the unclosed try block. This is a **syntax-level bug** that may work in some JS engines but is fragile. |
| **Cortex.generateFamilyAnchor is dead code** | `cortex.ts` line 738-903 | This was the original anchor generator (random ingredients). `AnchorGenerator` class replaced it. But this 170-line method still exists, using `gemini-2.0-flash-exp` and random selection. |
| **Router handles legacy intents** | `router.ts` | Routes like `ADJUST_SCHEDULE`, `TOGGLE_BASKET_ITEM`, `REGENERATE_PLAN` reference systems that no longer exist in the UI. |
| **Progress tracking is disconnected** | `anchor.ts` `/complete` endpoint | Marks anchor as 'completed' in DB but nothing reads this status. No weekly/monthly view. Arc doesn't advance based on completions. |

---

## 3. Is This the Right Approach?

### What's RIGHT about the current approach:
1. **Arc → Anchor hierarchy** is correct. A 2-week plan decomposed into daily anchors is the right granularity.
2. **Lazy generation** (generate on first visit, cache for day) is correct. No wasted tokens.
3. **Gemini for generation, structured JSON output** is correct.
4. **The AnchorCard UI** is beautiful and well-built. It renders liturgy, activity, and book sections cleanly.

### What's WRONG:
1. **Three engines is two too many for the chatbot.** The chatbot should NOT be a general-purpose assistant. It should be the **voice of the Anchor** — explaining today's plan, accepting adjustments, and recording feedback.
2. **The router/triage/frontdesk pipeline is over-engineered for what we need.** Four files (triage.ts, router.ts, frontdesk.ts, cortex.ts) with two different LLM providers just to handle chat. For a hackathon, this should be ONE file with ONE model.
3. **No curriculum spine.** The arc generator asks Gemini to *invent* a curriculum. It should *follow* one.
4. **No feedback loop.** Completing an anchor doesn't influence the next day or the arc.

---

## 4. Proposed Architecture: "One Engine, One Voice"

### The Insight

The chatbot shouldn't be a separate engine. **The chatbot IS the anchor's interface.** 

Instead of three engines, we need:

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE AI PIPELINE                        │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Curriculum│───▶│ Daily Anchor │───▶│ Anchor Companion │  │
│  │ (Data)    │    │ (Generator)  │    │ (Chat)           │  │
│  └──────────┘    └──────────────┘    └──────────────────┘  │
│                                                             │
│  Static/Manual     Gemini 3 Flash      Gemini 3 Flash      │
│  312-week plan     Runs once/day       Same model, same    │
│  in database       on first visit      context as anchor   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Changes

#### A. Kill the Router/Triage Pipeline
- Delete: `triage.ts`, `router.ts`, `frontdesk.ts`  
- Remove: All legacy intents (`ADJUST_SCHEDULE`, `TOGGLE_BASKET_ITEM`, `REGENERATE_PLAN`, `GET_TODAY_SCHEDULE`)
- Keep: `cortex.ts` but **rewrite the chat method** to be anchor-aware

#### B. Chatbot = Anchor Companion
The chatbot gets today's anchor injected into its system prompt. It can:
1. **Explain** — "Why this catechism question today?"
2. **Adjust** — "Use a different book" → calls regenerate with adjustment
3. **Record** — "We finished!" or "James loved the pouring activity" → saves evidence
4. **Encourage** — "Is this age-appropriate for a 10-month-old?" → answers from anchor context

**That's it.** No book search, no schedule changes, no general chat about parenting philosophy. The bot serves the anchor.

#### C. Anchor Companion System Prompt (replaces buildSystemPrompt)

```typescript
const systemPrompt = `You are the Anchor Companion for HomeLine Academy.

TODAY'S ANCHOR:
${JSON.stringify(todayAnchor, null, 2)}

FAMILY:
${childrenList}

YOUR ROLE:
- Explain why today's anchor was chosen (theme, connections)
- Help parents adjust: if they want a different book/activity, say 
  "I'll regenerate with that adjustment" and output: [REGENERATE:reason]
- Record completion: if parent says they finished, output: [COMPLETE]
- Record feedback: if parent shares observations, output: [FEEDBACK:text]
- Answer questions about the catechism, hymn, or activity
- Be warm, brief, encouraging. You are a fellow parent, not a teacher.

YOU CANNOT:
- Discuss topics unrelated to today's anchor and formation
- Make up activities or books not in the anchor
- Access any other system (schedules, preferences, baskets)

FORMATION PHILOSOPHY:
"Formation before knowledge. Character before competence. 
Fear of God is the beginning of wisdom." (Deut 6:4-9)
`;
```

#### D. One Model Everywhere
- `gemini-3-flash-preview` for arc generation, anchor generation, AND chat
- Remove all references to `llama-3-8b-instruct` and `gemini-2.0-flash-exp`
- Remove Cloudflare Workers AI dependency (`this.env.AI.run`)

#### E. Curriculum Spine (Data, Not AI)
The 312-week curriculum is a **data table**, not an AI generation. The AI's job is to find the theological thread connecting this week's prescribed items, not to choose what to teach.

```sql
CREATE TABLE curriculum_spine (
    id TEXT PRIMARY KEY,
    week_number INTEGER NOT NULL,     -- 1-312
    track TEXT NOT NULL,              -- 'faith', 'character', 'readiness'
    content_type TEXT NOT NULL,       -- 'catechism', 'book', 'skill', 'hymn'
    content_reference TEXT NOT NULL,  -- ID or title referencing library
    virtue_focus TEXT,                -- 'patience', 'obedience', etc.
    notes TEXT                        -- Teaching notes
);
```

This can be seeded by AI once (admin action), then manually curated. The daily anchor generator reads from this table instead of picking randomly.

---

## 5. Files to Delete, Keep, and Create

### DELETE (Legacy/Dead Code)
| File | Reason |
|------|--------|
| `cloudflare/src/ai/frontdesk.ts` | Legacy chat handler, imports RhythmGenerator |
| `cloudflare/src/ai/router.ts` | Over-engineered intent router for legacy features |
| `cloudflare/src/ai/triage.ts` | Unnecessary safety filter for a family app |
| `cloudflare/src/ai/_legacy_rhythm-generator.ts` | Fully deprecated |
| `cloudflare/src/ai/planner.ts` | Legacy weekly planner |
| `cortex.ts:generateFamilyAnchor()` (lines 738-903) | Dead code, replaced by AnchorGenerator |

### REWRITE
| File | Change |
|------|--------|
| `cloudflare/src/ai/cortex.ts` | Strip to ~200 lines. One method: `anchorChat()`. Remove all legacy intents, router calls, model selection logic. |
| `cloudflare/src/ai/gemini.ts` | Change default model to `gemini-3-flash-preview` (line 33) |
| `cloudflare/src/ai/arc-generator.ts` | Fix missing catch block (line 139). Add curriculum_spine lookup instead of random selection. |
| `src/components/chat/ChatPanel.tsx` | Remove book search, schedule, basket toggle UI. Focus on anchor discussion. |
| `cloudflare/src/routes/ai.ts` | Simplify. Pass today's anchor data into chat context. |

### CREATE
| File | Purpose |
|------|--------|
| `cloudflare/migrations/v2_0052_curriculum_spine.sql` | Curriculum data table |
| `src/pages/admin/CurriculumMonitor.tsx` | Admin view of curriculum + family progress |

### KEEP AS-IS
| File | Reason |
|------|--------|
| `cloudflare/src/ai/anchor-generator.ts` | Working correctly. Good caching logic. |
| `cloudflare/src/routes/anchor.ts` | Clean endpoints, working caching. |
| `src/components/anchor/AnchorCard.tsx` | Beautiful UI, well-structured. |
| `src/components/anchor/DailyAnchorView.tsx` | Clean, handles loading/error/complete. |

---

## 6. Hackathon Priority Order

### Phase 1: Make It Work (2 hours)
1. Fix `gemini.ts` default model → `gemini-3-flash-preview`
2. Fix `arc-generator.ts` syntax bug (missing catch block)
3. Rewrite `cortex.ts` chat to be anchor-aware (inject today's anchor into system prompt)
4. Remove legacy system prompt references ("FamilyPath", "daily rhythm", "schedule")
5. Update `ChatPanel.tsx` welcome message and bot identity

### Phase 2: Make It Smart (2 hours)  
6. Create `curriculum_spine` table and seed with initial data
7. Update `AnchorGenerator` to read from curriculum instead of arc's random generation
8. Add `[REGENERATE:reason]` parsing in chat → calls anchor regenerate endpoint
9. Add `[COMPLETE]` parsing in chat → calls anchor complete endpoint

### Phase 3: Make It Shine (1 hour)
10. Add generation metadata display in chat (what AI chose and why)
11. Admin curriculum monitor page
12. Demo data + recording

---

## 7. Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Gemini 3 Flash behaves differently than 2.0 | Medium | Test prompts early. Have fallback prompts. |
| Curriculum spine takes too long to seed | High | Start with 4 weeks (enough for demo). AI can generate the rest later. |
| Chat rewrite breaks streaming | Medium | Keep the SSE format identical. Only change system prompt and remove unused code paths. |
| Arc generator syntax bug causes runtime crash | High | Fix immediately — it's a missing catch block. |

---

## 8. Final Verdict

**The approach (Arc → Anchor → Chat) is correct.** The problem is execution: three disconnected engines when there should be one pipeline. The chatbot should not be a general-purpose assistant — it should be the anchor's voice.

**Score: 5.5/10** (down from 6.5 due to discovered syntax bug and deeper legacy entanglement)

**Path to 9/10:**
1. One model (`gemini-3-flash-preview`) everywhere
2. One identity (Anchor Companion, not Frontdesk Officer)  
3. One context (today's anchor injected into every chat message)
4. One curriculum (data table, not random selection)
5. One feedback loop (completion → progress → next anchor)

---

## 9. Additional Analysis: Arc Generator (My Assessment)

### A. What the Arc Generator Is *Actually* Doing Today

The current `ArcGenerator` is a **one-shot curriculum inventor**, not a curriculum executor. It asks Gemini to assemble a brand‑new 2‑week plan from raw ingredients (books, skills, catechism) without any deterministic spine or progression logic. This means:

- Each arc is a fresh, unbounded invention.
- There is no consistent sequence of literacy, character, or habit formation.
- You cannot audit whether a child’s progression is coherent over months.

### B. Core Issues (Why This Breaks Real Learning)

| Issue | Evidence | Impact |
|------|----------|--------|
| **No curriculum spine** | System prompt asks Gemini to "Create a 2‑week Formation Arc" from scratch | The arc is *creative*, not *instructional*. Literacy and habit progression becomes random. |
| **No learning state** | Only `catechism_position` persists across arcs | The system does not know what the child has mastered or practiced. |
| **No closure or progression** | Arcs expire after 14 days with no completion logic | Progress is invisible and doesn’t influence the next arc. |
| **No age‑specific mastery model** | Stages are labels only | Stages don’t map to concrete milestones (e.g., phonological awareness → letter‑sound mapping). |
| **Arc is isolated** | Arc feeds Anchor; Anchor completion doesn't flow back | The core feedback loop is missing, so the system can’t adapt. |

### C. The Fundamental Design Choice (This Must Be Decided)

**Is the Arc Generator supposed to create the curriculum, or execute it?**

Right now it creates it. For reliable early‑years education (0–6), it **must execute a deterministic spine** and only adapt the *delivery* to the family.

**In other words:**
- Curriculum = data (fixed, auditable, sequential)
- AI = personalization (pacing, adaptation, engagement, tone)

### D. What a *Correct* Arc Generator Should Do

The Arc Generator should function like a **sequencer and adapter**, not a writer. It should:

1. **Read from a curriculum spine**
   - A structured plan for weeks 1–312 (or a smaller demo scope)
   - Each week specifies required goals, books, catechism, and skill targets

2. **Map targets to each child**
   - Same spine, different adaptations per age stage
   - E.g., a 4‑year‑old and a 1‑year‑old can share a theme, but with different activities

3. **Use progress evidence**
   - If phoneme blending is “emerging,” repeat or scaffold
   - If a skill is “mastered,” move forward within the spine

4. **Write a coherent explanation**
   - Why this week, why this sequence, why these adaptations

### E. Proposed Architecture Fix (Minimal, Demo‑Ready)

**Option A: Curator Model (Recommended for Demo)**

| Component | Responsibility |
|----------|----------------|
| `curriculum_spine` table | Defines the sequence (week → goals → resources) |
| `ArcGenerator` | Selects week slice + adapts per family |
| `AnchorGenerator` | Decomposes week arc into daily anchors |
| `Anchor completion` | Writes progress evidence |
| `Next arc` | Reads progress evidence + spine |

**Option B: Generative Model (Not Recommended Yet)**

- Keep AI inventing the curriculum, but add deep tracking and reinforcement logic.
- This is **research‑grade complexity**, not a hackathon‑grade deliverable.

### F. Concrete Action Plan (Arc Generator Only)

1. **Fix the syntax bug** (missing catch/finally)  
2. **Create a minimal spine** (4–8 weeks) for early‑years literacy and formation  
3. **Change arc generation** to *select* from that spine rather than invent it  
4. **Add progress tracking** to anchors and feed it into the next arc  
5. **Log reasoning** to make arcs auditable by parents  

### G. Example: Early Literacy Spine (Minimal Demo)

| Week | Focus | Sample Targets |
|------|-------|----------------|
| 1 | Phonological Awareness | Rhyming, syllable clapping |
| 2 | Print Concepts | Left‑to‑right tracking, book handling |
| 3 | Letter Recognition | Letters in name, letter shapes |
| 4 | Letter‑Sound | “M is /m/” with multisensory play |

The Arc Generator should *pick week 1–2* and adapt those targets across children. It should **not** invent new targets ad hoc.

---

## 10. Final Opinion on the Arc Generator

The Arc Generator **must become deterministic** or the system will never deliver consistent literacy outcomes. AI is excellent at personalization, not curriculum sequencing. The right framing is:

> **“AI is the tutor, not the textbook.”**

Once that decision is made, the architecture becomes clear: spine → arc → anchor → feedback → next arc.
