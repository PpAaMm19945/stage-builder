

# Plan: Fix All Remaining Issues to 9.5/10

Based on the JUDGEMENT.md analysis, there are **5 concrete fixes** remaining. The legacy file deletion is already done. Here is the exact work.

---

## Fix 1: Feedback Aggregation Schema Mismatch (Critical)

**File:** `cloudflare/src/ai/arc-generator.ts` (lines 501-514)

The INSERT statement uses column names that don't match the migration. This causes silent failures -- no feedback data is ever saved.

| Current (wrong) | Migration (correct) |
|---|---|
| `total_anchors` | remove -- no such column |
| `completed_count` | `total_completed` |
| `skipped_count` | `total_skipped` (already correct) |
| `average_rating` | `avg_rating` |

**Change:** Rewrite the INSERT to:
```sql
INSERT INTO anchor_feedback_summary (
    id, household_id, arc_id, total_completed,
    total_skipped, avg_rating, created_at
) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
```

Remove the `total` parameter from the values array (6 params instead of 7).

---

## Fix 2: Arc `spine_version` Placeholder (Critical)

**File:** `cloudflare/src/ai/arc-generator.ts` (line 367)

Currently: `spine_version: targets[0]?.week ? \`week_\${targets[0].week}\` : 'default'`

This stores meaningless strings like `week_1`. The fix is to pass the resolved `spineVersion` through from `getWeeklyTargets()`.

**Changes:**
1. Add `spineVersion?: string` to the `WeeklyTargets` interface (line ~72 area)
2. In `getWeeklyTargets()`, include the resolved `spineVersion` in each target object pushed to the array
3. In `createUnifiedArc()`, extract the first non-null spine version from targets and use it:
   ```typescript
   spine_version: targets.find(t => t.spineVersion)?.spineVersion || 'default'
   ```

---

## Fix 3: Frontend Context Wiring (Important)

**File:** `cloudflare/src/routes/anchor.ts` (lines 9-28)

The `/api/anchor/today` route passes `undefined` as context. The `AnchorContext` interface already supports `weather`, `parentMood`, `materialsOnHand`, and `timeAvailable`.

**Change:** Parse query parameters and build a context object:
```typescript
const weather = c.req.query('weather');
const mood = c.req.query('mood');
const materials = c.req.query('materials');
const context = (weather || mood || materials) ? {
    weather,
    parentMood: mood,
    materialsOnHand: materials?.split(','),
} : undefined;

const anchor = await generator.getTodayAnchor(householdId, context, ...);
```

Also update `/api/anchor/regenerate` (lines 30-50) to parse `weather`, `mood`, `materials` from the POST body alongside `adjustments`.

---

## Fix 4: Auto-Detect Spine Persistence (Important)

**File:** `cloudflare/src/ai/arc-generator.ts` (lines 194-197)

When `getWeeklyTargets()` auto-detects the latest approved spine for a new family, it currently discards the discovery with a comment "allow it to be dynamic for now." This means the auto-advance check (anchor-generator.ts line 669) will skip advancement because no `spine_version` exists in `family_curriculum_position`.

**Change:** Replace the comment with a self-healing write:
```typescript
if (latestSpine) {
    spineVersion = latestSpine.spine_version;
    // Self-heal: persist so auto-advance works later
    await safeRun(this.db, `
        INSERT INTO family_curriculum_position (id, household_id, subject, current_week, spine_version)
        VALUES (?, ?, ?, 1, ?)
        ON CONFLICT(household_id, subject) DO NOTHING
    `, [crypto.randomUUID(), householdId, subject, spineVersion]);
}
```

The `ON CONFLICT DO NOTHING` ensures this only seeds the first time.

---

## Fix 5: Update JUDGEMENT.md (Final)

After all fixes are applied, update JUDGEMENT.md:
- Mark all 5 critical/important items as resolved
- Note that `_legacy_rhythm-generator.ts` is already deleted (confirmed: not in file listing)
- Keep `planner.ts` / `getSmartWeekStart()` extraction as a nice-to-have (it is active utility code used by 3 routes)
- Adjust score to **9.5 / 10**

---

## Summary

| # | Fix | File | Complexity |
|---|-----|------|------------|
| 1 | Feedback schema column names | `arc-generator.ts` | Low (rename 3 columns, remove 1 param) |
| 2 | Arc spine_version from targets | `arc-generator.ts` | Low (add field to interface, pass through) |
| 3 | Context query params in anchor route | `anchor.ts` | Low (parse 3 query params) |
| 4 | Persist auto-detected spine version | `arc-generator.ts` | Low (add one INSERT) |
| 5 | Update JUDGEMENT.md | `JUDGEMENT.md` | Trivial |

**Total: 2 files changed + 1 doc updated. No new tables, no new dependencies, no architectural changes.**

