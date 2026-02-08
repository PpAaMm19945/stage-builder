# Codebase Judgement: Anchor Engine Audit
**Date:** 2026-02-08
**Purpose:** Full re-audit of the Spine → Arc → Anchor → Feedback pipeline. Every claim verified against source code.

---

## 1. Executive Summary

**Score: 8.7 / 10**

The pipeline is architecturally sound and further along than previous audits acknowledged. The Curriculum Management Dashboard correctly populates the `curriculum_spine` and `spine_metadata` tables through a generate → resolve → approve flow. The arc generator auto-detects approved spines. Anchor completion triggers auto-advance and feedback aggregation. Safety guardrails (material whitelist, role enforcement, debug gating) are production-grade.

Three concrete bugs prevent the last mile of end-to-end operation:

1. **Feedback aggregation schema mismatch** — code writes columns that don't exist in the migration.
2. **Arc `spine_version` is a placeholder** — set to `week_#` instead of the actual approved spine version.
3. **Frontend context not wired** — `/api/anchor/today` ignores weather/mood/materials query params.

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
| 3-draft parallel generation | ✅ | `generateDraft()` called 3 times with `draftIndex` variation (lines 81-85) |
| Consensus merge | ✅ | `mergeDrafts()` groups by week, checks `focusAreas` set size (lines 233-234) |
| Conflict flagging | ✅ | Divergent focus areas create `ConflictReport` entries (lines 248-258) |
| Full audit log | ✅ | `generation_log` stores complete `drafts` + `conflicts` JSON (line 291) |
| Conflict resolution | ✅ | `resolveConflict()` reads `generation_log`, finds selected draft, updates `curriculum_spine` row with new `focus_area`, `skill_targets`, `faith_framing`, sets `confidence = 'consensus'`, and records `manual_approval_note` (lines 340-398) |
| Version approval | ✅ | `approveSpine()` sets `status = 'approved'`, records `approved_by` and `approved_at` on both `spine_metadata` and `curriculum_spine` (lines 404-419) |
| Admin API routes | ✅ | Full CRUD in `spine.ts`: generate, list, conflicts, resolve, approve, entries (6 endpoints) |
| Telemetry | ✅ | Each draft call logs tokens, latency, status via `AITelemetryService` (lines 160-178) |
| Content audit | ✅ | `logContentAudit()` called after spine generation (lines 93-97) |

**Verdict:** The dashboard workflow (generate → resolve conflicts → approve) correctly populates `curriculum_spine` with approved entries. No seeding migration is needed.

### B. Arc Generator (`arc-generator.ts`)
**Status: ⚠️ Functional with one placeholder bug**

| Capability | Status | Evidence |
|---|---|---|
| Weekly target loading | ✅ | `getWeeklyTargets()` queries `family_curriculum_position` per subject (lines 176-179) |
| Auto-detect approved spine | ✅ | When `spine_version` is null, queries `spine_metadata` for latest approved (lines 186-197) |
| Spine entry lookup | ✅ | Queries `curriculum_spine` by version + subject + week (lines 202-207) |
| Fallback to defaults | ✅ | `getDefaultTargets()` provides hardcoded targets when no spine exists (lines 557-586) |
| Unified 14-day arc generation | ✅ | Gemini call with children, targets, liturgy, books, catechism (lines 260-384) |
| Arc storage | ✅ | `formation_arcs` INSERT with ON CONFLICT for idempotency (lines 390-404) |
| Child progress recording | ✅ | `recordChildProgress()` with mastery progression (3 practices → practicing, 6 → mastered) (lines 410-447) |
| Curriculum advancement | ✅ | `advanceCurriculumPosition()` accepts `spineVersion` parameter, UPSERT with `current_week + 1` (lines 456-465) |
| Feedback aggregation | ⚠️ | Logic exists but schema mismatch (see Section 3) |

