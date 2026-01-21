# AI Context for Coding Assistants

> **Read this first before making any code changes.**

This document provides quick context for AI coding assistants (Claude, Gemini, Copilot, etc.) working on FamilyPath.

---

## What This App Is

FamilyPath is a **family formation platform** for home education. Parents add their children, and the app generates daily learning activities scaled to each child's age. The content is grounded in Reformed Christian theology.

**Core insight:** We don't teach "subjects"—we form souls. Activities are called "formations."

---

## Theological Constraints (Non-Negotiable)

1. **Authority Hierarchy:** Scripture → Parent → Curriculum → AI. The AI never overrides parental judgment.

2. **AI is a Tool, Not a Teacher:** AI may explain, summarize, and suggest. AI must NEVER:
   - Declare a child "ready" or "behind"
   - Make moral judgments about the child
   - Advance a child without parent approval
   - Generate novel theology

3. **Reformed Confessions:** Content aligns with the Westminster Standards. When in doubt, stay silent rather than innovate.

4. **Gender Formation:** Boys are trained toward Biblical masculinity; girls toward Biblical femininity. This is intentional, not accidental.

See: `/docs/AI_GOVERNANCE_AND_ETHICS.md`, `/docs/PEDAGOGICAL_PHILOSOPHY.md`

---

## Age Stages (Not Grades)

| Stage | Age | Description |
|-------|-----|-------------|
| Seedling | 0-3 | Parent-led, sensory, sung catechism |
| Sprout | 4-6 | Simple stories, paraphrased catechism |
| Sapling | 7-10 | Full catechism, chapter books, discussions |
| Tree | 11-14 | Critical thinking, source documents |
| Oak | 15-18 | Apologetics, essays, apprenticeship |

---

## Database Schema (Key Tables)

```sql
-- The atomic unit of learning
formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, guide_steps, parent_posture, liturgical_script,
  context_anchor, min_age_months, max_age_months
)

-- Age-scaled content (paraphrased catechism, etc.)
liturgy_progressions (
  id, base_item_id, stage,
  simplified_title, simplified_content, memory_portion,
  parent_teaching_note
)

-- Parent observations of child growth
evidences (
  id, student_id, formation_id, habit_stage, evidence_note
)

-- Daily/weekly formation chains
family_rhythms (
  id, parent_id, rhythm_name, anchor_time, formation_chain
)
```

---

## File Locations

| What | Where |
|------|-------|
| Frontend components | `/src/components/` |
| API routes | `/cloudflare/src/index.ts` |
| Database migrations | `/cloudflare/migrations/` |
| Book content | `/public/books/` |
| Philosophy docs | `/docs/` |

---

## Current Development Phase

**Phase 2.5: History & Liturgy Foundation**

We are building:
1. Complete WSC catechism (Q1-107) with age-stage simplifications
2. African History content with short stories for younger ages
3. World History interwoven at connection points
4. Weekly rhythm templates

See: `/docs/ROADMAP.md`

---

## Common Patterns

### Adding a Formation

```sql
INSERT INTO formations (id, title, formation_type, primary_virtue, ...)
VALUES ('unique-id', 'Title', 'liturgy|habit|skill|service|rest', 'Virtue', ...);
```

### Adding Age-Stage Progressions

```sql
INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_content, ...)
VALUES ('base-id_stage', 'base-id', 'seedling|sprout|sapling|tree|oak', 'Simplified...', ...);
```

### API Pattern

Routes are in `/cloudflare/src/index.ts`. Pattern:
```typescript
router.get('/api/endpoint', async (request, env) => {
  const db = env.DB;
  const result = await db.prepare('SELECT ...').all();
  return new Response(JSON.stringify(result));
});
```

---

## What NOT to Do

- **Don't remove theological constraints** from AI prompts
- **Don't add "grade levels"**—use age stages
- **Don't let AI make advancement decisions**—parent approval required
- **Don't add gamification** (streaks, points, leaderboards)
- **Don't add child-facing AI** without parent visibility

---

## Hackathon Context

This app is being submitted to the **Gemini 3 Hackathon** (Feb 10, 2026).

Focus areas:
- Deep Gemini integration (reasoning, multimodal)
- Age-appropriate content generation
- Reformed-theology-constrained AI

---

## Questions?

If unsure about a design decision, check:
1. `/docs/PEDAGOGICAL_PHILOSOPHY.md` - Does it align with our theology?
2. `/docs/AI_GOVERNANCE_AND_ETHICS.md` - Is the AI behaving correctly?
3. `/docs/ROADMAP.md` - Are we in the right phase for this feature?
