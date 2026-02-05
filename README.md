# FamilyPath
> **Powered by Gemini 3 Deep Reasoning**

A "Living Curriculum" engine that adapts to your family's chaos. FamilyPath replaces static PDF lesson plans with a dynamic, reasoning-based API that builds 2-week Formation Arcs and delivers daily "Anchors" via chat.

## The Problem
Parents spend hours every Sunday trying to adapt rigid curricula to their specific children (ages, needs, moods). When life happens (sickness, busy days), the plan breaks, and guilt sets in.

## The Solution: Deep Reasoning
We use **Gemini 3 Flash (Preview)** to do what static logic cannot: **Reason about the connection between theology, child development, and daily reality.**

### Architecture
1.  **Formation Arc (Strategy):**
    Gemini 3 analyzes each child (e.g., "Sarah, 5yo, Reading Level 2") and the family's values to build a 2-week roadmap. It doesn't just slot in activities; it explains *why* this specific hymn pairs with this specific history book for these specific children.

2.  **Daily Anchor (Tactics):**
    Every morning at 4 AM, a Cloudflare Worker generates a "Daily Anchor"—highly specific activities for the day.

3.  **Chat Feedback (Adaptation):**
    The "Anchor" isn't a command; it's a conversation. Parents can chat with the engine to adjust:
    *   *"James is sick today."* -> Gemini swaps the outdoor game for a quiet story.
    *   *"We only have 15 minutes."* -> Gemini compresses the liturgy.

## How it Works (Under the Hood)
-   **Backend:** Cloudflare Workers (High performance, low latency)
-   **Database:** Cloudflare D1 (SQLite) containing our library of 500+ books and hymns.
-   **AI Engine:** Google Gemini 3 Flash Preview (via Cloudflare AI Gateway).
-   **Frontend:** React + Tailwind + Phosphor Icons.

## Models Used
*   **`gemini-2.0-flash-thinking-exp-01-21` & `gemini-1.5-flash`**: Used for the deep reasoning required to build Formation Arcs and generate context-aware Daily Anchors. The model's ability to hold complex family context (multiple children, reading levels, theological alignment) is the core of our engine.

---

## Local Development

```bash
# Frontend
npm install
npm run dev

# Backend (Worker)
cd cloudflare
npm install
npm run dev
```

## License
Proprietary. All rights reserved.
Hackathon Submission by Anthony Jr. Mwesigwa.
