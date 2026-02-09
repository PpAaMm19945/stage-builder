

# Audit: Issues Found in the Spine-Arc-Anchor Pipeline

After reading every file in the chain, here is what will break or waste tokens, and the fixes needed.

---

## Issue 1: Stage Transition Logic Will ALWAYS Fall Back to "sprout" (Critical)

**The bug:** `getStageFromSpineVersion()` in `arc-generator.ts` (line 524-535) tries to extract the stage by checking if the version string contains "seedling", "sprout", etc. But `spine-generator.ts` generates versions as `v${Date.now()}` (e.g., `v1707500000000`). That string never contains a stage name, so every lookup returns the default `'sprout'`.

This means stage transitions will never work correctly. A family finishing Seedling will look for "the next stage after sprout" instead of "the next stage after seedling."

**Fix:** Query the `curriculum_spine` table directly to get the stage for a given `spine_version`:

```sql
SELECT DISTINCT stage FROM curriculum_spine WHERE spine_version = ? LIMIT 1
```

Replace the string-parsing logic entirely.

---

## Issue 2: Next-Stage Spine Lookup Will Never Match (Critical)

**The bug:** `advanceCurriculumPosition()` (line 485-491) searches for the next stage's spine with:

```sql
WHERE sm.spine_version LIKE '%sprout%'
```

But again, spine versions are timestamps (`v1707500000000`), never containing stage names. This query will always return zero results, so families will always cap at week 52 and never transition.

**Fix:** Look up the next spine by joining `curriculum_spine` to find versions that actually contain entries for the target stage:

```sql
SELECT sm.spine_version FROM spine_metadata sm
JOIN curriculum_spine cs ON cs.spine_version = sm.spine_version
WHERE sm.status = 'approved' AND cs.subject = ? AND cs.stage = ?
ORDER BY sm.approved_at DESC LIMIT 1
```

---

## Issue 3: Arc Prompt Doesn't Send Children's Stages to the AI (Minor)

**The problem:** The arc system prompt explains stages and says "assign roles based on these," but the `childrenSummary` in the user prompt already includes each child's `stage`. This is fine. However, the prompt does NOT tell the AI which spine week it's on or what the progression target is in a human-readable way. The AI gets a JSON blob like `{"subject":"literacy","week":15,"focus":"phonics_cvc_words","skills":["blending","segmenting"]}` but no sentence explaining "This family is 15 weeks into their literacy journey, currently learning CVC blending."

**Fix:** Add a one-line natural-language summary before the JSON targets so the AI has better context for creating a coherent 2-week plan.

---

## Issue 4: Books Have No `series` Field in `BOOKS_DATA` (Minor Data Gap)

**The problem:** The arc generator filters out draft series using `b.path.split('/')[2]`, which works. But `BookData` in `data.ts` doesn't have a `series` field populated — books like "Athanasius" just have `"series": undefined` (the interface has it, but the generated data doesn't populate it). The `extractSeriesFromBook` in anchor-generator.ts falls back to `'library'` for all books.

This is cosmetic (doesn't break anything) but means the anchor's `book_nook.series` field is always "library."

**Fix:** The `BOOKS_DATA` generator script should extract the series from the path. Low priority — no runtime impact.

---

## Issue 5: `BOOKS_DATA` Missing `series` Property in Generated Data

Looking at the generated `BOOKS_DATA`, each entry is missing the `series` property even though `BookData` interface requires it. The data was auto-generated and this field was omitted. Since arc-generator uses `b.path.split('/')[2]` to filter draft series, this works at runtime, but TypeScript would flag it if strict checks were enabled.

**Fix:** Add `series` to the generated book entries or make it optional in the interface. Low priority.

---

## Issue 6: Database Schema vs. Code Column Mismatch (Potential)

The `daily_anchors` table (migration v2_0051) has columns: `id, household_id, arc_id, anchor_date, anchor_data, generation_reasoning, regeneration_count, status, created_at`. The feedback migration (v2_0054) adds: `completion_feedback, completed_at, skipped_at, skip_reason`.

The `AnchorDbRecord` type references all these columns. This is correct. No mismatch found.

The `curriculum_spine` table has `confidence` and `source_citations` columns from the original migration (v2_0052). The new code writes `'standard'` to `confidence` and doesn't write `source_citations` (it's nullable). This is fine — no schema mismatch.

---

## Issue 7: `formation_arcs` Table Missing `spine_version` in Primary Migration

Migration v2_0050 creates `formation_arcs` without `spine_version`. Migration v2_0052 adds it via `ALTER TABLE formation_arcs ADD COLUMN spine_version TEXT`. The code writes to this column. This should work if migrations run in order. Verified: migration numbering is sequential (0050, 0051, 0052). No issue.

---

## Summary of Changes Needed

| Issue | Severity | File | Fix |
|-------|----------|------|-----|
| 1. Stage lookup parses timestamp string | **Critical** | `arc-generator.ts` line 524-535 | Query `curriculum_spine` table for stage |
| 2. Next-spine lookup uses LIKE on timestamp | **Critical** | `arc-generator.ts` line 485-491 | Join `curriculum_spine` to find stage-matched versions |
| 3. Arc prompt lacks human-readable context | Low | `arc-generator.ts` line 336-352 | Add summary sentence to user prompt |
| 4-5. Books missing series field | Low | `data.ts` / generator script | Cosmetic, no runtime break |

Only issues 1 and 2 need fixing before testing. They are both in `arc-generator.ts` and affect the same method (`advanceCurriculumPosition` and `getStageFromSpineVersion`).

