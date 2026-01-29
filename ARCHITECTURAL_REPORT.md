# Architectural Report: SchoolOS "Early Years" MVP

> **AUDIT STATUS**: Verified by code review on 2026-01-29
> Each section is marked: ✅ Confirmed | ⚠️ Partially Correct | ❌ Incorrect

---

## 1. Executive Summary

> ⚠️ **Partially Correct** — The diagnosis is accurate, but overstates the degree of disconnection.

The current architecture exhibits a "Split Personality." You have a **Legacy AI Pipeline** (`RhythmGenerator`) that attempts to plan everything "blindly" using a hardcoded prompt and stale data, and a **New Learning Engine** (`LearningPaths`) that is deterministic and robust but currently disconnected from the AI.

**Verification Notes:**
- ✅ `RhythmGenerator` exists at `cloudflare/src/ai/rhythm-generator.ts`
- ✅ `LearningPaths` engine exists at `cloudflare/src/routes/paths.ts` with full CRUD + `/api/paths/today` endpoint
- ⚠️ They are NOT completely disconnected — `RhythmGenerator.loadFamilyContext()` **does read** `family_profiles.catechism_position` and `hymn_position` (lines 99-101), and the `/api/paths/today` endpoint correctly fetches the next item based on `current_position`

To achieve your goal of "AI Maximization" and a sound MVP, the system must shift from **AI-Generated Content** to **AI-Orchestrated Structure**. The AI should decide *when* to do things based on family energy/schedule, but the `LearningPaths` engine should decide *what* specific book or hymn comes next based on progress.

---

## 2. Pipeline Assessment ("To what degree does it work?")

> ⚠️ **Partially Correct** — The feedback loop IS broken, but in a specific way.

**Current State: 4/10 (Broken Feedback Loop)**

The pipeline is currently linear and broken:
1.  **Planning**: AI generates a plan based on `family_profiles.catechism_position`. ✅ Confirmed
2.  **Execution**: User completes an item. API records it in `liturgy_completions`. ✅ Confirmed
3.  **Broken Link**: The `family_profiles` table is **never updated**. ⚠️ TRUE, but irrelevant
4.  **Result**: The AI will endlessly suggest the same Hymn and Catechism Question because it looks at the stale profile data, not the live completion tables. ❌ **Incorrect for LearningPaths**

**Corrected Analysis:**

There are **TWO separate systems** with different feedback loops:

| System | Progress Storage | Feedback Status |
|--------|-----------------|-----------------|
| **LearningPaths** (`/api/paths/advance`) | `family_path_subscriptions.current_position` | ✅ **WORKS** — `/api/paths/:id/advance` correctly increments position |
| **RhythmGenerator** (AI Planner) | `family_profiles.catechism_position` | ❌ **BROKEN** — Never updated by any completion endpoint |

**The REAL Bug:**
- `POST /api/liturgy/complete` (line 201 of `curriculum.ts`) inserts into `liturgy_completions` but **does NOT** call `/api/paths/:pathId/advance`
- `POST /api/reading/complete` (line 579 of `library.ts`) inserts into `reading_sessions` but **does NOT** advance any path

**Impact:**
- If a family uses the **LearningPaths UI** (which calls `/api/paths/:pathId/advance` on completion), progress works correctly.
- If a family uses the **standalone liturgy/reading completion** buttons, the feedback loop is broken.

**The "Blind" AI:**

> ✅ **Confirmed**

The AI is generating plans without knowing what books you actually own. It suggests "read a book" but cannot suggest "Read 'The Blue Boat'" because it has no access to your R2 library inventory.

**Verification:**
- `rhythm-generator.ts` line 213-214: `content_id: "placeholder"` — AI outputs generic items, not real content IDs
- The `formations` table IS seeded (via `v2_0010_seed_early_years_activities.sql` with 100+ items), but `RhythmGenerator` does not query it

---

## 3. AI Maximization & Decision Determinants

> ✅ **Correct Analysis**

**Current Determinants:**
- **Static Inputs**: Hardcoded prompt list (Westminster Catechism, etc.). ✅
- **Stale Context**: User's initial profile settings. ✅
- **Randomness**: LLM hallucination for "activities" (e.g., "Draw a picture"). ✅

