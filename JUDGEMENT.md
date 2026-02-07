# Codebase Audit: Anchor Generation System
**Date:** 2026-02-07  
**Purpose:** Re-evaluate the AI engine architecture after remediation work. Replace the original audit.

---

## 1. Executive Summary

**Score: 7.5/10** (up from 5.5/10 in the original audit)

The three-engine disconnect has been resolved. Legacy files (`frontdesk.ts`, `router.ts`, `triage.ts`, `planner.ts`) are deleted. The codebase now runs on a single model (`gemini-3-flash-preview`) with a single identity (Anchor Companion). The core pipeline — **Spine → Arc → Anchor → Feedback** — is structurally complete, with real progress tracking wired into anchor completion.

**Remaining issues are execution gaps, not architectural ones.** The design is correct; some wiring is incomplete.

---

## 2. Architecture: Current State

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SINGLE AI PIPELINE (Achieved)                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Curriculum    │─▶│ Arc          │─▶│ Anchor     │─▶│ Cortex   │ │
│  │ Spine (Data)  │  │ Generator    │  │ Generator  │  │ (Chat)   │ │
│  └──────────────┘  └──────────────┘  └────────────┘  └──────────┘ │
│                                                                     │
│  curriculum_spine    gemini-3-flash    gemini-3-flash   gemini-3-   │
│  table + spine-      -preview          -preview         flash-      │
│  generator.ts                                           preview     │
│                                                                     │
│  Status: TABLE       Status: WORKING   Status: WORKING  Status:    │
│  EXISTS, generator   Reads spine when  Pre-built plan   WORKING    │
│  exists, needs       available,        priority, AI     Anchor-    │
│  seeding             defaults when not fallback          aware      │
└─────────────────────────────────────────────────────────────────────┘
```

### What Changed Since Original Audit

| Original Problem | Status | Evidence |
|-----------------|--------|----------|
| Three disconnected engines | ✅ FIXED | `frontdesk.ts`, `router.ts`, `triage.ts` deleted. Only `cortex.ts`, `anchor-generator.ts`, `arc-generator.ts` remain. |
| Chatbot used wrong models (llama-3-8b, gemini-2.0-flash) | ✅ FIXED | `gemini.ts` line 35: `model = 'gemini-3-flash-preview'`. All three engines use same model. |
| Chatbot had wrong identity ("FamilyPath Frontdesk") | ✅ FIXED | `cortex.ts` line 233: "You are the Anchor Companion". No legacy language. |
| Chatbot had no knowledge of today's anchor | ✅ FIXED | `cortex.ts` line 69: fetches today's anchor, injects into system prompt (lines 251-273). |
| ArcGenerator missing catch block | ✅ FIXED | `arc-generator.ts` lines 330-368: proper try/catch with error handling. |
| Dead code (generateFamilyAnchor, 170 lines) | ✅ FIXED | Cortex is 320 lines total, focused only on anchor operations. |
| Router handled legacy intents | ✅ FIXED | Cortex uses 5 simple regex patterns (COMPLETE, SKIP, ADJUST, FEEDBACK, REGENERATE). |
| No curriculum spine | ✅ PARTIAL | `curriculum_spine` table exists (migration v2_0052). `spine-generator.ts` exists. `arc-generator.ts` reads from spine when available. But **no spine data is seeded yet**. |
| No feedback loop | ✅ PARTIAL | `completeAnchor()` now calls `recordChildProgress()` (anchor-generator.ts lines 507-538). But `anchor_feedback_summary` is still unused. |
| Skip route code duplication | ✅ FIXED | `anchor.ts` line 96 now calls `generator.skipAnchor()` instead of inline SQL. |
| Debug route column name bugs | ✅ FIXED | `debug.ts` queries now use correct column names (`subject`, `skill_target`). |
| Parent mood only handled "tired" | ✅ FIXED | `anchor-generator.ts` lines 406-409: both `tired` and `energetic` moods handled. |

---

## 3. Detailed Component Assessment

### A. Curriculum Spine (`spine-generator.ts` + `curriculum_spine` table)

**Status: Schema complete, needs seeding**

- Migration `v2_0052` creates the `curriculum_spine` table with correct columns (subject, week_number, stage, focus_area, skill_targets, faith_framing, etc.).
- `spine-generator.ts` exists with full generation pipeline (multi-call drafting capability).
- `arc-generator.ts` reads from spine when `spine_version` is set on `family_curriculum_position`.
- **Gap:** No spine data has been seeded. Arc generator falls back to `getDefaultTargets()` which returns hardcoded defaults. The system works but is not yet curriculum-driven.

### B. Arc Generator (`arc-generator.ts`)

**Status: WORKING — 513 lines, well-structured**

- Reads eligible children (0-84 months).
- Reads child progress map from `child_progress` table.
- Reads weekly targets from spine (with defaults fallback).
- Reads liturgy position (catechism + hymn).
- Generates 14-day unified arc with cross-curricular activities.
- Stores arc with spine version for auditability.
- `recordChildProgress()` properly updates mastery levels (3 practices → practicing, 6 → mastered).
- `advanceCurriculumPosition()` exists for week advancement.

**Remaining concern:** `advanceCurriculumPosition()` is never called automatically. There's no trigger to advance the family's week when an arc completes or all 14 days are done.

### C. Anchor Generator (`anchor-generator.ts`)

**Status: WORKING — 563 lines, well-guarded**

- 55-item material whitelist with post-generation validation.
- Age safety rules injected into AI prompt.
- Pre-built plan priority (no AI call when arc plan exists and no adjustments).
- AI fallback with guardrails when needed.
- `completeAnchor()` now records child progress (lines 507-538): parses `targets_covered`, calls `arcGenerator.recordChildProgress()` for each child.
- `skipAnchor()` is a clean method using `safeRun()`.
- Telemetry logging on all paths (cache hit, prebuilt, generation, errors, guardrail violations).

**Remaining concerns:**
1. Age safety is prompt-only — no runtime validation that the AI respected age constraints.
2. `validateMaterials()` fuzzy matching (`normalized.includes(allowed)`) could allow edge cases (e.g., "sharp scissors" passes because it contains "scissors").
3. No frontend UI currently passes `AnchorContext` (weather, mood, materials) to the `/api/anchor/today` endpoint.

### D. Cortex / Anchor Companion (`cortex.ts`)

**Status: WORKING — 320 lines, clean**

- Single model (`gemini-3-flash-preview`).
- Today's anchor injected into system prompt with full context (theme, liturgy, activity, book, child roles).
- 5 intent patterns with proper handlers: complete, skip, regenerate, adjust, feedback.
- Streaming chat via `gemini.streamContent()`.
- No legacy code, no dead methods.

**No issues found.**

### E. Gemini Service (`gemini.ts`)

**Status: WORKING — 210 lines**

- Default model: `gemini-3-flash-preview` (line 35).
- Non-streaming generation with JSON mode support.
- Streaming generation with SSE parsing.
- `streamContent()` wraps generator into ReadableStream for endpoints.
- Tool/function calling support in streaming.

**No issues found.**

### F. Debug Routes (`debug.ts`)

**Status: WORKING — all 7 endpoints functional**

- `/status`: Correct column names (`subject`, not `subject_id`).
- `/arc`: Returns parsed arc data.
- `/anchors`: Returns recent anchors.
- `/force-arc`: Supersedes existing, generates new.
- `/force-anchor`: Supersedes existing, generates new.
- `/progress`: Correct column names (`subject`, `skill_target`).
- `/logs`: Scoped to requesting parent (IDOR prevention).

**Remaining concern:** No production gating. Debug routes are accessible in all environments. The file header says "Should be disabled in production" but no `ENVIRONMENT` check exists.

### G. AI Chat Route (`ai.ts`)

**Status: WORKING — 236 lines, but has legacy cruft**

- `/api/chat`: Clean — builds context, passes to Cortex, streams response.
- `/api/chat/execute`: Works but routes through Cortex chat with action prefix hack.
- `/api/chat/confirm` and `/api/chat/reject`: **Legacy code** — still handles `TOGGLE_BASKET_ITEM`, `UPDATE_PREFERENCES`, `schedule_change` action types that don't exist in the Cortex anymore. These endpoints are technically functional but serve dead features.

### H. Anchor Routes (`anchor.ts`)

**Status: WORKING — clean**

- `GET /today`: Returns cached or generates new anchor.
- `POST /regenerate`: Parent-only, calls `generateAnchor()` with adjustments.
- `POST /complete`: Records feedback, delegates to `AnchorGenerator.completeAnchor()`.
- `POST /skip`: Delegates to `AnchorGenerator.skipAnchor()` (no more inline SQL).
- `GET /history`: Returns last 14 completed/skipped anchors with parsed feedback.

**No issues found.**

---

## 4. Files Inventory

### Active AI Files (All Clean)
| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `cortex.ts` | 320 | Anchor Companion chat | ✅ Clean |
| `anchor-generator.ts` | 563 | Daily anchor generation + guardrails | ✅ Clean |
| `arc-generator.ts` | 513 | 2-week arc generation + progress tracking | ✅ Clean |
| `gemini.ts` | 210 | Unified Gemini API client | ✅ Clean |
| `spine-generator.ts` | ~400 | Curriculum spine generation | ✅ Exists, needs seeding |
| `data.ts` | — | Static catechism + book data | ✅ Clean |
| `types.ts` | 362 | Shared typed interfaces | ✅ Clean |
| `context.ts` | — | Chat context builder | ✅ Clean |
| `tools.ts` | — | Gemini tool definitions | ✅ Clean |

### Legacy Files Remaining
| File | Status | Action Needed |
|------|--------|---------------|
| `_legacy_rhythm-generator.ts` | Prefixed with underscore, not imported | Safe to delete when ready |
| `report-generator.ts` | May be active (transcript/report generation) | Audit separately |
| `summarizer.ts` | May be active | Audit separately |

### Deleted (Confirmed)
- `frontdesk.ts` ✅
- `router.ts` ✅
- `triage.ts` ✅
- `planner.ts` ✅

---

## 5. Summary Table

| Area | Original Score | Current Score | Notes |
|------|---------------|---------------|-------|
| Unified model | ❌ 3 models | ✅ 1 model | `gemini-3-flash-preview` everywhere |
| Unified identity | ❌ "FamilyPath Frontdesk" | ✅ "Anchor Companion" | No legacy language |
| Anchor context in chat | ❌ No knowledge | ✅ Full injection | Theme, liturgy, activity, book, child roles |
| Legacy code removal | ❌ 4 dead files | ✅ All deleted | Only `_legacy_rhythm-generator.ts` remains (safe) |
| Curriculum spine | ❌ No spine | ⚠️ Schema + generator exist | Needs data seeding |
| Material guardrails | ✅ Working | ✅ Working | Post-gen validation, telemetry on violations |
| Age safety | ⚠️ Prompt-only | ⚠️ Prompt-only | No runtime validation (low risk) |
| Feedback capture | ❌ No loop | ✅ Working | complete/skip with feedback storage |
| Progress recording | ❌ Never called | ✅ Wired in | `completeAnchor()` → `recordChildProgress()` |
| Feedback aggregation | ❌ Unused table | ❌ Unused table | `anchor_feedback_summary` still empty |
| Debug routes | ❌ Runtime bugs | ✅ Fixed | Correct column names |
| Production gating | ⚠️ None | ⚠️ None | Debug routes still open |
| Pre-built plan priority | ✅ Working | ✅ Working | No AI call when arc plan exists |
| Cortex intents | ✅ Working | ✅ Working | 5 patterns, all handlers implemented |
| ai.ts legacy actions | — | ⚠️ Dead code | `confirm`/`reject` handle legacy action types |

---

## 6. Remaining Work (Priority Order)

### High Priority
1. **Seed curriculum spine data** — The entire spine → arc → anchor pipeline is wired but runs on defaults because no spine data exists. Even 4 weeks of seeded data would activate the deterministic curriculum path.
2. **Auto-advance curriculum position** — `advanceCurriculumPosition()` exists but is never called. Need a trigger when all 14 arc days are completed or when a new arc is generated.

### Medium Priority
3. **Clean up `ai.ts` legacy actions** — The `confirm`/`reject` endpoints handle `TOGGLE_BASKET_ITEM` and `schedule_change` which are dead features. Remove or simplify.
4. **Implement `anchor_feedback_summary`** — Table exists, schema is good. Needs a weekly aggregation pass (could be a cron or triggered on new arc generation).
5. **Add frontend context passing** — The `AnchorContext` interface supports weather, mood, materials but no UI passes these to `/api/anchor/today`.
6. **Production-gate debug routes** — Add `if (c.env.ENVIRONMENT === 'production') return c.json({ error: 'Not available' }, 403)` guard.

### Low Priority
7. **Runtime age validation** — Add a post-generation check that activity roles don't assign unsafe tasks to children under age thresholds.
8. **Tighten material fuzzy matching** — Current `includes()` logic could be more precise.
9. **Delete `_legacy_rhythm-generator.ts`** — No functional impact, just cleanup.

---

## 7. Build Health

The frontend has **~40 TypeScript build errors** across components unrelated to the AI engine:
- `FamilyCompletionModal.tsx`: ~20 errors (untyped `unknown` values)
- `SwapActivitySheet.tsx`: 8 errors (untyped `unknown`)
- `TomorrowPreview.tsx`: 6 errors (mismatched types)
- `NotificationStack.tsx`: 2 errors (missing `date` property)
- `AuthContext.tsx`: 1 error (independence_settings type mismatch)
- Various other components with minor type issues

**These are all frontend type errors, not AI engine issues.** The Cloudflare worker (`cloudflare/`) builds cleanly.

---

## 8. Final Verdict

The architecture is now **correct and unified**. The original audit's core criticism — "three disconnected engines when there should be one pipeline" — has been fully addressed. The system runs on one model, one identity, and one context pipeline.

**What prevents a 9/10:**
1. No seeded curriculum data (the spine exists but is empty)
2. No automatic curriculum advancement
3. Feedback aggregation table is unused
4. ~40 frontend build errors (unrelated to AI but affect overall project health)

**Path from 7.5 to 9/10:**
1. Seed 4-8 weeks of curriculum spine data → activates deterministic curriculum
2. Wire `advanceCurriculumPosition()` to arc completion → closes the progression loop
3. Implement feedback summary aggregation → enables data-driven arc improvement
4. Fix frontend build errors → clean builds across the board

The system is **demo-ready** in its current state. The AI generates anchors, the chat companion understands them, progress is tracked, and feedback is captured. The remaining work is about making the curriculum deterministic rather than generative — an improvement, not a fix.
