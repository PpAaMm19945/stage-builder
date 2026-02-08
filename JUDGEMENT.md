# Codebase Audit: Anchor Generation System
**Date:** 2026-02-07  
**Purpose:** Re-evaluate the AI engine architecture after remediation work. Replace the original audit.

---

## 1. Executive Summary

**Score: 8.5/10** (up from 5.5/10 in the original audit)

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

## 6A. Completion Plan (Detailed, Practical)

Below is a concrete, end-to-end plan to close every remaining gap. It is ordered by dependency and impact, with clear implementation steps, verification, and suggested sequencing.

### Phase 1 — Curriculum Backbone (Highest leverage)

**Goal:** Make the spine → arc → anchor pipeline deterministic and self-advancing.

1. **Seed curriculum spine data (4–8 weeks minimum)**
   - **Scope:** Populate `curriculum_spine` with a first slice of realistic weekly content (subject, stage, focus_area, skill_targets, faith_framing, liturgy hooks).
   - **Steps:**
     1. Draft a canonical seed format (CSV/JSON) aligned to the migration columns.
     2. Add a seed script (or a one-time SQL migration) to insert week 1–8 rows for each stage.
     3. Validate with `arc-generator.ts` by forcing an arc and confirming it reads spine targets.
   - **Verification:** `force-arc` returns targets sourced from `curriculum_spine` (not `getDefaultTargets()`).

2. **Auto-advance curriculum position**
   - **Scope:** Wire `advanceCurriculumPosition()` to arc completion.
   - **Steps:**
     1. Define completion criteria (e.g., 14 anchors completed OR all required targets met).
     2. In `completeAnchor()` (or a daily job), check if the active arc is complete.
     3. When complete, call `advanceCurriculumPosition()` and record the week transition.
   - **Verification:** After completing the 14th day, the family’s week increments and new arc uses next spine week.

3. **Feedback aggregation (activate `anchor_feedback_summary`)**
   - **Scope:** Aggregate `anchor_feedback` into summary metrics for weekly iteration.
   - **Steps:**
     1. Implement a batch job (cron or on arc generation) that groups by week/subject.
     2. Store averages (rating, completion, difficulty) and common notes.
     3. Use summary in the arc prompt (optional) for continuous improvement.
   - **Verification:** Summary table populated after feedback is collected; arc generation can read it.

### Phase 2 — Safe & Honest Outputs (Trust upgrades)

4. **Runtime age safety validation**
   - **Scope:** Enforce post-generation validation for unsafe assignments.
   - **Steps:**
     1. Add explicit rules (age gates for scissors, heat, sharp tools, etc.).
     2. Run validation after AI output and before returning to the user.
     3. On violation, regenerate or fallback to a safe template.
   - **Verification:** Automated tests prove unsafe roles are rejected.

5. **Tighten material matching**
   - **Scope:** Prevent `includes()` loopholes in `validateMaterials()`.
   - **Steps:**
     1. Replace substring checks with token/word-boundary matching.
     2. Maintain a “disallowed terms” list for sharp or hazardous modifiers.
     3. Add tests for edge cases like “sharp scissors.”
   - **Verification:** Test suite fails on unsafe variations and passes on safe ones.

### Phase 3 — Product Surface Cleanup (Reduce confusing paths)

6. **Clean up `ai.ts` legacy actions**
   - **Scope:** Remove dead `confirm`/`reject` logic or constrain to active intents.
   - **Steps:**
     1. Audit current frontend usage (if any).
     2. Delete legacy handlers or return a clear 410 for deprecated actions.
   - **Verification:** No references to `TOGGLE_BASKET_ITEM` or `schedule_change`.

7. **Add frontend context passing to `/api/anchor/today`**
   - **Scope:** Send `AnchorContext` (mood, weather, materials) from UI.
   - **Steps:**
     1. Identify where “Today’s Anchor” is requested.
     2. Attach available context to the request body or query.
     3. Update any server validation to accept optional fields.
   - **Verification:** Logs show context received; anchors reflect it when present.

8. **Production gate debug routes**
   - **Scope:** Disable `/debug/*` in production.
   - **Steps:**
     1. Add `ENVIRONMENT === 'production'` guards per route.
     2. Provide a consistent 403 response.
   - **Verification:** Debug routes blocked in production, accessible elsewhere.

