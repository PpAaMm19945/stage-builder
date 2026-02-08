# Codebase Judgement: Anchor Engine Audit
**Date:** 2026-02-08
**Purpose:** Re-evaluate the Spine → Arc → Anchor → Feedback pipeline, validate the walkthrough claims, and record current strengths/risks.

---

## 1. Executive Summary

**Score: 8.4 / 10**

The core Spine → Arc → Anchor flow is present and mostly wired, with strong safety guardrails and a cohesive generation pipeline. However, a few key integrations do **not** line up with the walkthrough: frontend context controls are not passed through the API, feedback aggregation attempts to write to a table schema that does not match the migration, and the arc’s `spine_version` tracking is not aligned with the approved spine metadata. These gaps are fixable, but they are real sources of operational drift.

**High confidence wins**
- Spine generation is a full multi-draft consensus pipeline with conflict resolution and audit logging.
- Arc generation pulls current week targets, checks progress, and produces unified 14-day plans.
- Anchors enforce runtime safety rules for young children and keep detailed telemetry logs.

**Primary risks**
- Context signals (weather/time/energy) are collected in the UI but never reach the anchor generator.
- Feedback aggregation is coded, but the insert statement does not match the database table schema.
- Arc `spine_version` is not tied to actual approved spine versions.

---

## 2. Walkthrough Audit (Claims vs. Reality)

| Walkthrough Claim | Audit Result | Evidence / Notes |
|---|---|---|
| `resolveConflict` pulls draft data from `spine_metadata` and updates `curriculum_spine`. | ✅ Confirmed | `resolveConflict` reads `generation_log` from `spine_metadata` and updates `curriculum_spine` using the selected draft. |
| `getWeeklyTargets` auto-detects latest approved spine when position is missing. | ✅ Confirmed (non-persistent) | Logic selects latest approved version if `spine_version` missing, but does **not** save this back to `family_curriculum_position`. |
| `storeDraftSpine` logs full draft content for auditability. | ✅ Confirmed | `generation_log` stores full `drafts` + `conflicts`. |
| `completeAnchor` aggregates feedback, advances week, updates spine pointer, and marks arc complete. | ⚠️ Partial | It aggregates feedback and marks arc complete after 14 completions, then advances `current_week` using whatever `spine_version` is already on the family position. If the position has no spine version, it skips advancement. |
| `aggregateFeedback` writes to `anchor_feedback_summary`. | ⚠️ Mismatch | Code attempts to insert columns (`total_anchors`, `completed_count`, `average_rating`) that do **not** exist in the migration (`total_completed`, `avg_rating`, etc.), so inserts will fail. |
| `validateSafety` enforces role safety rules. | ✅ Confirmed | Seedlings are forced to Observer; Sprouts are downgraded from Leader. |
| UI context controls are integrated and passed to AI. | ❌ Not wired end-to-end | UI and client API set query params, but `/api/anchor/today` ignores them and always calls `getTodayAnchor` without context. |
| `/api/rhythm/regenerate` returns 410 Gone. | ✅ Confirmed | Endpoint returns 410 with a deprecation message. |

---

## 3. Architecture Judgement (Current State)

### A. Curriculum Spine (`spine-generator.ts`)
**Status: Strong / Complete**
- Multi-draft generation with consensus merge and conflict reporting.
- Full draft audit log stored in `spine_metadata.generation_log`.
- Human conflict resolution updates the canonical spine entry.

### B. Arc Generator (`arc-generator.ts`)
**Status: Strong but inconsistent spine versioning**
- Weekly targets loaded per subject with fallback to latest approved spine if position missing.
- 14-day arc generation uses unified cross-curricular plan.
- **Gap:** Arc `spine_version` is set to a `week_#` placeholder rather than the actual approved spine version. This weakens auditability and continuity when advancing.

### C. Anchor Generator (`anchor-generator.ts`)
**Status: Strong with safety guardrails**
- Role enforcement for Seedlings/Sprouts is applied at runtime.
- Materials whitelist and safety checks reduce generation risk.
- `completeAnchor` records progress and triggers auto-advance after 14 completions.

### D. Feedback Loop
**Status: Implemented but currently broken by schema mismatch**
- Feedback aggregation logic exists and triggers on arc completion.
- The insert statement for `anchor_feedback_summary` does not match the migration schema, causing insertion failures.

### E. Frontend Context Integration
**Status: UI-ready but backend disconnected**
- UI inputs for weather, energy, and time are in place.
- The API client sends those values as query parameters.
- The `/api/anchor/today` route discards those parameters and does not pass context to the anchor generator.

---

## 4. Priority Fixes (Recommended)

1. **Wire context into `/api/anchor/today`.** Parse the query parameters and pass them into `getTodayAnchor`.
2. **Align feedback summary schema.** Update either the migration or the insert statement so column names match.
3. **Persist spine version continuity.** Ensure arc generation and curriculum advancement use actual `spine_version` values, not week-number placeholders.
4. **Persist auto-detected spine version.** When `getWeeklyTargets` finds an approved spine, store it in `family_curriculum_position` so the family is anchored to a known version.

---

## 5. Final Verdict

The engine is *close* to the walkthrough’s target state, but several wiring issues prevent it from being a fully cohesive, end-to-end AI pipeline. The most urgent work is to restore feedback summary writes and pass UI context into the anchor generator. With those fixes, the system would reasonably return to the 9+ range.
