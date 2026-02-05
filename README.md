# FamilyPath

> A library for faithful families—hymns, books, activities, and daily rhythms.

FamilyPath is a library-first app that helps Christian families learn together. Browse hymns. Read picture books. Work through developmental activities with your toddler. Subscribe to Learning Paths for structured daily rhythms. Track your family's journey through 100+ hymns, 100+ books, and the Westminster Catechism.

Simple on the surface. Powerful underneath.

## The Vision

**A vintage car with a beast of an engine.**

- **Passive Mode:** Browse the library. Play hymns while cooking. Read bedtime stories. No pressure.
- **Active Mode:** Subscribe to Learning Paths. Get a combined daily rhythm. Track completion.

The engine (smart age-based suggestions, child profiles, domain balancing) stays dormant until you need it.

---

## Quick Context for AI Assistants

**What this is:** A React + Cloudflare Workers library app for family formation. Parents add children, browse content, and optionally subscribe to Learning Paths that generate daily rhythms.

**Key concept:** Library-First. All content (books, hymns, catechism, activities) lives in the library. Learning Paths are curated journeys through library content. Completion = finishing parts of the library.

**Theology matters:** Reformed Christian. Authority hierarchy: Scripture → Parent → Curriculum → AI. See `/docs/AI_GOVERNANCE_AND_ETHICS.md`.

**Age Stages:** Seedling (0-3), Sprout (4-6), Sapling (7-10), Tree (11-14), Oak (15-18).

**Key tables:** `formations` (all library content), `evidences` (completion tracking), `family_preferences` (settings).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Cloudflare Workers, D1 (SQLite), R2 (Storage) |
| AI | Google Gemini API (via Cloudflare AI Gateway) |
| Auth | Google OAuth |

## Local Development

```bash
# Prerequisites: Node.js 18+, pnpm

# 1. Clone and install
git clone <repo-url>
cd stage-builder
pnpm install

# 2. Start frontend dev server
pnpm run dev

# 3. Start Cloudflare Worker (separate terminal)
cd cloudflare
pnpm install
pnpm run dev
```

## Project Structure

```
stage-builder/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Route pages
│   ├── lib/                # Utilities, API client
│   └── types/              # TypeScript types
├── cloudflare/             # Backend
│   ├── src/index.ts        # Main worker entry
│   ├── src/planner.ts      # The "beast engine" for smart scheduling
│   └── migrations/         # D1 SQL migrations
├── public/
│   └── books/              # Book content (markdown, images)
├── docs/                   # Philosophy, roadmap, guides
└── scripts/                # Build and utility scripts
```

## Documentation

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](./docs/ROADMAP.md) | Development phases: Library → Paths → Engine |
| [PRODUCT_VISION.md](./docs/PRODUCT_VISION.md) | The vintage car / beast engine philosophy |
| [PEDAGOGICAL_PHILOSOPHY.md](./docs/PEDAGOGICAL_PHILOSOPHY.md) | Theological foundation |
| [AI_GOVERNANCE_AND_ETHICS.md](./docs/AI_GOVERNANCE_AND_ETHICS.md) | AI behavior constraints |

## Current Phase

**Phase 1: The Library** (In Progress)

Building the core library experience:
- 100+ Hymns for listening and memorization
- 100+ Picture Books (history, faith, formation)
- Westminster Shorter Catechism with age progressions
- Developmental Activities for toddlers
- African History (Young Historians + Full Course)

**Next:** Phase 2 - Learning Paths (subscriptions, combined daily view)

See [ROADMAP.md](./docs/ROADMAP.md) for full details.

---

## What We're Building

| Content | Status |
|---------|--------|
| Hymn Library (100+) | Building |
| Book Library (100+) | Building |
| Catechism (WSC Q1-107) | ✅ Complete |
| Memory Verses (52+) | ✅ Complete |
| Toddler Activities | ✅ Complete |
| African History | Building |

## What We're NOT Building (Yet)

- ❌ Math, Science, Language Arts curricula
- ❌ Apprenticeship tracking
- ❌ Graduation and transcripts
- ❌ AI tutoring for children
- ❌ Gamification

These may come in a future "Full School" phase. For now: **Library. Paths. Rhythm.**

---

## License

Proprietary. All rights reserved.

## Author

Anthony Jr. Mwesigwa