**Bug:** Arc `spine_version` is set to `week_${targets[0].week}` (line 367) instead of the actual approved spine version string. This means the `formation_arcs.spine_version` column contains meaningless data like `week_1` instead of `v1707...`. This weakens auditability but does **not** break the pipeline because `getWeeklyTargets()` reads from `family_curriculum_position`, not from the arc itself.

**Non-persisted auto-detect:** When `getWeeklyTargets()` discovers the latest approved spine (line 194), it uses it for the current generation but does not write it back to `family_curriculum_position`. This means every arc generation repeats the lookup. Not a bug, but a missed optimization.

### C. Anchor Generator (`anchor-generator.ts`)
**Status: ✅ Strong with comprehensive guardrails**

| Capability | Status | Evidence |
|---|---|---|
| Cache-first pattern | ✅ | Checks `daily_anchors` for today's cached anchor before generating (lines 119-135) |
| Pre-built plan usage | ✅ | Converts arc's `daily_plans[dayInArc-1]` directly when no adjustments (lines 169-178) |
| AI generation with guardrails | ✅ | System prompt includes safety rules + material whitelist (lines 291-328) |
| Material whitelist validation | ✅ | Strict matching: exact, starts-with, ends-with, plus disallowed modifiers (lines 435-476) |
| Choking hazard detection | ✅ | Under-3 check for beads, buttons, marbles, coins, etc. (lines 493-501) |
| Sharp object detection | ✅ | Under-6 check in descriptions for knife, needle, carving, whittle (lines 506-513) |
| Role safety enforcement | ✅ | Seedlings (<24mo) forced to Observer; Sprouts (<48mo) downgraded from Leader (lines 516-531) |
| Anchor storage | ✅ | ON CONFLICT upsert with regeneration counter (lines 563-578) |
| Completion with progress sync | ✅ | Parses anchor data, extracts skills, calls `recordChildProgress()` per child (lines 585-641) |
| Auto-advance on arc completion | ✅ | Counts completed anchors; at 14, calls `aggregateFeedback()` + `advanceCurriculumPosition()` + closes arc (lines 643-680) |
| Skip tracking | ✅ | `skipAnchor()` records reason and timestamp (lines 686-704) |
| Telemetry on all paths | ✅ | Cache hits, pre-built plans, AI generations, and guardrail violations all logged |

**Auto-advance detail:** When 14 anchors complete, the code loops through all 4 subjects and calls `advanceCurriculumPosition()` — but only if `family_curriculum_position` already has a `spine_version` for that subject (lines 664-674). If the family has never had a position row, advancement is skipped with a warning log. This is the correct defensive behavior but means the first arc cycle must be manually initialized or the auto-detect in `getWeeklyTargets()` should persist.

### D. Feedback Aggregation
**Status: ❌ Schema mismatch — inserts will fail**

The `aggregateFeedback()` method (arc-generator.ts lines 470-518) writes:
```sql
INSERT INTO anchor_feedback_summary (
    id, household_id, arc_id, total_anchors, completed_count,
    skipped_count, average_rating, created_at
)
```

The migration (`v2_0054_anchor_feedback.sql`) defines:
```sql
CREATE TABLE anchor_feedback_summary (
    id, household_id, arc_id, week_number,
    total_completed, total_skipped, avg_rating,
    common_feedback, improvement_suggestions, created_at
)
```

**Mismatches:**
| Code column | Migration column | Status |
|---|---|---|
| `total_anchors` | *(does not exist)* | ❌ Will fail |
| `completed_count` | `total_completed` | ❌ Wrong name |
| `skipped_count` | `total_skipped` | ✅ Matches |
| `average_rating` | `avg_rating` | ❌ Wrong name |
| *(not written)* | `week_number` | ⚠️ Missing |
| *(not written)* | `common_feedback` | ⚠️ Missing |
| *(not written)* | `improvement_suggestions` | ⚠️ Missing |

