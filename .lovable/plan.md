

# Simplify the Spine Generator: From "Curriculum Creator" to "Sequence Retriever"

## The Problem

The current spine generator treats standard educational milestones (counting to 5, rhyme recognition) as if they were complex philosophical debates requiring 3 AI drafts and human conflict resolution. This wastes tokens, adds complexity, and doesn't improve quality -- because what a 3-year-old needs to learn is well-established knowledge, not an opinion.

## The New Mental Model

```text
BEFORE (over-engineered):
  Admin clicks "Generate" --> 3 parallel AI calls --> Code merges drafts --> Admin resolves conflicts --> Approve

AFTER (simple & correct):
  Admin picks Subject + Stage + Year --> 1 AI call retrieves standard sequence --> Admin reviews table --> Approve
```

History and Bible are handled through your picture books, not the spine. The spine only covers **developmental skills**: Literacy, Numeracy, Motor, and Formation (character/habits).

## What Changes

### 1. Backend: `spine-generator.ts`

**Delete:** The entire `mergeDrafts()` method, 3-draft loop, `ConflictReport` interface, `SpineDraft` interface, and `resolveConflict()` method.

**Replace with:** A single `generateStandardSequence()` method that makes ONE AI call with this system prompt:

```
You are an expert Early Childhood Curriculum Planner.
Output a standard, research-backed scope and sequence for [Subject] 
for a child at [Stage].
Output a linear weekly progression. Do not invent new pedagogies; 
use standard developmental norms.
For Literacy: Phonological Awareness -> Phonics -> Fluency.
For Numeracy: Rote counting -> 1-to-1 correspondence -> Number recognition -> Simple operations.
For Motor: Gross motor -> Fine motor -> Pre-writing.
For Formation: Obedience -> Kindness -> Self-control -> Gratitude.
```

**Simplified `SpineEntry`** -- remove `confidence`, `source_citations`, `draft_id`. Keep: `subject`, `week_number`, `stage`, `focus_area`, `skill_targets`, `faith_framing`.

**Flow:** Generate -> store as "draft" -> admin reviews the table -> clicks "Approve" -> frozen.

### 2. Backend: `spine.ts` (routes)

Remove the `/conflicts`, `/resolve` endpoints. Keep only:
- `POST /generate` (simplified -- one call, no drafts)
- `GET /list` (versions and status)
- `GET /entries` (view a version's weeks)
- `POST /approve` (freeze a version)

### 3. Frontend: Admin Spine UI

**Delete:** `ConflictResolver.tsx` entirely.

**Simplify `SpineManager.tsx`:** Remove the "resolve" view. Only 3 views: list, generate, view.

**Simplify `SpineGenerationForm.tsx`:** Keep as-is (subject, stage, start/end week, generate button). Remove "3 Drafts" messaging -- change to "Generating standard sequence..."

**Simplify `SpineList.tsx`:** Remove "Review Conflicts" button and conflict column. Just show: Version, Subject, Status, Weeks, View, Approve.

**Keep `SpineViewer.tsx`:** Remove the "confidence" badge column (no longer relevant). Otherwise works as-is.

### 4. Subjects Covered by Spine

| Subject | Spine handles? | Notes |
|---------|---------------|-------|
| Literacy | Yes | Standard phonics/reading progression |
| Numeracy | Yes | Standard math progression |
| Formation | Yes | Character virtues sequence |
| Motor Skills | Yes (new) | Gross/fine motor, pre-writing |
| History | No | Delivered through picture books |
| Bible | No | Delivered through picture books + liturgy |

The `african_history` subject type is removed from the spine. History/Bible content comes from the book library and liturgy, which the Arc Generator already handles.

### 5. Arc Generator Adjustment

`getWeeklyTargets()` in `arc-generator.ts` currently loops over 4 subjects including `african_history`. Update to only query spine for `literacy`, `numeracy`, `formation`, and `motor`. History/Bible content continues to come from the book list and liturgy position (already working).

### 6. What This Means for Google AI Studio Testing

Only **1 AI call** needed per test instead of 3+merge. The test prompt becomes:

```
Create a Standard Scope & Sequence for:
- Subject: Numeracy
- Stage: Sprout (2-4 years)  
- Duration: 52 weeks (Year 1)

Output JSON: [{ "week": 1, "focus_area": "...", "skill_targets": ["...", "..."], "faith_framing": "..." }]
```

If the output looks like a sensible progression (Week 1: counting to 3, Week 5: counting to 10, etc.), it works. That sequence becomes the truth your app follows.

## Files to Change

| File | Action |
|------|--------|
| `cloudflare/src/ai/spine-generator.ts` | Major refactor -- delete drafts/merge/conflicts, replace with single call |
| `cloudflare/src/routes/spine.ts` | Remove conflict/resolve routes |
| `cloudflare/src/ai/arc-generator.ts` | Update subject list, remove `african_history` from spine queries |
| `src/components/admin/spine/ConflictResolver.tsx` | Delete |
| `src/components/admin/spine/SpineManager.tsx` | Remove "resolve" view |
| `src/components/admin/spine/SpineGenerationForm.tsx` | Update messaging |
| `src/components/admin/spine/SpineList.tsx` | Remove conflict column/buttons |
| `src/components/admin/spine/SpineViewer.tsx` | Remove confidence badge |