### Phase 4 — Cleanup & Hygiene (Low-risk tidying)

9. **Remove `_legacy_rhythm-generator.ts`**
   - **Scope:** Delete unused legacy file.
   - **Steps:** Confirm no imports; remove file.
   - **Verification:** Build passes without the file.

---

## Suggested Execution Order (Checklist)

1. Seed spine data (weeks 1–8)
2. Auto-advance curriculum position
3. Feedback aggregation job
4. Runtime age validation + tests
5. Tighten material matching + tests
6. Clean up `ai.ts` legacy actions
7. Frontend context passing
8. Production gate debug routes
9. Delete `_legacy_rhythm-generator.ts`

---

## 7. Build Health

The frontend build is now **clean**. All TypeScript build errors have been resolved, ensuring a stable development baseline.

- `AIInteractionLog.tsx`, `AiLogViewer.tsx`: Fixed context type casting.
- `StudentAiChat.tsx`, `FrontdeskChat.tsx`: Updated `ChatContext` type.
- `BookReader.tsx`: Fixed progress data typing.
- `MomentumRings.tsx`: Fixed slots typing.
- `WorkApprovals.tsx`: Fixed missing properties on `WorkEntry` and removed `PendingEntry`.
- `FormationCard.tsx`: Removed unused ts-expect-error.
- `WelcomeFlow.tsx`: Fixed JSON stringify usage and added `onboarding_mode` to `FamilyProfile`.
- `PortfolioGallery.tsx`: Updated `PortfolioItem` type and property usage (snake_case).
- `Today.tsx`: Fixed map callback typing.

The Cloudflare worker (`cloudflare/`) also builds cleanly.

---

## 8. Final Verdict

The architecture is now **correct and unified**. The original audit's core criticism — "three disconnected engines when there should be one pipeline" — has been fully addressed. The system runs on one model, one identity, and one context pipeline.

**What prevents a 9/10:**
1. No seeded curriculum data (the spine exists but is empty)
2. No automatic curriculum advancement
3. Feedback aggregation table is unused

**Path from 8.5 to 9/10:**
1. Seed 4-8 weeks of curriculum spine data → activates deterministic curriculum
2. Wire `advanceCurriculumPosition()` to arc completion → closes the progression loop
3. Implement feedback summary aggregation → enables data-driven arc improvement

The system is **demo-ready** in its current state. The AI generates anchors, the chat companion understands them, progress is tracked, and feedback is captured. The remaining work is about making the curriculum deterministic rather than generative — an improvement, not a fix.

---

## 9. Lovable.dev Review

**Date:** 2026-02-08
**Scope:** Verify all Section 7 build fixes, assess new work completed since the original audit, evaluate the Curriculum Management Dashboard, and provide an updated score.

---

### A. Build Health — All 13 TypeScript Errors Resolved ✅

Every fix listed in Section 7 has been confirmed in the source code:

| File | Fix Applied | Verified |
|------|-------------|----------|
| `api-responses.ts` | Added `mode?` and `page?` to `ChatContext`; `onboarding_mode?` to `FamilyProfile`; `apprenticeship_title?`, `student_name?`, `student_avatar?` to `WorkEntry` | ✅ |
| `AIInteractionLog.tsx` | Cast `log.context.activityTitle as string` | ✅ |
| `AiLogViewer.tsx` | Cast `log.context.activityTitle as string` | ✅ |
| `BookReader.tsx` | Cast `res.progress.data.current_page as number` | ✅ |
| `StudentAiChat.tsx` | Resolved via `ChatContext.mode?` addition | ✅ |
| `FrontdeskChat.tsx` | Resolved via `ChatContext.page?` addition | ✅ |
| `MomentumRings.tsx` | Typed `slots` as `Array<{ day: string; activityId?: string }>` | ✅ |
| `WorkApprovals.tsx` | Removed `PendingEntry`, uses unified `WorkEntry` | ✅ |
| `FormationCard.tsx` | Removed unused `@ts-expect-error` directive | ✅ |
| `WelcomeFlow.tsx` | Removed `JSON.stringify()` wrappers; passes arrays directly | ✅ |
| `PortfolioGallery.tsx` | Imports `PortfolioItem` from `api-responses` | ✅ |
| `Today.tsx` | Fixed `familyActivities.map()` to treat items as flat `Formation` | ✅ |

