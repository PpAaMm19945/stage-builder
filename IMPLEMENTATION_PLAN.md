# Implementation Plan: Living Education OS

> **Unified Work Plan** — Merges ARCHITECTURAL_REPORT.md findings with Architecture Proposal
> **Last Updated**: 2026-01-30

---

## Executive Summary

This document unifies two architectural analyses into a single, actionable implementation plan. The goal is to transform the current "School-at-Home Slot Machine" into a **"Living Education Basket Model"** where:

1. **Planning** = Curating weekly resources (The Basket)
2. **Execution** = Family chooses when to engage
3. **Reporting** = AI silently records hidden academic outcomes (The Invisible Registrar)

---

## Part 1: Current State Assessment

### What's Already Implemented ✅

| Component | Status | Evidence |
|-----------|--------|----------|
| `learning_outcomes` column on `formations` | ✅ Done | `v2_0030_living_education_schema.sql` |
| `mess_level` column on `formations` | ✅ Done | `v2_0030_living_education_schema.sql` |
| `learning_outcomes` column on `books` | ✅ Done | `v2_0030_living_education_schema.sql` |
| `themes` column on `books` | ✅ Done | `v2_0030_living_education_schema.sql` |
| `related_activities` column on `books` | ✅ Done | `v2_0030_living_education_schema.sql` |
| Initial seed data for outcomes | ✅ Done | `v2_0031_seed_living_education_content.sql` |
| TypeScript types updated | ✅ Done | `cloudflare/src/types.ts` lines 44-47, 111-113 |
| `GET /api/paths/today` endpoint | ✅ Works | Returns real content from `formations` table |
| `POST /api/paths/:id/advance` endpoint | ✅ Works | Correctly increments `current_position` |
| `family_path_subscriptions` table | ✅ Works | Tracks family progress through paths |

### What's Broken ❌

| Component | Problem | Impact |
|-----------|---------|--------|
| `POST /api/liturgy/complete` | Records completion but doesn't call `advancePathForItem()` | Path progress stalls |
| `POST /api/reading/complete` | Records completion but doesn't call `advancePathForItem()` | Path progress stalls |
| `RhythmGenerator` | Outputs `content_id: "placeholder"` instead of real IDs | AI hallucinations |
| `RhythmGenerator` | Uses stale `family_profiles.catechism_position` | Wrong suggestions |
| R2 Books → `formations` | Books in R2 storage not indexed in database | AI can't suggest real books |

### What's Missing 🚧

| Component | Description | Priority |
|-----------|-------------|----------|
| `advancePathForItem()` helper | Bridge function to auto-advance paths on any completion | **P0 Critical** |
| AI → Paths Integration | `RhythmGenerator` must fetch `/api/paths/today` first | **P0 Critical** |
| "Weekly Basket" UI | Replace day-slot timeline with resource basket view | **P1 High** |
| "Invisible Registrar" | Aggregate `learning_outcomes` into progress reports | **P2 Medium** |
| Path Progress Trail | Visual "stone 5 of 100" journey visualization | **P2 Medium** |
| R2 → DB Sync Script | Index R2 books into `formations` table | **P1 High** |

---

## Part 2: Architecture Diagrams

