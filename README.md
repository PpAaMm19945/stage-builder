# HomeLine Academy (SchoolOS)

> **Reformed Christian education for African families—from birth to high school.**

HomeLine Academy is a family formation platform that helps parents teach their children at home through daily liturgy, history narratives, and age-appropriate activities. It replaces expensive curriculum with AI-assisted formation, grounded in Scripture and the Reformed confessions.

## Quick Context for AI Assistants

**What this is:** A React + Cloudflare Workers app for home education. Parents add children, and the app generates daily formation activities (liturgy, history, skills) scaled to each child's age.

**Theology matters:** This is a Reformed Christian app. All AI must respect the authority hierarchy (Scripture → Parent → Curriculum → AI). See `/docs/AI_GOVERNANCE_AND_ETHICS.md`.

**Age Stages (not grades):** Seedling (0-3), Sprout (4-6), Sapling (7-10), Tree (11-14), Oak (15-18).

**Key tables:** `formations` (activities), `liturgy_progressions` (age-scaled content), `evidences` (observations), `family_rhythms` (daily schedules).

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
# Prerequisites: Node.js 18+, npm

# 1. Clone and install
git clone <repo-url>
cd stage-builder
npm install

# 2. Start frontend dev server
npm run dev

# 3. Start Cloudflare Worker (separate terminal)
cd cloudflare
npm install
npm run dev
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
│   └── migrations/         # D1 SQL migrations
├── public/
│   └── books/              # Book content (markdown, images)
├── docs/                   # Philosophy, roadmap, guides
└── scripts/                # Build and utility scripts
```

## Documentation

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](./docs/ROADMAP.md) | Development phases and current status |
| [PEDAGOGICAL_PHILOSOPHY.md](./docs/PEDAGOGICAL_PHILOSOPHY.md) | Theological foundation |
| [AI_GOVERNANCE_AND_ETHICS.md](./docs/AI_GOVERNANCE_AND_ETHICS.md) | AI behavior constraints |
| [PRODUCT_VISION.md](./docs/PRODUCT_VISION.md) | Desired end state |
| [AI_CONTEXT.md](./docs/AI_CONTEXT.md) | Quick reference for AI coding assistants |

## Current Phase

**Phase 2.5: History & Liturgy Foundation** (In Progress)

Building the two pillars that anchor all learning:
- **Liturgy:** Hymns, Catechism (WSC Q1-107), Memory Verses—with age-stage simplifications
- **History:** African History as narrative backbone, with World History interwoven

See [ROADMAP.md](./docs/ROADMAP.md) for full details.

## Hackathon Submission (Gemini 3)

This app is being submitted to the **Gemini 3 Hackathon** (deadline: Feb 10, 2026).

The submission demonstrates:
- **Multimodal AI:** Content adaptation based on child's age and family context
- **Reasoning:** Age-appropriate catechism paraphrasing, activity recommendations
- **Reformed AI Governance:** Explicit theological constraints on AI behavior

---

## License

Proprietary. All rights reserved.

## Author

Anthony Jr. Mwesigwa
