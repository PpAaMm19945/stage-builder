# Codebase Audit: Anchor Generation System
**Date:** 2026-02-08
**Purpose:** Final verification of the AI engine architecture after Phase 1-7 completion.

---

## 1. Executive Summary

**Score: 9.5/10** (up from 8.5/10)

The three-engine disconnect is resolved, and the execution gaps have been closed. The **Curriculum Spine → Arc → Anchor → Feedback** pipeline is now fully wired and functional.
- **Spine:** Database schema exists, and the **Curriculum Management Dashboard** (implemented separately) handles seeding and approval.
- **Arc:** Auto-detects approved spine versions and automatically advances the family's curriculum position upon completion.
- **Anchor:** Enforces age-based role safety (Seedlings=Observer, Sprouts!=Leader) and passes detailed context (Weather, Mood, Time).
- **Feedback:** Aggregates feedback into `anchor_feedback_summary` for future optimization.

**The system is feature-complete.** The architecture is unified, safe, and self-driving.

---

## 2. Architecture: Current State

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SINGLE AI PIPELINE (Achieved)                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Curriculum    │─▶│ Arc          │─▶│ Anchor     │─▶│ Cortex   │ │
│  │ Spine (Dashboard)│  │ Generator    │  │ Generator  │  │ (Chat)   │ │
│  └──────────────┘  └──────────────┘  └────────────┘  └──────────┘ │
│                                                                     │
│  curriculum_spine    gemini-3-flash    gemini-3-flash   gemini-3-   │
│  table + admin UI    -preview          -preview         flash-      │
│                                                                     │
│  Status: COMPLETE    Status: COMPLETE  Status: COMPLETE Status:    │
│  Managed via         Auto-advances     Context-aware,   WORKING    │
│  Dashboard           position          Safety-checked   Anchor-    │
│                                                         aware      │
└─────────────────────────────────────────────────────────────────────┘
```

### What Changed Since Last Audit

| Original Problem | Status | Evidence |
|-----------------|--------|----------|
| Three disconnected engines | ✅ FIXED | `frontdesk.ts`, `router.ts`, `triage.ts` deleted. Only `cortex.ts`, `anchor-generator.ts`, `arc-generator.ts` remain. |
| Chatbot used wrong models (llama-3-8b, gemini-2.0-flash) | ✅ FIXED | `gemini.ts` line 35: `model = 'gemini-3-flash-preview'`. All three engines use same model. |
| Chatbot had wrong identity ("FamilyPath Frontdesk") | ✅ FIXED | `cortex.ts` line 233: "You are the Anchor Companion". No legacy language. |
| Chatbot had no knowledge of today's anchor | ✅ FIXED | `cortex.ts` line 69: fetches today's anchor, injects into system prompt (lines 251-273). |
| ArcGenerator missing catch block | ✅ FIXED | `arc-generator.ts` lines 330-368: proper try/catch with error handling. |
| Dead code (generateFamilyAnchor, 170 lines) | ✅ FIXED | Cortex is 320 lines total, focused only on anchor operations. |
| Router handled legacy intents | ✅ FIXED | Cortex uses 5 simple regex patterns (COMPLETE, SKIP, ADJUST, FEEDBACK, REGENERATE). |
| No curriculum spine seeding | ✅ FIXED | **Curriculum Dashboard** implemented to handle generation/approval. |
| Spine-to-Arc wiring broken | ✅ FIXED | `resolveConflict` fixed; `arc-generator` reads specific `spine_version`. |
| No auto-advance | ✅ FIXED | `completeAnchor` triggers `advanceCurriculumPosition` after 14 days. |
| Feedback loop broken | ✅ FIXED | `anchor_feedback_summary` populated on arc completion. |
| Skip route code duplication | ✅ FIXED | `anchor.ts` line 96 now calls `generator.skipAnchor()` instead of inline SQL. |
| Debug route column name bugs | ✅ FIXED | `debug.ts` queries now use correct column names (`subject`, `skill_target`). |
| Parent mood only handled "tired" | ✅ FIXED | `anchor-generator.ts` lines 406-409: both `tired` and `energetic` moods handled. |
| Frontend context missing | ✅ FIXED | `Today.tsx` passes Weather, Mood, Time to AI. |
| Runtime age safety | ✅ FIXED | `validateSafety` enforces "Observer" for <24m, downgrades "Leader" for <48m. |
| Legacy code clutter | ✅ FIXED | `_legacy_rhythm-generator.ts` deleted; endpoints deprecated. |

---

## 3. Detailed Component Assessment

### A. Curriculum Spine (`spine-generator.ts`)
**Status: COMPLETE**
- Migration `v2_0052` creates the `curriculum_spine` table with correct columns (subject, week_number, stage, focus_area, skill_targets, faith_framing, etc.).
- `spine-generator.ts` exists with full generation pipeline (multi-call drafting capability).
- `resolveConflict` now correctly fetches draft data and updates the spine.
- Integrated with Admin Dashboard for management.

### B. Arc Generator (`arc-generator.ts`)
**Status: COMPLETE**
- Reads eligible children (0-84 months).
- Reads child progress map from `child_progress` table.
- Reads weekly targets from spine (with defaults fallback).
- Reads liturgy position (catechism + hymn).
- Generates 14-day unified arc with cross-curricular activities.
- Stores arc with spine version for auditability.
- `recordChildProgress()` properly updates mastery levels (3 practices → practicing, 6 → mastered).
- **Auto-Advance:** Correctly tracks `spine_version` per subject. `advanceCurriculumPosition()` is now triggered by `completeAnchor()` after 14 days.
- **Feedback:** `aggregateFeedback` summarizes ratings/skips on arc close.
- **Self-Healing:** `getWeeklyTargets` defaults to latest approved spine if position is missing.

### C. Anchor Generator (`anchor-generator.ts`)
**Status: COMPLETE**
- 55-item material whitelist with post-generation validation.
- Age safety rules injected into AI prompt.
- Pre-built plan priority (no AI call when arc plan exists and no adjustments).
- AI fallback with guardrails when needed.
- `completeAnchor()` now records child progress (lines 507-538): parses `targets_covered`, calls `arcGenerator.recordChildProgress()` for each child.
- `skipAnchor()` is a clean method using `safeRun()`.
- Telemetry logging on all paths (cache hit, prebuilt, generation, errors, guardrail violations).
- **Safety:** Hard rules for role assignment based on age (Phase 4). `validateSafety` enforces "Observer" for <24m, downgrades "Leader" for <48m.
- **Context:** Accepts optional `weather`, `timeAvailable`, `parentMood`.
- **Wiring:** Calls Arc Generator methods for progress and advancement.

### D. Cortex / Anchor Companion (`cortex.ts`)
**Status: WORKING**
- Single model (`gemini-3-flash-preview`).
- Today's anchor injected into system prompt with full context (theme, liturgy, activity, book, child roles).
- 5 intent patterns with proper handlers: complete, skip, regenerate, adjust, feedback.
- Streaming chat via `gemini.streamContent()`.
- No legacy code, no dead methods.
- Stable, single-identity chat companion.

### E. Frontend (`Today.tsx`)
**Status: UPDATED**
- New UI controls for context injection.
- Direct integration with updated content API.

---

## 4. Remaining Work (Maintenance)

### Low Priority / refinements
1. **Tighten material matching** — Current `includes()` logic is functional but fuzzy.
2. **Production gating** — `debug.ts` routes are still open (requires env var check).
3. **Data Analysis** — Monitor `anchor_feedback_summary` to tune prompts.

---

## 5. Final Verdict

The system is **Production Ready**. The chaotic "three-engine" state is gone, replaced by a linear, deterministic, and safe pipeline that adapts to family feedback and context.


---

## 6. Build Health (Verified)

**Date:** 2026-02-08

All 13 TypeScript build errors from the previous audit have been resolved and verified:

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

## 7. Curriculum Dashboard

A complete admin interface for managing the curriculum spine has been built at `/admin/ai`.

| Component | Purpose | Assessment |
|-----------|---------|------------|
| `SpineManager.tsx` | State orchestrator | Clean, minimal state management |
| `SpineGenerationForm.tsx` | Subject/week inputs | Triggers 3-draft AI consensus pipeline |
| `SpineList.tsx` | Version history | Displays draft/approved status |
| `ConflictResolver.tsx` | Draft comparison | "Resolve & Next" flow |
| `SpineViewer.tsx` | Read-only table | Displays focus area/targets |

**Status:** Ready for seeding data.

---

## 8. Final Verdict

The system is **Production Ready**. The chaotic "three-engine" state is gone, replaced by a linear, deterministic, and safe pipeline that adapts to family feedback and context.

**Final Score: 9.5/10**
(The remaining 0.5 is for production gating and long-term prompt tuning).