### Current Flow (Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE "SLOT MACHINE" (Current)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User Profile ──► RhythmGenerator ──► Gemini AI                │
│        │                                    │                    │
│        │              Asks for Schedule     │                    │
│        │                                    ▼                    │
│        │                          Hallucinates Activities        │
│        │                          content_id: "placeholder"      │
│        │                                    │                    │
│        ▼                                    ▼                    │
│   Fixed Constraints              Weekly JSON Plan                │
│   (Morning/Evening)              Monday: 9am Math                │
│                                  Tuesday: 9am Science            │
│                                                                  │
│   ❌ AI doesn't know what books you have                        │
│   ❌ Missed Monday = whole week feels "behind"                  │
│   ❌ Looks like a failing to-do list                            │
└─────────────────────────────────────────────────────────────────┘
```

### Target Flow (Living Education)

```
┌─────────────────────────────────────────────────────────────────┐
│              THE "WEEKLY BASKET" (Phase A: Planning)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                       Book Selection                             │
│                            │                                     │
│                       The Anchor                                 │
│                            ▼                                     │
│                   ┌─────────────────┐                            │
│                   │  Weekly Basket   │                           │
│                   └────────┬────────┘                            │
│                            │                                     │
│           ┌────────────────┼────────────────┐                    │
│           ▼                ▼                ▼                    │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│   │ Book:        │ │ Habit:       │ │ Skill:       │            │
│   │ Little Red   │ │ Kindness     │ │ Baking Bread │            │
│   │ Hen          │ │              │ │              │            │
│   └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│   ✅ AI ensures mix is right (Head, Heart, Hands)               │
│   ✅ You choose WHEN to pull from basket                        │
│   ✅ No rigid time slots                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│        THE "INVISIBLE REGISTRAR" (Phase B: Reporting)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Completed Activity ──► User checks off                         │
│   "Baking Bread"              │                                  │
│                               ▼                                  │
│                    ┌──────────────────────┐                      │
│                    │ Invisible Registrar   │                     │
│                    │ Reads Hidden Metadata │                     │
│                    └──────────┬───────────┘                      │
│                               │                                  │
│                    Generates  │                                  │
│           ┌──────────────────┼──────────────────┐                │
│           ▼                  ▼                  ▼                │
│   ┌─────────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │ Outcomes:   │   │ Progress     │   │ Subject:     │         │
│   │ Chemistry,  │   │ Report       │   │ Applied      │         │
│   │ Math, Motor │   │ Start: Jan29 │   │ Science      │         │
│   └─────────────┘   └──────────────┘   └──────────────┘         │
│                                                                  │
│   ✅ Parents see "Baking Bread"                                 │
│   ✅ System secretly records "Chemistry, Math, Motor Skills"    │
│   ✅ Transcript shows "Applied Science: Mastered Measurement"   │
└─────────────────────────────────────────────────────────────────┘
```

### Corrected Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                              │
│  Dashboard → FormationCard → Complete Button                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 COMPLETION ENDPOINTS                             │
│  POST /api/liturgy/complete   POST /api/reading/complete         │
│                      │                                           │
│          ┌───────────┴────────────┐                              │
│          ▼                        ▼                              │
│  liturgy_completions      reading_sessions                       │
│          │                        │                              │
│          └───────────┬────────────┘                              │
│                      ▼                                           │
│        🔧 NEW: advancePathForItem(db, userId, formationId)       │
│                      │                                           │
│                      ▼                                           │
│        family_path_subscriptions.current_position++              │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 GET /api/paths/today                             │
│  ✅ Correctly reads current_position                             │
│  ✅ Queries formations table for next item                       │
│  ✅ Returns concrete item with real ID                           │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RhythmGenerator (AI)                             │
│  🔧 NEW: Fetch /api/paths/today FIRST                            │
│  🔧 NEW: Pass items as AVAILABLE_CONTENT in prompt               │
│  🔧 NEW: Output real content_id values                           │
│  ✅ Schedule items into time slots (if user wants structure)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Implementation Phases

### Phase 1: Fix the Feedback Loop (CRITICAL) — 4 hours

**Goal**: When a user completes ANY item, the corresponding Learning Path advances.

| Task | File | Status | Est. |
|------|------|--------|------|
| 1.1 Create `advancePathForItem()` helper | `cloudflare/src/lib/paths.ts` | TODO | 1h |
| 1.2 Integrate into `POST /api/liturgy/complete` | `cloudflare/src/routes/curriculum.ts` | TODO | 30m |
| 1.3 Integrate into `POST /api/reading/complete` | `cloudflare/src/routes/library.ts` | TODO | 30m |
| 1.4 Add unit tests for advancement logic | `cloudflare/src/tests/paths.test.ts` | TODO | 1h |
| 1.5 Test end-to-end completion → advancement | Manual | TODO | 1h |

**Helper Function Specification:**
```typescript
// cloudflare/src/lib/paths.ts

/**
 * Advances any active path that includes the given formation.
 * Called after a user completes a liturgy item, reading, or activity.
 * 
 * Logic:
 * 1. Find all active subscriptions for this user
 * 2. For each subscription, check if the completed formation is the "current" item
 * 3. If yes, increment current_position
 * 4. If position >= total_items, mark path as completed
 */
