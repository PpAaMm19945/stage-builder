# Codebase Judgement: Anchor Engine Audit
**Date:** 2026-02-08
**Purpose:** Full re-audit of the Spine → Arc → Anchor → Feedback pipeline. Every claim verified against source code.

---

## 1. Executive Summary

**Score: 9.5 / 10**

The pipeline is architecturally complete and end-to-end operational. The Curriculum Management Dashboard correctly populates the `curriculum_spine` and `spine_metadata` tables through a generate → resolve → approve flow. The arc generator auto-detects approved spines and persists the discovery for first-cycle families. Anchor completion triggers auto-advance and feedback aggregation. Safety guardrails (material whitelist, role enforcement, debug gating) are production-grade.

All previously identified bugs have been resolved:

1. ✅ **Feedback aggregation schema** — INSERT columns now match migration (`total_completed`, `total_skipped`, `avg_rating`).
2. ✅ **Arc `spine_version`** — Now captures actual approved spine version from `getWeeklyTargets()` instead of `week_#` placeholder.
3. ✅ **Frontend context wiring** — `/api/anchor/today` parses `weather`, `mood`, `materials` query params; `/api/anchor/regenerate` parses them from POST body.
4. ✅ **Auto-detect spine persistence** — `getWeeklyTargets()` self-heals `family_curriculum_position` with `INSERT ... ON CONFLICT DO NOTHING`.
5. ✅ **Legacy cleanup** — `_legacy_rhythm-generator.ts` deleted. `/api/rhythm/regenerate` returns 410. `planner.ts` retained as active utility.

**High confidence wins**
- Spine generation is a complete 3-draft consensus pipeline with conflict resolution, audit logging, and admin dashboard.
- `resolveConflict()` correctly reads draft data from `generation_log` and updates `curriculum_spine`.
- `completeAnchor()` triggers both feedback aggregation and curriculum advancement after 14 completions.
- Role safety enforcement (Seedling → Observer, Sprout ≠ Leader) is applied at runtime, not just in prompts.
- Material whitelist uses strict matching with disallowed modifiers (`sharp`, `hot`, `electric`, etc.).
- Debug routes are production-gated via `ENVIRONMENT` check.
- Legacy `confirm`/`reject` endpoints return HTTP 410.

---

## 2. Component-by-Component Audit

### A. Curriculum Spine (`spine-generator.ts` + `spine.ts`)
**Status: ✅ Complete and Functional**

| Capability | Status | Evidence |
|---|---|---|
| 3-draft parallel generation | ✅ | `generateDraft()` called 3 times with `draftIndex` variation |
| Consensus merge | ✅ | `mergeDrafts()` groups by week, checks `focusAreas` set size |
| Conflict flagging | ✅ | Divergent focus areas create `ConflictReport` entries |
| Full audit log | ✅ | `generation_log` stores complete `{drafts, conflicts}` JSON |
| Conflict resolution | ✅ | `resolveConflict()` reads `generation_log`, finds selected draft, updates `curriculum_spine` row |
| Version approval | ✅ | `approveSpine()` sets `status = 'approved'`, records `approved_by` and `approved_at` |
| Admin API routes | ✅ | Full CRUD in `spine.ts`: generate, list, conflicts, resolve, approve, entries (6 endpoints) |
| Telemetry | ✅ | Each draft call logs tokens, latency, status via `AITelemetryService` |
| Content audit | ✅ | `logContentAudit()` called after spine generation |

**Verdict:** The dashboard workflow (generate → resolve conflicts → approve) correctly populates `curriculum_spine` with approved entries. No seeding migration is needed.

### B. Arc Generator (`arc-generator.ts`)
**Status: ✅ Complete**

| Capability | Status | Evidence |
|---|---|---|
| Weekly target loading | ✅ | `getWeeklyTargets()` queries `family_curriculum_position` per subject |
| Auto-detect approved spine | ✅ | When `spine_version` is null, queries `spine_metadata` for latest approved |
| Auto-detect persistence | ✅ | Self-heals `family_curriculum_position` via `INSERT ... ON CONFLICT DO NOTHING` |
| Spine version passthrough | ✅ | `WeeklyTargets.spineVersion` carries actual version to `createUnifiedArc()` |
| Spine entry lookup | ✅ | Queries `curriculum_spine` by version + subject + week |
| Fallback to defaults | ✅ | `getDefaultTargets()` provides hardcoded targets when no spine exists |
| Unified 14-day arc generation | ✅ | Gemini call with children, targets, liturgy, books, catechism |
| Arc storage with real spine_version | ✅ | `formation_arcs.spine_version` now stores actual approved version ID |
| Child progress recording | ✅ | `recordChildProgress()` with mastery progression (3 → practicing, 6 → mastered) |
| Curriculum advancement | ✅ | `advanceCurriculumPosition()` accepts `spineVersion` parameter, UPSERT with `current_week + 1` |
| Feedback aggregation | ✅ | Schema-aligned INSERT to `anchor_feedback_summary` |

### C. Anchor Generator (`anchor-generator.ts`)
**Status: ✅ Strong with comprehensive guardrails**

