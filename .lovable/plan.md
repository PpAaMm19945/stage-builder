

# Fix the Spine-Arc-Anchor Chain for End-to-End Continuity

## Problems Found

1. **Stale `african_history` references**: The arc generator prompt and anchor advancement loop still reference `african_history` instead of `motor` (the new spine subject).
2. **Missing `motor` defaults**: No fallback targets for `motor` in the arc generator, and auto-advance skips it.
3. **No stage transition logic**: When a family finishes week 52 of "sprout," the system just goes to week 53 (which doesn't exist). There's no mechanism to move them to "sapling" week 1.
4. **Arc advances only 1 week instead of 2**: A 14-day arc covers 2 weeks of spine content, but `advanceCurriculumPosition` only increments by 1.
5. **Arc system prompt mentions "African History"** in subject weighting but should reference "Motor Skills."

## Fixes

### Fix 1: Update subject lists everywhere

**File: `cloudflare/src/ai/arc-generator.ts`**

- Line 172: Already correct (`['literacy', 'numeracy', 'formation', 'motor']`)
- Line 291-295: Change the system prompt's SUBJECT WEIGHTING section:
  - Remove: `- African History: 1-2x/week (stories, heritage connections)`
  - Add: `- Motor Skills: 2-3x/week (gross motor, fine motor, pre-writing)`
- Lines 568-597 (`getDefaultTargets`): Replace the `african_history` entry with a `motor` entry:
  ```
  motor: { subject: 'motor', week, focus_area: 'motor_development',
           skill_targets: ['gross_motor', 'fine_motor', 'coordination'] }
  ```

**File: `cloudflare/src/ai/anchor-generator.ts`**

- Line 676: Change `['literacy', 'numeracy', 'formation', 'african_history']` to `['literacy', 'numeracy', 'formation', 'motor']`

### Fix 2: Advance by 2 weeks (not 1)

**File: `cloudflare/src/ai/arc-generator.ts`**

- `advanceCurriculumPosition` (line 468-477): Change the SQL from `current_week + 1` to `current_week + 2` since each arc covers 2 weeks of spine content.

### Fix 3: Add stage transition logic

**File: `cloudflare/src/ai/arc-generator.ts`**

- In `advanceCurriculumPosition`, after incrementing the week, check if the new week exceeds 52. If it does:
  - Determine the next stage (seedling->sprout->sapling->tree)
  - Reset `current_week` to 1
  - Update `spine_version` to point to the next stage's approved spine (if one exists)
  - If no next-stage spine exists, log a warning but keep the position at week 52 (don't advance into a void)

- In `getWeeklyTargets`, after fetching the spine entry, if no entry is found for the current week AND the week is greater than 52, attempt to auto-transition by looking up the next stage's spine.

Logic summary:
```text
advanceCurriculumPosition(household, subject, spineVersion):
  new_week = current_week + 2
  if new_week > 52:
    current_stage = lookup stage from spine_version
    next_stage = seedling->sprout->sapling->tree
    next_spine = find approved spine for (subject, next_stage)
    if next_spine exists:
      set current_week = 1, spine_version = next_spine
    else:
      cap at week 52 (stay put, admin needs to generate next stage)
  else:
    set current_week = new_week
```

### Fix 4: Add `motor` to the anchor generator's activity domain list

**File: `cloudflare/src/ai/anchor-generator.ts`**

- Line 319 in the system prompt schema already lists `motor` as a valid `skill_domain` -- this is correct, no change needed.

## Files to Change

| File | Changes |
|------|---------|
| `cloudflare/src/ai/arc-generator.ts` | Fix system prompt subjects, fix `getDefaultTargets`, fix `advanceCurriculumPosition` to +2 and handle stage transitions |
| `cloudflare/src/ai/anchor-generator.ts` | Fix advancement subject list from `african_history` to `motor` |

## What This Enables

After these fixes, a family's journey looks like this:

```text
Week 1 (Sprout) --> Spine targets fed to Arc --> 14 daily anchors
                                                   |
                                            Complete all 14
                                                   |
                                            Advance to Week 3
                                                   |
Week 3 (Sprout) --> Next Arc --> ... --> Week 51 --> Complete --> Week 53?
                                                                    |
                                                              Auto-transition
                                                                    |
                                                          Sapling, Week 1
                                                          (if spine exists)
```

Each year (52 weeks) maps to roughly 26 arcs (each arc = 2 weeks). Completing all arcs in a stage automatically transitions to the next stage's spine.
