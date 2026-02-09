

# Fix: Anchor Generator Querying Non-Existent Columns

## The Problem

The `/api/anchor/today` endpoint is failing with `D1_ERROR: no such column: age_months` because `anchor-generator.ts` (line 296-299) runs:

```sql
SELECT id, name, age_months, stage FROM students WHERE household_id = ?
```

But the `students` table has **no** `age_months` or `stage` columns. It only has `date_of_birth`. This is the root cause of every 500 error on page load.

The sibling file `arc-generator.ts` does this correctly -- it selects `date_of_birth` and computes `age_months` and `stage` in JavaScript.

## The Fix

**File: `cloudflare/src/ai/anchor-generator.ts`** (lines 295-305)

1. Change the SQL query from selecting `age_months, stage` to selecting `id, name, date_of_birth`
2. Add a helper function to calculate age in months from `date_of_birth` (same logic as `arc-generator.ts`)
3. Add a helper to determine stage from age (same as `arc-generator.ts`)
4. Map the raw DB results to compute `age_months` and `stage` in code

Before:
```typescript
const children = await safeQuery<{ id: string; name: string; age_months: number; stage: string }>(
    this.db,
    "SELECT id, name, age_months, stage FROM students WHERE household_id = ?",
    [householdId]
);
```

After:
```typescript
const rawChildren = await safeQuery<{ id: string; name: string; date_of_birth: string }>(
    this.db,
    "SELECT id, name, date_of_birth FROM students WHERE household_id = ?",
    [householdId]
);
const children = (rawChildren.results || []).map(c => {
    const ageMonths = this.calculateAgeMonths(c.date_of_birth);
    return { id: c.id, name: c.name, age_months: ageMonths, stage: this.determineStage(ageMonths) };
});
```

Add two private helper methods to the `AnchorGenerator` class (matching arc-generator's logic):

```typescript
private calculateAgeMonths(dob: string): number {
    const birth = new Date(dob);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

private determineStage(ageMonths: number): string {
    if (ageMonths < 24) return 'seedling';
    if (ageMonths < 48) return 'sprout';
    if (ageMonths < 96) return 'sapling';
    return 'tree';
}
```

Also update the `childrenStr` builder (line 303-304) to use the mapped results -- no change needed there since the mapped objects still have `age_months` and `stage`.

## Files Changed

1. `cloudflare/src/ai/anchor-generator.ts` -- Fix the SQL query, add helper methods

## Impact

- Fixes the 500 error on every page load
- Stops burning AI tokens on failed requests
- No schema changes needed -- this is purely a backend code fix
- The retry button we added in the last change will work once this is deployed