| Capability | Status | Evidence |
|---|---|---|
| Cache-first pattern | ✅ | Checks `daily_anchors` for today's cached anchor before generating |
| Pre-built plan usage | ✅ | Converts arc's `daily_plans[dayInArc-1]` directly when no adjustments |
| AI generation with guardrails | ✅ | System prompt includes safety rules + material whitelist |
| Material whitelist validation | ✅ | Strict matching: exact, starts-with, ends-with, plus disallowed modifiers |
| Choking hazard detection | ✅ | Under-3 check for beads, buttons, marbles, coins, etc. |
| Sharp object detection | ✅ | Under-6 check in descriptions for knife, needle, carving, whittle |
| Role safety enforcement | ✅ | Seedlings (<24mo) forced to Observer; Sprouts (<48mo) downgraded from Leader |
| Anchor storage | ✅ | ON CONFLICT upsert with regeneration counter |
| Completion with progress sync | ✅ | Parses anchor data, extracts skills, calls `recordChildProgress()` per child |
| Auto-advance on arc completion | ✅ | Counts completed anchors; at 14, calls `aggregateFeedback()` + `advanceCurriculumPosition()` + closes arc |
| Skip tracking | ✅ | `skipAnchor()` records reason and timestamp |
| Telemetry on all paths | ✅ | Cache hits, pre-built plans, AI generations, and guardrail violations all logged |

### D. Feedback Aggregation
**Status: ✅ Fixed — schema-aligned**

The `aggregateFeedback()` method now writes to the correct columns:
```sql
INSERT INTO anchor_feedback_summary (
    id, household_id, arc_id, total_completed,
    total_skipped, avg_rating, created_at
)
```

This matches the migration `v2_0054_anchor_feedback.sql` exactly.

### E. Frontend Context Integration
**Status: ✅ Wired end-to-end**

- `/api/anchor/today` (GET) parses `weather`, `mood`, `materials` from query parameters and builds an `AnchorContext` object.
- `/api/anchor/regenerate` (POST) parses `weather`, `mood`, `materials` from the POST body alongside `adjustments`.
- `AnchorContext` flows through to `buildContextString()` which formats it for the AI prompt.

### F. Legacy Cleanup
**Status: ✅ Complete**

| Item | Status |
|---|---|
| `RhythmGenerator` import | ✅ Commented out in `family.ts` |
| `/api/rhythm/regenerate` | ✅ Returns 410 |
| `confirm`/`reject` endpoints | ✅ Return 410 |
| Debug routes gated | ✅ Production blocked via `ENVIRONMENT` check |
| `_legacy_rhythm-generator.ts` | ✅ Deleted |
| `planner.ts` | ✅ Active utility — provides `getSmartWeekStart()` used by 3 routes |

### G. Admin Dashboard & Telemetry
**Status: ✅ Complete**

| Capability | Status |
|---|---|
| AI Overview (token usage, latency, errors) | ✅ |
| Telemetry filtering by feature/date | ✅ |
| Anchor monitoring (sanitized data) | ✅ |
| Spine telemetry + conflict preview | ✅ |
| Activity domain/material analysis | ✅ |
| Spine CRUD (generate/list/resolve/approve/entries) | ✅ |
| Admin auth (API key + email allowlist) | ✅ |

---

## 3. Walkthrough Verification

| Walkthrough Claim | Audit Result |
|---|---|
| Dashboard generate → resolve → approve populates `curriculum_spine` | ✅ Confirmed |
| `resolveConflict` pulls draft data from `spine_metadata.generation_log` | ✅ Confirmed |
| `getWeeklyTargets` auto-detects latest approved spine | ✅ Confirmed |
| Auto-detected spine persisted to `family_curriculum_position` | ✅ Confirmed |
| `storeDraftSpine` logs full draft content | ✅ Confirmed |
| `completeAnchor` triggers auto-advance after 14 completions | ✅ Confirmed |
| `aggregateFeedback` writes to `anchor_feedback_summary` | ✅ Fixed — columns aligned |
| Arc `spine_version` stores actual approved version | ✅ Fixed — passthrough from targets |
| `validateSafety` enforces role constraints | ✅ Confirmed |
| Material validation uses strict whitelist | ✅ Confirmed |
| UI context controls reach anchor generator | ✅ Fixed — query/body params parsed |
| `/api/rhythm/regenerate` returns 410 | ✅ Confirmed |
| `confirm`/`reject` return 410 | ✅ Confirmed |
| Debug routes blocked in production | ✅ Confirmed |

---

## 4. Remaining Work

### Nice-to-have (optimization only — not blocking)

| # | Issue | Notes |
|---|---|---|
| 1 | Extract `getSmartWeekStart()` from `planner.ts` | Move to a utility module; `planner.ts` may contain other unused code |
| 2 | Populate `common_feedback` and `improvement_suggestions` | Migration columns exist but aggregation doesn't compute these yet — would need AI summarization |

---

## 5. Corrected Understanding

Previous audits incorrectly stated that the `curriculum_spine` table needs to be "seeded" via SQL migration. This is wrong. The Curriculum Management Dashboard provides the full workflow:

1. **Generate** — Admin selects subject, stage, week range → triggers 3-draft AI consensus → writes entries to `curriculum_spine` and metadata to `spine_metadata`
2. **Resolve** — Admin reviews conflicts where drafts disagree → selects preferred draft → `resolveConflict()` updates the canonical entry
3. **Approve** — Admin approves the version → `approveSpine()` freezes it as `status = 'approved'`

Once approved, `getWeeklyTargets()` in the arc generator automatically discovers, uses, and persists the approved spine entries. No manual SQL insertion is required.

---

## 6. Final Verdict

**Score: 9.5 / 10**

The engine is fully operational end-to-end: spine authoring via dashboard, arc generation from approved spines with real version tracking, daily anchor delivery with caching and context-awareness, completion tracking with child progress, feedback aggregation with correct schema, and auto-advancement with self-healing position records. The safety guardrails (material whitelist, age-role enforcement, debug gating) are production-grade.

The 0.5 delta represents optional enhancements (AI-powered feedback summarization, utility extraction) that do not affect correctness or completeness.
