---
version: "1.0"
last_updated: "2025-01-03"
derived_from: "PRODUCT_VISION.md, PEDAGOGICAL_PHILOSOPHY.md"
---

# Development Roadmap

## Table of Contents
1. [Guiding Rule](#1-guiding-rule)
2. [Phase 0: Constitutional (Current)](#2-phase-0-constitutional-current)
3. [Phase 1: Faithful Minimum](#3-phase-1-faithful-minimum)
4. [Phase 2: Order and Visibility](#4-phase-2-order-and-visibility)
5. [Phase 3: Graduated Independence](#5-phase-3-graduated-independence)
6. [Phase 4: Pace Flexibility](#6-phase-4-pace-flexibility)
7. [Phase 5: Earning While Learning](#7-phase-5-earning-while-learning)
8. [Phase 6: Maturity and Irrelevance](#8-phase-6-maturity-and-irrelevance)
9. [How to Use This Roadmap](#9-how-to-use-this-roadmap)

---

## 1. Guiding Rule

> **Every phase must be usable, honest, and faithful on its own.**
> No phase may require future features to justify its existence.

If development stopped at any phase, the platform should still:
- Help families
- Not mislead users
- Not contradict Scripture
- Not train dependency

---

## 2. Phase 0: Constitutional (Current)

**Goal:** Lock theology, authority, and language before more software.

### ✅ Completed Outcomes
- [x] `PEDAGOGICAL_PHILOSOPHY.md` finalized and committed
- [x] `AI_GOVERNANCE_AND_ETHICS.md` written
- [x] Authority hierarchy codified (Parent > Curriculum > AI)
- [x] `SCOPE_AND_SEQUENCE.md` defined
- [x] `ASSESSMENT_AND_RECORDS.md` established
- [x] `CATECHISM_AND_LITURGY_GUIDE.md` created
- [x] Legal documents updated with covenantal language
- [x] `PROMPT_MASTER_PEDAGOGY.md` for AI agents

### Why This Phase Matters
This phase prevents:
- Feature drift
- Secular defaults creeping in
- "Just add X" pressure later

> Nothing else gets built without passing through this filter.

**Exit Criteria:** ✅ COMPLETE
You can point to a document and say, "If a feature contradicts this, the feature is wrong."

---

## 3. Phase 1: Faithful Minimum

**Goal:** Make the app genuinely useful to real families with minimal surface area.

### What Exists at the End of Phase 1

#### Core Experience
- [x] Parent account (Google OAuth)
- [x] Ability to add children
- [x] Early Years content and activities
- [x] Family dashboard
- [x] Parent-led workflow
- [x] Family Sessions architecture
- [x] Unified Plan System (deterministic, mastery-aware)

#### Content
- [x] Scripture/Bible stories (liturgy system)
- [x] African History as narrative
- [x] Simple activities with tiered expectations
- [x] Daily Practices for infancy mode
- [x] Complete book library with fallback UI for missing assets

#### Assessment
- [x] Manual completion tracking
- [x] Parent observation modals
- [x] Family Completion flow with per-child mastery (Emerging/Developing/Secure)
- [x] Portfolio storage (basic) - upload, view, delete

#### AI (Limited, Parent-Only)
- [x] Explain Button (parent-facing)
- [x] "Help me plan tomorrow" feature (Tomorrow Preview)
- [x] No grading
- [x] No child-facing AI

### What Is Explicitly NOT Built Yet
- Student portals
- Independence toggles
- Advanced analytics
- Acceleration logic
- Apprenticeships

### Why This Phase Matters
This phase proves:
- Families will actually use this
- The pedagogy works without AI "magic"
- The platform does not require complexity to be helpful

> If Phase 1 is good, the project is already a success.

**Exit Criteria:**
- [x] A family can run daily learning using only this app
- [x] No confusion about authority
- [x] No dependency on automation

**Phase 1 Status:** COMPLETE (January 2025)

---

## 4. Phase 2: Order and Visibility

**Goal:** Help parents see formation without turning it into measurement.

### What Gets Added

#### Structure
- [ ] Clear daily/weekly rhythms visualization
- [ ] Family time vs individual time separation (enhanced UI)
- [ ] Simple scope & sequence views (read-only parent dashboard)
- [x] Week navigation and history view

#### Assessment Expansion
- [x] Portfolios organized by:
  - Subject
  - Time
  - Type (writing, activity, project)
- [x] Milestone tags (not scores)
- [ ] Long-term progress visualization (growth over time)

#### AI (Still Parent-Only)
- [x] Weekly summaries: "Here's what happened" / "Here are patterns I noticed"
- [x] Draft discussion questions
- [x] Draft feedback text for parents to edit

### What Still Does NOT Exist
- Auto-advancement
- Mastery labels visible to children
- Grade equivalents
- Rankings
- Recommendations that feel like commands

### Why This Phase Matters
This phase prevents:
- Parental anxiety ("Are we doing enough?")
- Loss of long-term perspective
- Overreaction to daily fluctuations

> Growth is seen over time, not demanded on schedule.

**Exit Criteria:**
- [ ] Parents can articulate their child's growth without citing metrics
- [ ] AI language always feels advisory, never authoritative

---

## 4.5. Phase 2.5: History & Liturgy Foundation

**Goal:** Establish the two pillars (History, Liturgy) that anchor all learning across all ages.

> [!IMPORTANT]
> This phase is foundational. Everything else builds on a child knowing their story (History) and practicing daily discipline (Liturgy).

### Age Stages Model

Instead of grades, we use Formation Stages:

| Stage | Age Range | Description |
|-------|-----------|-------------|
| Seedling | 0-3 | Picture stories, simple phrases, sung catechism |
| Sprout | 4-6 | Simple narrative, paraphrased Q&A, short verses |
| Sapling | 7-10 | Story-rich chapters, full catechism begins |
| Tree | 11-14 | Full content, critical thinking, WSC complete |
| Oak | 15-18 | Source documents, Larger Catechism, apologetics |

### Liturgy Outcomes

- [x] `liturgy_progressions` table for age-scaled content (Migration 0039)
- [ ] Complete WSC Q1-107 in database
- [ ] Add age-stage paraphrases for Q1-107 (Seedling through Oak)
- [ ] Expand hymns to 50+ (from reformed-hymns folder + additions)
- [ ] Expand memory verses to 52 (one per week, systematic selection)

### History Outcomes

- [ ] Finalize all 10 chapters of African History (Tree/Oak level)
- [ ] Create "story summaries" for Sprout/Sapling levels (10 stories)
- [ ] Create picture book companion series for Seedling (long-term goal)
- [ ] Design 2-3 activities per chapter, per age stage

### Integration Outcomes

- [ ] Weekly rhythm templates linking History + Liturgy
- [ ] Dashboard shows "This Week's Liturgy" summary
- [ ] History reader mode in app

### Why This Phase Matters

This phase ensures:
- Parents don't need expensive curriculum—History tells them what to teach
- Daily liturgy builds habit and memory without requiring parent preparation
- Content scales with age without requiring separate "grade-level" products

> The two pillars (History + Liturgy) replace the need for a $500 boxed curriculum.

**Exit Criteria:**
- [ ] A family can run a year of liturgy without running out of content
- [ ] History content exists for at least 2 age stages (Sapling + Tree)
- [ ] Weekly rhythm flows naturally between History story and Liturgy practice

---

## 4.6. Phase 2.6: Unified Architecture Migration

**Goal:** Consolidate the fragmented data model (Activities, Liturgy, Books) into a single Unified Formation System for cleaner AI integration and parent experience.

> [!IMPORTANT]
> This is the most significant architectural change in the project. Review `docs/architecture_comparison.md` for full rationale.

### Why This Phase Exists

The current system has accumulated technical debt:
- **15+ tables** with legacy prefixes and redundant tracking
- **3 separate completion systems** (evidences, liturgy_completions, reading_sessions)
- **Bug**: Catechism questions appearing in Activity feed under "Wisdom"
- **Orphaned Books**: Books don't participate in the formation engine

### The Unified Model

Everything becomes a Formation with `formation_type` determining behavior:

| Type | Examples | How It's Suggested |
|------|----------|-------------------|
| `skill` | Motor, History, Math | Weekly Planner |
| `habit` | Chores, Greetings | Daily Rhythm |
| `liturgy` | Catechism, Hymn, Verse | Rotation (Week #) |
| `reading` | Books | Daily Suggestion |
| `service` | Acts of Service | Weekly Planner |
| `rest` | Sabbath, Quiet Time | Context-aware |

### Migration Roadmap

#### Step 0: Architecture Finalization

- [x] Complete architecture comparison document  
- [x] Add Household model (multi-parent support)
- [x] Add Student auth flow (Google OAuth with pre-approval)
- [x] Define Authority Hierarchy

#### Step 1: Fresh D1 Database (New Production DB)

- [x] Create `schoolos-v2` D1 database
- [x] Apply clean schema (11 tables, see `architecture_comparison.md` Part 6-9)
- [x] Include `households` and `sessions` tables
- [x] Update Cloudflare Worker binding

> [!WARNING]
> **Breaking Change**: Old database will be retired. No user data migration needed (confirmed disposable).

#### Step 2: API Consolidation

- [x] Create unified `/api/formations` endpoints
- [x] Implement Household-aware auth (`household_id` in JWT)
- [x] Create `/api/household/invite` and `/join/:code` routes
- [x] Create Student auth flow with `pending_login_email` matching
- [x] Deprecate `/api/liturgy/today`, `/api/books`, `/api/reading-sessions` (In Progress)
- [x] Single completion tracking via `evidences` table
- [x] New `/api/day/today` returns ordered Formation blocks

**Files to Modify:**
- `cloudflare/src/index.ts` (API routes)
- `cloudflare/src/planner.ts` (Planner logic)

#### Step 3: Frontend Refactor

- [x] Update `src/types/index.ts` to match new schema (11 tables)
- [x] Create unified `FormationCard` component
- [x] Create Household invite UI (Settings page)
- [x] Create Student login enable/disable UI
- [x] Create Student Portal view (filtered dashboard)
- [x] Refactor `Dashboard.tsx` to use single data source (Partial)
- [ ] Delete unused components

**Files to Delete (After Verification):**
- `src/components/liturgy/DailyLiturgy.tsx` (merge into FormationCard)
- `src/components/reading/BookReader.tsx` (merge into FormationCard)
- `src/components/activities/ActivityCard.tsx` (merge into FormationCard)
- Legacy API call modules

#### Step 4: AI Integration Cleanup

- [x] Update `cloudflare/src/ai.ts` system prompts
- [x] Simplify embedding generation (one content type)
- [x] Unify RAG retrieval logic

### Exit Criteria

- [x] Database has 9 clean tables (not 15+)
- [x] Single API serves all formation types
- [x] Frontend uses one card component for all types
- [x] AI prompts reference single `formations` schema
- [x] No references to `legacy_*` tables anywhere

### Reference Documents

- **Architecture Comparison**: [architecture_comparison.md](file:///c:/Users/Anthony%20Mwesigwa/Documents/Home%20Line%20Shop/stage-builder/docs/architecture_comparison.md)
- **Clean Schema SQL**: See Part 6 in architecture_comparison.md

---

## 5. Phase 3: Graduated Independence

**Goal:** Transition responsibility from parent to child in a visible, controlled way.

### What Gets Added

#### Independence Settings
- [x] Per-child independence levels
- [x] Per-subject independence levels
- [x] Parent-controlled toggles

Examples:
- History: independent reading
- Math: guided
- Bible: parent-led

#### Student View (Not a Full App Yet)
- [x] Simple task list for older children
- [x] Ability to mark work complete (if allowed)
- [x] See portfolio items
- [x] Ask AI questions (if allowed by parent)

#### AI (Carefully Expanded)
- [x] Child-facing explanations (with parent visibility)
- [x] Writing feedback drafts
- [x] Socratic questioning
- [x] All AI interactions visible to parents

### What Still Does NOT Exist
- AI declaring readiness
- AI suggesting stage advancement
- Child-controlled scope changes

### Why This Phase Matters
This phase models:
- Biblical discipleship
- Responsibility before freedom
- Trust built through faithfulness

> Independence can be granted without abandoning oversight.

**Exit Criteria:**
- [x] Parents can gradually step back without chaos
- [x] Children grow in ownership, not entitlement

---

## 6. Phase 4: Pace Flexibility

**Goal:** Allow divergence without fragmentation.

### What Gets Added

#### Pace Controls
- [x] Parent-gated access to higher stages (PaceSettings component)
- [x] Subject-specific advancement (per-domain stage overrides)
- [x] Clear record of why access was granted (reason field in pace_settings)

#### Passion Signals
- [x] "Loved it!" tracking in completion modal
- [x] Passion signals stored in database
- [x] Planner boosts passion-aligned activities
- [x] Time spent tracking (FormationTimer)
- [ ] Quality of work indicators (future)

**AI may summarize signals, but never decide.**

#### Curriculum Compression
- [x] Learning Focus setting (Balanced vs Follow Interests)
- [ ] Core remains intact
- [ ] Non-core adapts to passion
- [ ] History, writing, and math reframed through interests

### Why This Phase Matters
This phase:
- Honors God's varied gifts
- Avoids wasting time
- Avoids premature specialization

> Foundation → Exploration → Doubling Down

**Exit Criteria:**
- [x] A child can go deep without becoming narrow
- [x] The core is never abandoned

---

## 7. Phase 5: Earning While Learning

**Goal:** Reunite education and work without exploitation.

### What Gets Added

#### Apprenticeship Tracking
- [x] Hours logging
- [x] Skills documentation
- [x] Mentor feedback integration
- [x] Parent approval gates

#### Portfolio of Real Work
- [x] Projects with real impact
- [x] Service records
- [x] Paid or unpaid contributions

#### Safeguards
- [x] Parent consent required
- [x] Clear limits on hours/scope
- [x] No platform-mediated labor markets (initially)

### Why This Phase Matters
This phase:
- Restores dignity to work
- Produces capable young adults
- Bridges childhood and adulthood naturally

> Learning becomes contribution, not delay.

**Exit Criteria:**
- [x] Teenagers can point to real work they've done
- [x] Parents feel peace, not pressure

---

## 8. Phase 6: Maturity and Irrelevance

**Goal:** Let the platform fade into the background.

### What This Looks Like
- [x] Upper school students manage most of their learning
- [x] Parents check in weekly or monthly
- [x] Portfolios speak for themselves
- [x] The app becomes a record, not a driver (Graduation Logic)

### Ultimate Success Condition
Families say:
> "We don't need this like we used to—and that's a good thing."

---

## 9. How to Use This Roadmap

This roadmap is not a checklist. **It is a moral sequence.**

If ever you are tempted to:
- Jump ahead
- Add features "because others have them"
- Automate discernment

You return to this question:

> **"Does this phase strengthen or weaken the parent's role as steward?"**

If it weakens it, the feature waits.

### Decision Framework

| Question | If Yes | If No |
| :--- | :--- | :--- |
| Does this feature require parent approval? | Consider it | Add approval gate |
| Does this feature judge the child? | Reject it | Consider it |
| Does this feature increase anxiety? | Reject it | Consider it |
| Does this feature replace discernment? | Reject it | Consider it |
| Can a family use this faithfully alone? | Proceed | Wait for dependencies |

---

## Current Status Summary

| Phase | Status | Key Deliverables |
| :--- | :--- | :--- |
| Phase 0: Constitutional | ✅ Complete | All governance docs |
| Phase 1: Faithful Minimum | ✅ Complete | Core features, book library |
| Phase 2: Order & Visibility | ✅ Complete | Portfolios, summaries, week nav |
| Phase 2.5: History & Liturgy | ✅ Complete | WSC Q1-107, age progressions, history stories |
| **Phase 2.6: Unified Architecture** | ✅ Complete | Fresh DB, API consolidation, unified FormationCard |
| **Phase 3: Graduated Independence** | ✅ Complete | Independence settings, Student Actions, AI Coach |
| **Phase 4: Pace Flexibility** | ✅ Complete | Per-subject pace, time tracking |
| **Phase 5: Earning While Learning** | ✅ Complete | Apprenticeships, Portfolios |
| **Phase 6: Maturity** | ✅ Complete | Full independence, Graduation, Export |

> **Current Focus:** MAINTENANCE & POLISH. The Core Roadmap is Complete.

---

## Cross-Reference
- See `PRODUCT_VISION.md` for the desired end state
- See `PEDAGOGICAL_PHILOSOPHY.md` for the theological filter
- See `AI_GOVERNANCE_AND_ETHICS.md` for AI boundaries
- See `AI_CONTEXT.md` for AI coding assistant quick reference