The frontend build is **clean** with zero TypeScript errors.

---

### B. Progress on Section 6 Remaining Work

Three items from the original Section 6 checklist have been completed since the last audit:

| # | Task | Original Status | Current Status |
|---|------|----------------|----------------|
| 6 | Clean up `ai.ts` legacy actions | ⚠️ Dead code | ✅ **Done** — `confirm`/`reject` endpoints return HTTP 410 with deprecation message |
| 8 | Production gate debug routes | ⚠️ None | ✅ **Done** — `ENVIRONMENT === 'production'` guard blocks all `/debug/*` routes |
| — | Curriculum Management Dashboard | Not in original plan | ✅ **Done** — Full admin UI for spine generation, conflict resolution, and approval |

---

### C. Curriculum Management Dashboard Assessment

A complete admin interface for managing the curriculum spine has been built at `/admin/ai` under the "Curriculum Spine" tab. Five new components form the dashboard:

| Component | Purpose | Assessment |
|-----------|---------|------------|
| `SpineManager.tsx` | State orchestrator (list / generate / resolve / view) | Clean, minimal state management with proper view transitions |
| `SpineGenerationForm.tsx` | Subject, stage, and week range inputs | Triggers 3-draft AI consensus pipeline via `api.adminAi.generateSpine()` |
| `SpineList.tsx` | Version history with status badges | Displays draft/approved status, surfaces conflict indicators |
| `ConflictResolver.tsx` | Side-by-side draft comparison | Radio selection per conflict, "Resolve & Next" flow |
| `SpineViewer.tsx` | Read-only curriculum table | Displays week, focus area, skill targets, and faith framing |

**Integration:** All components connect through `api.adminAi.*` methods to backend `/api/admin/spine/*` routes. The dashboard enables the full workflow described in Section 6A Phase 1: generate spine data → review conflicts → approve versions.

**Quality:** Components are focused and single-responsibility. No monolithic files. The `SpineManager` orchestrator is 80 lines. State management is local (no global store needed for this admin flow).

---

### D. Updated Remaining Work

| # | Task | Status | Blocker / Notes |
|---|------|--------|-----------------|
| 1 | Seed curriculum spine data | **Not started** | Dashboard exists to generate it; no data seeded yet |
| 2 | Auto-advance curriculum position | **Not started** | `advanceCurriculumPosition()` exists, no trigger wired |
| 3 | Feedback aggregation | **Not started** | `anchor_feedback_summary` table exists, no aggregation logic |
| 4 | Runtime age validation | **Not started** | Prompt-only enforcement; low risk |
| 5 | Tighten material matching | **Not started** | `includes()` substring matching still used |
| 7 | Frontend context passing | **Not started** | No mood/weather/materials sent to `/api/anchor/today` |
| 9 | Delete `_legacy_rhythm-generator.ts` | **Blocked** | Still imported by `family.ts`; requires dependency removal first |

---

### E. Updated Score

**Score: 8.75/10** (up from 8.5)

**What improved:**
- Build is fully clean (was listed as "clean" but had 13 unverified fixes — now confirmed)
- Legacy `ai.ts` cruft removed (410 deprecation)
- Debug routes production-gated
- Curriculum Management Dashboard provides the admin tooling to seed spine data (the #1 remaining gap)

**What prevents a 9.5/10:**
1. No seeded curriculum data — the pipeline is complete end-to-end but empty
2. No automatic curriculum advancement trigger
3. Feedback aggregation table remains unused
4. `_legacy_rhythm-generator.ts` still exists (blocked by import)

**Path from 8.75 to 9.5/10:**
1. Use the new dashboard to generate and approve 4–8 weeks of spine data → activates deterministic curriculum
2. Wire `advanceCurriculumPosition()` to arc completion → closes the progression loop
3. Implement feedback summary aggregation → enables data-driven iteration
4. Untangle `_legacy_rhythm-generator.ts` from `family.ts` and delete it