The try/catch around the insert silently swallows the error (line 516-518), so this doesn't crash — but no feedback data is ever persisted.

### E. Frontend Context Integration
**Status: ❌ Not wired end-to-end**

The `AnchorContext` interface (anchor-generator.ts lines 46-52) supports `weather`, `timeAvailable`, `materialsOnHand`, `parentMood`, and `adjustments`. The `buildContextString()` method (lines 409-430) correctly formats these for the AI prompt.

However, the `/api/anchor/today` route (anchor.ts line 21) passes `undefined` as context:
```typescript
const anchor = await generator.getTodayAnchor(householdId, undefined, ...);
```

No query parameters or body fields are parsed. The frontend context controls exist in the UI but their values are discarded at the API layer.

The `/api/anchor/regenerate` route (anchor.ts lines 39-41) only reads `adjustments` from the POST body — not weather, mood, or materials.

### F. Legacy Cleanup
**Status: ⚠️ Mostly complete, one dependency remains**

| Item | Status | Evidence |
|---|---|---|
| `RhythmGenerator` import | ✅ Commented out | `family.ts` line 6: `// import { RhythmGenerator }...` |
| `/api/rhythm/regenerate` | ✅ Returns 410 | `family.ts` lines 603-606 |
| `confirm`/`reject` endpoints | ✅ Return 410 | `ai.ts` lines 115-121 |
| Debug routes gated | ✅ Production blocked | `debug.ts` lines 14-17: `ENVIRONMENT === 'production'` check |
| `_legacy_rhythm-generator.ts` file | ⚠️ Still exists | File present in `cloudflare/src/ai/` directory |
| `planner.ts` | ⚠️ Still actively used | Imported by `family.ts`, `profile.ts`, `reports.ts` for `getSmartWeekStart()` |

`planner.ts` cannot be deleted — it provides `getSmartWeekStart()` used by 3 route files. This is not legacy; it's active utility code. The function should be extracted to a utils module if `planner.ts` contains other unused code.

`_legacy_rhythm-generator.ts` is no longer imported anywhere and can be safely deleted.

### G. Admin Dashboard & Telemetry
**Status: ✅ Complete**

| Capability | Status |
|---|---|
| AI Overview (token usage, latency, errors) | ✅ `admin-ai.ts` lines 35-63 |
| Telemetry filtering by feature/date | ✅ `admin-ai.ts` lines 70-110 |
| Anchor monitoring (sanitized data) | ✅ `admin-ai.ts` lines 116-169 |
| Spine telemetry + conflict preview | ✅ `admin-ai.ts` lines 175-218 |
| Activity domain/material analysis | ✅ `admin-ai.ts` lines 224-272 |
| Spine CRUD (generate/list/resolve/approve/entries) | ✅ `spine.ts` (6 endpoints) |
| Admin auth (API key + email allowlist) | ✅ `admin-ai.ts` lines 8-29 |

---

## 3. Walkthrough Verification