export async function advancePathForItem(
  db: D1Database,
  userId: string,
  formationId: string
): Promise<{ advanced: boolean; pathId?: string; newPosition?: number }> {
  // Implementation here
}
```

---

### Phase 2: Connect AI to Real Content — 4 hours

**Goal**: `RhythmGenerator` outputs real content IDs, not placeholders.

| Task | File | Status | Est. |
|------|------|--------|------|
| 2.1 Add `fetchTodayItems()` call at start of `generateWeeklyRhythm()` | `cloudflare/src/ai/rhythm-generator.ts` | TODO | 1h |
| 2.2 Format items as `AVAILABLE_CONTENT` in system prompt | `cloudflare/src/ai/rhythm-generator.ts` | TODO | 1h |
| 2.3 Update prompt to say "Pick from AVAILABLE_CONTENT only" | `cloudflare/src/ai/rhythm-generator.ts` | TODO | 30m |
| 2.4 Replace `content_id: "placeholder"` with real IDs in output | `cloudflare/src/ai/rhythm-generator.ts` | TODO | 30m |
| 2.5 Test that generated plans reference real books/activities | Manual | TODO | 1h |

**New Prompt Pattern:**
```
OLD: "Create a schedule for Monday morning with activities."

NEW: "Given these AVAILABLE_CONTENT items from the family's active paths:
  - [Hymn] 'This is My Father's World' (id: hymn_001)
  - [Book] 'The Little Red Hen' (id: book_pastor_curtis_001)
  - [Activity] 'Baking Bread' (id: liv_sci_001)
  
Schedule these into the family's available time. Do NOT invent new items."
```

---

### Phase 3: Seed R2 Books → Database — 3 hours

**Goal**: Every book in R2 storage has a corresponding `formations` row.

| Task | File | Status | Est. |
|------|------|--------|------|
| 3.1 Create R2 listing script | `cloudflare/scripts/seed-books.ts` | TODO | 1h |
| 3.2 Parse each book's `metadata.json` | `cloudflare/scripts/seed-books.ts` | TODO | 30m |
| 3.3 Insert into `formations` with `formation_type='reading'` | `cloudflare/scripts/seed-books.ts` | TODO | 30m |
| 3.4 Add `learning_outcomes` and `themes` from metadata | `cloudflare/scripts/seed-books.ts` | TODO | 30m |
| 3.5 Run on all existing R2 content | Manual | TODO | 30m |

**Book → Formation Mapping:**
```typescript
// From R2 metadata.json
{
  "id": "pastor_curtis_001",
  "title": "The Shepherd's Call",
  "themes": ["Perseverance", "Faith"],
  "learningOutcomes": ["History:Church", "Character:Courage"]
}

