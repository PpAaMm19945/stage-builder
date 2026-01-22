---
version: "2.0"
last_updated: "2025-01-22"
derived_from: "PRODUCT_VISION.md"
---

# Development Roadmap

## Table of Contents
1. [The Vision: A Vintage Car with a Beast Engine](#1-the-vision)
2. [Guiding Rule](#2-guiding-rule)
3. [Phase 1: The Library (Current Focus)](#3-phase-1-the-library)
4. [Phase 2: Learning Paths](#4-phase-2-learning-paths)
5. [Phase 3: The Beast Awakens](#5-phase-3-the-beast-awakens)
6. [Phase 4: Child Independence](#6-phase-4-child-independence)
7. [Future: The Full School](#7-future-the-full-school)
8. [Decision Framework](#8-decision-framework)

---

## 1. The Vision

> **A vintage car with a beast of an engine.**

The exterior is simple, warm, and inviting. A parent opens the app and sees a library. Books. Hymns. Activities. History. They can browse freely, play hymns continuously, or read bedtime stories.

But under the hood is a powerful engine—capable of:
- Generating smart, age-specific daily suggestions
- Tracking growth across 100+ books, 100+ hymns, catechism, and activities
- Building child profiles that understand strengths and interests
- Creating graceful learning plans that span months or years

The engine is kept at bay until the occasion demands it.

### The Two Modes

| Mode | Experience | Who It's For |
|------|------------|--------------|
| **Passive** | Browse the library. Play hymns. Read books. Mark things done. | Working fathers wanting 15 minutes. Families who just want stories. |
| **Active** | Subscribe to Learning Paths. Get daily suggestions. Track completion toward goals. | Families wanting structured formation. Parents teaching toddlers systematically. |

Both modes use the same library. The difference is whether the engine is engaged.

---

## 2. Guiding Rule

> **The Library is the source of truth. Everything else serves it.**

- Learning Paths are curated journeys through the library
- Daily suggestions are drawn from active paths
- Completion means finishing parts of the library
- Growth profiles are built from library interactions

If development stopped today, the library would still help families.

---

## 3. Phase 1: The Library (Current Focus)

**Goal:** Make the library genuinely useful—for browsing, playing, and completing.

### The Library Contains

| Content Type | Description | Status |
|--------------|-------------|--------|
| **Books** | 100+ picture books, history narratives, Pastor Curtis series | Building |
| **Hymns** | 100+ hymns for listening and memorization | Building |
| **Catechism** | Westminster Shorter Catechism (Q1-107) with age progressions | ✅ Complete |
| **Memory Verses** | 52+ verses organized by theme | ✅ Complete |
| **Activities** | Age-appropriate developmental activities for toddlers through age 6 | ✅ Complete |
| **History Course** | Young Historians (picture books) + Full Course (teens/adults) | Building |

### Library Features

- [x] Browse all content freely
- [x] Filter by age range, type, domain
- [x] Mark items as complete
- [x] Continuous playback for hymns
- [x] Full-screen book reader
- [ ] Search across library
- [ ] "Favorites" collection
- [ ] Progress: "42/100 hymns learned"

### Family Setup

- [x] Add children with ages
- [x] Automatic age-based content filtering
- [ ] Child profiles (strengths, interests, notes)
- [ ] Family preferences (liturgy sources, history tracks)

### Exit Criteria

- A family can browse and use the library without subscribing to any path
- Library completion is visible: "We've read 23 of 100 books"
- Hymns can be played continuously like a music app

---

## 4. Phase 2: Learning Paths

**Goal:** Allow families to opt into structured journeys through the library.

### What Are Learning Paths?

A Learning Path is a curated sequence through library content with:
- A defined order (or rotation)
- Suggested pace (daily, weekly)
- Completion tracking
- Growth outcomes when finished

### Available Paths (Planned)

| Path | Content | Pace | For |
|------|---------|------|-----|
| **Hymn Journey** | 100+ hymns in rotation | 1 new hymn/week | Families |
| **Catechism Path** | WSC Q1-107 | 1 question/week | Families |
| **Family Liturgy** | Hymn + Verse + Catechism | Daily | Families |
| **African History (Young)** | Picture book series | 1 book/week | Ages 3-8 |
| **African History (Full)** | Textbook chapters | 1 chapter/week | Ages 11+ |
| **Pastor Curtis Series** | His books in order | Self-paced | Teens/Adults |
| **Toddler Development** | Activities by domain | 3-4/day | Ages 0-5 |
| **Early Reading** | Pre-literacy activities + books | Daily | Ages 3-6 |

### Path Subscription

- Families can subscribe to **multiple paths** simultaneously
- Paths combine into a **unified daily view**
- Each path shows its own progress and completion %
- Paths can be paused or switched

### The Daily View

When paths are active, the home screen shows:

```
Today's Rhythm
─────────────────
☐ Hymn: "A Mighty Fortress"
☐ Verse: Romans 8:28
☐ Catechism: Q23 - Who is the Redeemer?
☐ Activity: Ball Rolling (Motor - Tier 1)
☐ Book: "The Brave Lion" (African History)
```

This is generated by the **beast engine** from active paths + child ages.

### Exit Criteria

- A family can subscribe to 3+ paths and see a combined daily rhythm
- Path completion shows: "Hymn Journey: 23/100 complete"
- Suggestions are smart: age-appropriate, balanced, not repetitive

---

## 5. Phase 3: The Beast Awakens

**Goal:** Unleash the smart engine for families who want deep, granular formation.

### The Engine's Capabilities

The engine (`cloudflare/src/planner.ts` and AI integration) can:

1. **Age-Specific Suggestions**
   - 5-month-old + 2-year-old in same family? Different suggestions for each.
   - Tiered expectations per activity (Tier 1, 2, 3 by age)

2. **Domain Balancing**
   - Ensure motor, cognitive, language, social-emotional get coverage
   - Virtue weighting (wisdom, stature, favor with God, favor with man)

3. **Child Profiles**
   - Track what each child has done
   - Note strengths, interests, areas to grow
   - AI summarizes: "Noah has grown in fine motor skills through 15 activities"

4. **Smart Pacing**
   - Parent sets time budget: 15 min, 30 min, 1 hour
   - Engine fills time with highest-priority items from active paths
   - Respects "not today" overrides

5. **Completion Insights**
   - "You've finished 100 picture books—here's the growth we've seen"
   - "After 52 hymns, your family has learned the great truths of..."

### When the Engine Activates

The engine is **dormant by default**. It activates when:
- Family subscribes to paths that need scheduling (e.g., Toddler Development)
- Family enables "Smart Suggestions" in settings
- Family adds multiple children with age gaps

### Exit Criteria

- A family with a 5-month-old and 3-year-old gets appropriate, distinct suggestions
- Daily rhythm respects time budget
- Growth profiles accumulate and can be reviewed

---

## 6. Phase 4: Child Independence

**Goal:** Let older children use the family account to do their own work.

### How It Works

- **Not a separate Student Portal**—same app, same account
- Parent enables "Child Mode" for specific children
- Child can:
  - View their assigned History reading
  - Mark Catechism/Verse study complete
  - See their own progress
  - (If enabled) Ask AI questions with parent visibility

### What Parents Control

- Which paths a child can see
- Whether child can mark things complete
- Whether child can use AI features
- Full visibility into everything child does

### Content for Older Children

| Content | Independence Level |
|---------|-------------------|
| **History Course (Full)** | Child reads independently, discusses with parent |
| **Catechism → Apologetics** | Teen studies answers, prepares to defend faith |
| **Pastor Curtis Books** | Teen/adult reads on own schedule |
| **Memory Verses** | Child recites to parent for completion |

### Exit Criteria

- A 12-year-old can log in, see their History assignment, read it, and mark complete
- Parent sees everything the child did
- No separate account needed—just a mode toggle

---

## 7. Future: The Full School

> **This is NOT the current focus. It is documented here as the long-term possibility.**

If FamilyPath succeeds as a library-first formation tool, it could eventually become a full homeschool solution:

### What "Full School" Would Add

| Feature | Description |
|---------|-------------|
| **Math Curriculum** | Charlotte Mason-style, living math |
| **Science Curriculum** | Nature study, experiments, observation |
| **Language Arts** | Grammar, composition, copywork |
| **Foreign Language** | Latin foundations |
| **Apprenticeships** | Real work tracking for teens |
| **Graduation Tracking** | Portfolio-based completion |
| **Transcripts** | For college applications |

### Why Not Now?

1. **Focus:** The library must be excellent before we add subjects
2. **Content:** We need 100+ books, 100+ hymns, complete History first
3. **Trust:** Families must love the simple version before we add complexity
4. **Engine:** The beast must prove itself with formation before academics

### The Promise

> When the library is complete, and families are faithfully using Learning Paths, and the engine is battle-tested—then we consider the full school.

Until then: **Library. Paths. Daily Rhythm. That's it.**

---

## 8. Decision Framework

Before adding any feature, ask:

| Question | If Yes | If No |
|----------|--------|-------|
| Does this enrich the library? | Proceed | Pause |
| Does this help families complete library content? | Proceed | Pause |
| Does this require the beast engine? | Keep dormant until needed | Keep dormant |
| Does this replace parental authority? | Reject | Consider |
| Can a family use this without subscribing to paths? | Good design | Reconsider |

### The Litmus Test

> "Can a working father with 15 minutes just play some hymns and read a story?"

If yes, we're on track. If no, we've over-complicated.

---

## Current Status

| Phase | Status | Focus |
|-------|--------|-------|
| **Phase 1: The Library** | 🔨 In Progress | Complete book/hymn library, browsing UX |
| Phase 2: Learning Paths | ⏳ Next | Path subscriptions, combined daily view |
| Phase 3: Beast Engine | ⏳ Later | Smart suggestions, child profiles |
| Phase 4: Child Independence | ⏳ Later | Child mode, history assignments |
| Future: Full School | 🔒 Not Now | Documented for later |

---

## What We're NOT Doing (Yet)

To maintain focus, these are explicitly deferred:

- ❌ Math, Science, Language Arts curricula
- ❌ Apprenticeship tracking
- ❌ Graduation logic
- ❌ Transcripts and credentials
- ❌ Complex independence settings
- ❌ AI tutoring for children
- ❌ Gamification (streaks, points, badges)
- ❌ Multi-family collaboration features

These may come in "The Full School" phase. For now: **Library. Paths. Rhythm.**