| Walkthrough Claim | Audit Result | Evidence |
|---|---|---|
| Dashboard generate → resolve → approve populates `curriculum_spine` | ✅ Confirmed | `generateSpine()` inserts entries, `resolveConflict()` updates them, `approveSpine()` freezes them |
| `resolveConflict` pulls draft data from `spine_metadata.generation_log` | ✅ Confirmed | Reads `generation_log`, finds draft by `draft_id`, finds entry by `week_number`, updates `curriculum_spine` (lines 349-396) |
| `getWeeklyTargets` auto-detects latest approved spine | ✅ Confirmed | Queries `spine_metadata WHERE status = 'approved'` when `spine_version` is null (lines 186-197) |
| `storeDraftSpine` logs full draft content | ✅ Confirmed | `generation_log` stores full `{drafts, conflicts}` JSON (line 291) |
| `completeAnchor` triggers auto-advance after 14 completions | ✅ Confirmed | Counts completed anchors, calls `aggregateFeedback()` + `advanceCurriculumPosition()` + closes arc (lines 643-680) |
| `aggregateFeedback` writes to `anchor_feedback_summary` | ❌ Schema mismatch | Code columns don't match migration columns (see Section 2D) |
| `validateSafety` enforces role constraints | ✅ Confirmed | Seedlings → Observer, Sprouts ≠ Leader (lines 516-531) |
| Material validation uses strict whitelist | ✅ Confirmed | Disallowed modifiers + exact/starts-with/ends-with matching (lines 435-476) |
| UI context controls reach anchor generator | ❌ Not wired | `/api/anchor/today` passes `undefined` context (anchor.ts line 21) |
| `/api/rhythm/regenerate` returns 410 | ✅ Confirmed | family.ts line 606 |
| `confirm`/`reject` return 410 | ✅ Confirmed | ai.ts lines 116-120 |
| Debug routes blocked in production | ✅ Confirmed | debug.ts lines 14-17 |

---

## 4. Remaining Work

### Critical (pipeline correctness)

| # | Issue | Fix | Complexity |
|---|---|---|---|
| 1 | Feedback aggregation schema mismatch | Align `aggregateFeedback()` INSERT columns to match migration: `total_anchors` → remove, `completed_count` → `total_completed`, `average_rating` → `avg_rating` | Low |
| 2 | Arc `spine_version` is `week_#` placeholder | In `createUnifiedArc()`, capture the actual spine version from `getWeeklyTargets()` return and use it instead of `week_${targets[0].week}` | Low |

### Important (completeness)

| # | Issue | Fix | Complexity |
|---|---|---|---|
| 3 | Frontend context not passed to anchor API | Parse `weather`, `mood`, `materials` from query params in `/api/anchor/today` and pass as `AnchorContext` | Low |
| 4 | Auto-detected spine version not persisted | When `getWeeklyTargets()` discovers an approved spine, write it to `family_curriculum_position` so first-cycle families get a position row | Low |
| 5 | Delete `_legacy_rhythm-generator.ts` | File is no longer imported anywhere — safe to delete | Trivial |

### Nice-to-have (optimization)

| # | Issue | Notes |
|---|---|---|
| 6 | Extract `getSmartWeekStart()` from `planner.ts` | Move to a utility module; `planner.ts` may contain other unused code |
| 7 | Populate `common_feedback` and `improvement_suggestions` | Migration columns exist but aggregation doesn't compute these yet |

---

## 5. Corrected Understanding

Previous audits incorrectly stated that the `curriculum_spine` table needs to be "seeded" via SQL migration. This is wrong. The Curriculum Management Dashboard provides the full workflow:

1. **Generate** — Admin selects subject, stage, week range → triggers 3-draft AI consensus → writes entries to `curriculum_spine` and metadata to `spine_metadata`
2. **Resolve** — Admin reviews conflicts where drafts disagree → selects preferred draft → `resolveConflict()` updates the canonical entry
3. **Approve** — Admin approves the version → `approveSpine()` freezes it as `status = 'approved'`

Once approved, `getWeeklyTargets()` in the arc generator automatically discovers and uses the approved spine entries. No manual SQL insertion is required.

---

## 6. Final Verdict

**Score: 8.7 / 10**

The engine is operationally complete for the core loop: spine authoring via dashboard, arc generation from approved spines, daily anchor delivery with caching, completion tracking with child progress, and auto-advancement. The safety guardrails (material whitelist, age-role enforcement, debug gating) are production-grade.

The delta to 9.5 is small and mechanical:
- Fix 3 column names in one INSERT statement (feedback schema)
- Pass one variable through instead of a placeholder (arc spine_version)
- Read query params in one route handler (context wiring)
- Delete one file (legacy rhythm generator)

No architectural changes needed. No new tables. No new AI calls. Just wiring corrections.