**Ideal Determinants (The "Maximization" Strategy):**
To maximize AI utility, it should function as a **Strategic Advisor (System 2)**, not a Content Fetcher.
1.  **User Constraints**: "We have 15 mins this morning" (Time-Model). ✅ Already in context
2.  **Child State**: "Child is energetic/tired" (Observation history). ⚠️ Not implemented
3.  **Inventory**: "What is the next unread book in our library?" (Learning Path). ✅ Available via `/api/paths/today`

**Recommendation:**
Stop asking the AI to "generate a weekly plan with activities." Instead, ask the AI to **"Slot the next items from the active Learning Paths into this week's available time blocks."**

**Implementation Path:**
```
1. Call GET /api/paths/today → Get concrete items with real IDs
2. Pass items to RhythmGenerator as "AVAILABLE_CONTENT"
3. AI schedules these items into time slots (morning/evening)
4. On completion, call POST /api/paths/:id/advance
```

---

## 4. Activities & Presentation Gaps

> ⚠️ **Partially Correct** — Some features exist

**Missing Features:**

| Feature | Status | Notes |
|---------|--------|-------|
| Visual Progress Trails ("Map" view) | ❌ Missing | Only `WeekStrip` exists (shows 7 days). No "stone 5 of 100" path visualization. |
| Book "Cover Flow" | ⚠️ Partial | `LibraryPage` exists with grid view. No "Up Next cover" on dashboard. |
| Weekly Digest | ❌ Missing | `EndOfDaySummary` is ephemeral. No email or persistent weekly report. |

