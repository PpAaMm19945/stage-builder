

# Wire the Seeded Curriculum Spine into the Backend

## Context

The 9 migration files (v2_0055 through v2_0064) are already generated and sitting in `cloudflare/migrations/`. The data is structurally correct: 832 rows, cycling catechism (1-130), cycling hymns (1-56), scripture refs from proof texts. The next step is making sure the backend code can read and use the new columns.

## Changes Required

### 1. Update `SpineRecord` type to include new columns

**File:** `cloudflare/src/ai/types.ts` (line 230-244)

Add the three new fields to the interface:

```typescript
export interface SpineRecord {
    id: string;
    spine_version: string;
    subject: string;
    week_number: number;
    stage: string;
    focus_area: string;
    skill_targets: string;
    faith_framing?: string;
    resources?: string;
    confidence: string;
    source_citations?: string;
    approved_by?: string;
    approved_at?: string;
    catechism_q?: number;      // NEW
    hymn_number?: number;      // NEW
    scripture_ref?: string;    // NEW
}
```

### 2. Wire spine liturgy data into arc generator

**File:** `cloudflare/src/ai/arc-generator.ts`

Currently, the arc generator fetches liturgy position separately from `family_profiles` (line 238-262) and uses only 5 hardcoded hymns. After seeding, each spine entry already carries `catechism_q`, `hymn_number`, and `scripture_ref`. The arc generator should prefer these values from the spine when available.

In `getWeeklyTargets` (around line 216-229), when a `spineEntry` is found, include the theological anchors in the targets:

```typescript
if (spineEntry) {
    targets.push({
        subject,
        week: currentWeek,
        focus_area: spineEntry.focus_area,
        skill_targets: JSON.parse(spineEntry.skill_targets || '[]'),
        faith_framing: spineEntry.faith_framing,
        spineVersion: spineVersion || undefined,
        catechism_q: spineEntry.catechism_q,
        hymn_number: spineEntry.hymn_number,
        scripture_ref: spineEntry.scripture_ref
    });
}
```

Update the `WeeklyTargets` interface to include these optional fields.

In `createUnifiedArc`, use the spine's catechism/hymn data to override the family_profiles-based liturgy position, so the AI prompt gets the spine-directed theological anchors rather than the family's generic position counter.

### 3. Expose new columns in spine API response

**File:** `cloudflare/src/routes/spine.ts` (line 134-143)

Add the three new fields to the entries response so the admin UI can display them:

```typescript
entries: (result.results || []).map((row: any) => ({
    id: row.id,
    subject: row.subject,
    weekNumber: row.week_number,
    stage: row.stage,
    focusArea: row.focus_area,
    skillTargets: JSON.parse(row.skill_targets || '[]'),
    faithFraming: row.faith_framing,
    approvedBy: row.approved_by,
    catechismQ: row.catechism_q,       // NEW
    hymnNumber: row.hymn_number,       // NEW
    scriptureRef: row.scripture_ref    // NEW
}))
```

### 4. Clean up: delete the generator script (optional)

**File:** `scripts/generate_spine_seeds.cjs`

This script has served its purpose. It can be deleted or kept for reference. No code depends on it.

---

## What This Does NOT Change

- The migration files themselves -- they are ready to apply as-is
- The admin UI -- that is a separate future task for browsing/filtering/regenerating
- The anchor generator -- it already reads from arcs which read from the spine

## Applying the Migrations

After these code changes, you apply the migrations to D1 in order:

```bash
wrangler d1 migrations apply DB --remote
```

This will run v2_0055 (schema update) first, then v2_0056-v2_0063 (seed data), then v2_0064 (metadata).

