
# Fix: D1_TYPE_ERROR from undefined arc ID

## Root Cause

The error `D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'` happens because `activeArc.id` is `undefined` when passed to `storeAnchor`.

Here's why: `getActiveArc()` in `arc-generator.ts` (line 660) does `return JSON.parse(result.arc_data)` -- it returns ONLY the parsed JSON blob. If the stored `arc_data` JSON doesn't contain an `id` field (e.g., from an older generation run, or if the AI response didn't include one), then `activeArc.id` is `undefined`.

When `storeAnchor` tries to bind this `undefined` value to the SQL INSERT, D1 throws the type error.

The fix: `getActiveArc()` should always merge the DB row's `id` into the returned object, since the `id` column always exists on the `formation_arcs` table row.

## Changes

### 1. Fix `getActiveArc` to include DB row ID (arc-generator.ts)

**File:** `cloudflare/src/ai/arc-generator.ts` (lines 650-665)

Change from:
```typescript
async getActiveArc(householdId: string): Promise<FormationArc | null> {
    const result = await safeQueryFirst<any>(
        this.db,
        "SELECT * FROM formation_arcs WHERE household_id = ? AND status = 'active' ORDER BY arc_start_date DESC",
        [householdId]
    );
    if (!result) return null;
    try {
        return JSON.parse(result.arc_data);
    } catch {
        console.error('[ArcGenerator] Failed to parse stored arc');
        return null;
    }
}
```

To:
```typescript
async getActiveArc(householdId: string): Promise<FormationArc | null> {
    const result = await safeQueryFirst<any>(
        this.db,
        "SELECT * FROM formation_arcs WHERE household_id = ? AND status = 'active' ORDER BY arc_start_date DESC",
        [householdId]
    );
    if (!result) return null;
    try {
        const arc = JSON.parse(result.arc_data);
        // Ensure DB row fields are always present (arc_data JSON may not have them)
        arc.id = arc.id || result.id;
        arc.household_id = arc.household_id || result.household_id;
        arc.arc_start_date = arc.arc_start_date || result.arc_start_date;
        return arc;
    } catch {
        console.error('[ArcGenerator] Failed to parse stored arc');
        return null;
    }
}
```

This ensures `activeArc.id` is never undefined, regardless of what's in the JSON blob.

### 2. Add null-guard in storeAnchor (anchor-generator.ts)

**File:** `cloudflare/src/ai/anchor-generator.ts` (line 640-654)

Add a fallback for `arcId` to prevent `undefined` from ever reaching D1:

```typescript
private async storeAnchor(householdId: string, arcId: string, date: string, anchor: DailyAnchor): Promise<void> {
    const generationReasoning = anchor.reasoning ?? 'Generated anchor';
    const safeArcId = arcId || 'unknown';  // Prevent undefined from reaching D1
    // ... rest unchanged, use safeArcId in bind params
```

## Files Changed

1. `cloudflare/src/ai/arc-generator.ts` -- Merge DB row `id` into parsed arc object
2. `cloudflare/src/ai/anchor-generator.ts` -- Null-guard on `arcId` bind parameter

## Impact

- Fixes the 500 error on `/api/anchor/today`
- Prevents `undefined` from ever reaching D1 bind parameters
- No schema changes needed