**Existing UI Components:**
- ✅ `WeekStrip` — Shows current week with day selection
- ✅ `FormationCard` — Renders activities with completion actions
- ✅ `UpNextCard` — Shows next item (but doesn't show book covers prominently)
- ✅ `PathsPage` — Lists available learning paths with subscribe/unsubscribe

---

## 5. Critical Missing Pieces for MVP

> ⚠️ **Partially Correct** — Some bridges already exist

### A. The "Path Resolver" Bridge

> ⚠️ **Already Partially Implemented**

*   **Problem**: `RhythmGenerator` outputs generic "Book". ✅ Confirmed
*   **Existing Solution**: `/api/paths/today` in `paths.ts` (lines 202-291) DOES resolve content IDs from the `formations` table based on `current_position`

**What's Actually Missing:**
The `RhythmGenerator` does not call `/api/paths/today`. It generates its own content list from hardcoded prompts.

**Fix:** Modify `RhythmGenerator.generateWeeklyRhythm()` to:
1. First fetch `/api/paths/today` items
2. Pass those as `AVAILABLE_CONTENT` in the system prompt
3. AI schedules the concrete items (not hallucinated ones)

### B. The "Inventory" Bridge

> ❌ **Incorrect** — Formations table IS seeded

*   **Problem**: `library.ts` reads files from R2, but `LearningPaths` queries the `formations` database table.
*   **Actual State**: The `formations` table HAS seeded content:
    - `v2_0002_seed_formations.sql` — Initial seed
    - `v2_0010_seed_early_years_activities.sql` — 100+ activities
    - `v2_0019_seed_path_content.sql` — Path-specific content
    - `v2_0013_add_sermonaudio_hymns.sql` — Hymns with audio

**What's Actually Missing:**
- R2 books (picture books with images) are NOT in `formations` table — only activities/liturgy are seeded
- No admin UI to sync R2 → formations

**Fix:** Create a seeding script that:
1. Lists R2 bucket for `/books/*` prefixes
2. Parses each book's `metadata.json`
3. Inserts into `formations` with `formation_type = 'reading'`

### C. The "Feedback" Bridge

> ✅ **Correct** — This is the critical missing piece

*   **Problem**: Completions don't advance the plan. ✅ CONFIRMED
*   **Fix**: Update the `POST /api/liturgy/complete` and `POST /api/reading/complete` endpoints to **also** call the advance logic.

**Required Code Change (curriculum.ts line 220):**
```typescript
// After: INSERT INTO liturgy_completions...

// ADD: Advance any active path that uses this item
await advancePathForItem(c.env.DB, user.id, id);
```

**Required Code Change (library.ts line 608):**
```typescript
// After: INSERT INTO reading_sessions...

// ADD: Advance any active reading path
await advancePathForItem(c.env.DB, user.id, book.id);
```

---

## 6. Implementation Plan (Prioritized)

### Phase 1: Fix Feedback Loop (CRITICAL) — 2 hours

| Task | File | Status |
|------|------|--------|
| Create `advancePathForItem(db, userId, formationId)` helper | `cloudflare/src/lib/paths.ts` | TODO |
| Call helper from `POST /api/liturgy/complete` | `cloudflare/src/routes/curriculum.ts` | TODO |
| Call helper from `POST /api/reading/complete` | `cloudflare/src/routes/library.ts` | TODO |

### Phase 2: Connect AI to Real Content — 4 hours

| Task | File | Status |
|------|------|--------|
| Modify `RhythmGenerator` to fetch `/api/paths/today` first | `cloudflare/src/ai/rhythm-generator.ts` | TODO |
| Replace `content_id: "placeholder"` with real IDs | `cloudflare/src/ai/rhythm-generator.ts` | TODO |
| Add `AVAILABLE_CONTENT` section to system prompt | `cloudflare/src/ai/rhythm-generator.ts` | TODO |

### Phase 3: Seed R2 Books → Formations — 3 hours

| Task | File | Status |
|------|------|--------|
| Create R2 → Formations sync script | `cloudflare/scripts/seed-books.ts` | TODO |
| Run on existing R2 content | Manual | TODO |
| Add admin trigger in Settings | `src/pages/Settings.tsx` | Optional |

### Phase 4: UI Polish — 4 hours

| Task | Status |
|------|--------|
| Add "Path Progress Trail" visualization (stones 5/100) | TODO |
| Enhance `UpNextCard` with book cover image | TODO |
| Add Weekly Digest generation (view or email) | Future |

---

## 7. Architecture Diagram (Corrected)

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  Dashboard → FormationCard → Complete Button                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 COMPLETION ENDPOINTS                         │
│  POST /api/liturgy/complete   POST /api/reading/complete    │
│                      │                                       │
│          ┌───────────┴────────────┐                         │
│          ▼                        ▼                         │
│  liturgy_completions      reading_sessions                  │
│          │                        │                         │
│          └───────────┬────────────┘                         │
│                      ▼                                       │
│        ❌ MISSING: advancePathForItem()                      │
│                      │                                       │
│                      ▼                                       │
│        family_path_subscriptions.current_position            │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 GET /api/paths/today                         │
│  ✅ Correctly reads current_position                         │
│  ✅ Queries formations table for next item                   │
│  ✅ Returns concrete item with real ID                       │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 RhythmGenerator (AI)                         │
│  ❌ Does NOT call /api/paths/today                           │
│  ❌ Outputs content_id: "placeholder"                        │
│  ⚠️ Uses stale family_profiles.catechism_position            │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Summary: What Works vs What's Broken

| Component | Status | Fix Required |
|-----------|--------|--------------|
| `family_path_subscriptions` table | ✅ Works | — |
| `/api/paths/today` endpoint | ✅ Works | — |
| `/api/paths/:id/advance` endpoint | ✅ Works | — |
| `formations` table (seeded) | ✅ Works | Add R2 books |
| `POST /api/liturgy/complete` | ⚠️ Records but doesn't advance | Call `advancePathForItem` |
| `POST /api/reading/complete` | ⚠️ Records but doesn't advance | Call `advancePathForItem` |
| `RhythmGenerator` AI | ❌ Disconnected | Fetch `/api/paths/today` first |
| Path Progress Trail UI | ❌ Missing | Build visualization |
| Weekly Digest | ❌ Missing | Future phase |

---

**This architecture separates concerns: AI handles Time & Strategy, Code handles Curriculum & State. This is robust, deterministic, and scalable.**

*Report verified against codebase commit as of 2026-01-29*