// To formations table
INSERT INTO formations (
  id, title, formation_type, primary_virtue, description,
  learning_outcomes, min_age_months, max_age_months
) VALUES (
  'book_pastor_curtis_001',
  'The Shepherd''s Call',
  'reading',
  'Perseverance',
  'A story about...',
  '["History:Church", "Character:Courage"]',
  36, 96
);
```

---

### Phase 4: "Weekly Basket" UI — 6 hours

**Goal**: Replace rigid day-slot timeline with flexible resource basket.

| Task | File | Status | Est. |
|------|------|--------|------|
| 4.1 Create `WeeklyBasket` component | `src/components/dashboard/WeeklyBasket.tsx` | TODO | 2h |
| 4.2 Create `BasketItem` card with prep/mess indicators | `src/components/dashboard/BasketItem.tsx` | TODO | 1h |
| 4.3 Add "Best 3 for Today" smart defaults | `src/hooks/useTodayRecommendations.ts` | TODO | 1h |
| 4.4 Add toggle for "Structure Mode" (optional time slots) | `src/components/dashboard/StructureToggle.tsx` | TODO | 1h |
| 4.5 Integrate into Dashboard | `src/pages/Dashboard.tsx` | TODO | 1h |

**UI Mockup:**
```
┌──────────────────────────────────────────────────────┐
│  📦 This Week's Basket                    [Structure ⚙️]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  🌟 Best 3 for Today                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📖 The Little Red Hen      │ 15 min │ 🧹 Low  │ │
│  │    Themes: Perseverance, Farming               │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🎵 This is My Father's World │ 5 min │ 🧹 Zero│ │
│  │    Hymn Journey: 12/52                         │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🍞 Baking Bread             │ 2 hrs │ 🧹 High │ │
│  │    Hidden: Chemistry, Math, Motor Skills       │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📚 Rest of Basket (4 more items)           [Show ▼] │
└──────────────────────────────────────────────────────┘
```

---

### Phase 5: "Invisible Registrar" Reports — 4 hours

**Goal**: Aggregate hidden `learning_outcomes` into visual progress reports.

| Task | File | Status | Est. |
|------|------|--------|------|
| 5.1 Create `aggregateLearningOutcomes()` function | `cloudflare/src/lib/outcomes.ts` | TODO | 1h |
| 5.2 Create `GET /api/progress/outcomes` endpoint | `cloudflare/src/routes/progress.ts` | TODO | 1h |
| 5.3 Create `OutcomesChart` component (pie/bar) | `src/components/progress/OutcomesChart.tsx` | TODO | 1h |
| 5.4 Create "Memories" view showing weekly outcomes | `src/pages/Memories.tsx` | TODO | 1h |

**Aggregation Logic:**
```typescript
// Query all completions for the family this week
// For each completion, parse learning_outcomes JSON
// Aggregate by category: Science, Math, PE, History, etc.
// Return: { "Science": 12, "Math": 8, "PE": 5, "History": 3 }
```

---

### Phase 6: Path Progress Trail — 3 hours

**Goal**: Visual "stone path" showing journey progress.

| Task | File | Status | Est. |
|------|------|--------|------|
| 6.1 Create `PathTrail` component | `src/components/paths/PathTrail.tsx` | TODO | 2h |
| 6.2 Add to PathsPage detail view | `src/pages/PathsPage.tsx` | TODO | 30m |
| 6.3 Add mini version to Dashboard badges | `src/components/dashboard/PathBadge.tsx` | TODO | 30m |

---

## Part 4: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Choice Paralysis** | "Best 3 for Today" smart defaults reduce overwhelm |
| **Disconnected Books** | Keep generic fallbacks (e.g., "Nature Walk" fits any week) |
| **"School" Creep** | "Structure Mode" toggle satisfies parents who crave gridlines |
| **AI Hallucination** | Prompt says "Pick from AVAILABLE_CONTENT only, do NOT invent" |
| **Feedback Loop Breaks** | `advancePathForItem()` is called from ALL completion endpoints |

---

## Part 5: Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Content with real IDs | 0% | 100% |
| Completion → Path advancement | Broken | Working |
| Activities with `learning_outcomes` | ~5 | All |
| Books indexed in DB | 0 | All R2 books |
| "Weekly Basket" UI | ❌ | ✅ |
| "Invisible Registrar" reports | ❌ | ✅ |

---

## Part 6: File Reference

### Backend Files to Modify

| File | Purpose | Priority |
|------|---------|----------|
| `cloudflare/src/lib/paths.ts` | NEW: `advancePathForItem()` helper | P0 |
| `cloudflare/src/routes/curriculum.ts` | Add advancement call to complete endpoint | P0 |
| `cloudflare/src/routes/library.ts` | Add advancement call to complete endpoint | P0 |
| `cloudflare/src/ai/rhythm-generator.ts` | Fetch real content before generating | P0 |
| `cloudflare/src/lib/outcomes.ts` | NEW: Outcome aggregation logic | P2 |
| `cloudflare/src/routes/progress.ts` | NEW: Outcomes endpoint | P2 |
| `cloudflare/scripts/seed-books.ts` | NEW: R2 → DB sync script | P1 |

### Frontend Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `src/components/dashboard/WeeklyBasket.tsx` | Basket view component | P1 |
| `src/components/dashboard/BasketItem.tsx` | Item card with indicators | P1 |
| `src/hooks/useTodayRecommendations.ts` | Smart "Best 3" logic | P1 |
| `src/components/progress/OutcomesChart.tsx` | Visual outcome aggregation | P2 |
| `src/components/paths/PathTrail.tsx` | Journey visualization | P2 |
| `src/pages/Memories.tsx` | Weekly outcomes view | P2 |

---

## Appendix: Database Schema Reference

### formations table (with Living Education columns)

```sql
CREATE TABLE formations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  formation_type TEXT CHECK(formation_type IN ('skill','habit','liturgy','reading','scripture')),
  primary_virtue TEXT,
  min_age_months INTEGER,
  max_age_months INTEGER,
  guide_steps TEXT,        -- JSON
  materials TEXT,          -- JSON
  duration_minutes INTEGER,
  -- Living Education columns (NEW)
  learning_outcomes TEXT,  -- JSON: ["Science:Chemistry", "Math:Fractions"]
  mess_level TEXT DEFAULT 'low' -- 'zero', 'low', 'high'
);
```

### books table (with Living Education columns)

```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  -- ... existing columns ...
  -- Living Education columns (NEW)
  learning_outcomes TEXT,    -- JSON: ["History:Ancient"]
  themes TEXT,               -- JSON: ["Perseverance", "Nature"]
  related_activities TEXT    -- JSON: ["formation_id_1", "formation_id_2"]
);
```

---

*This document supersedes ARCHITECTURAL_REPORT.md for implementation planning.*
