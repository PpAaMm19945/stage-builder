# Architectural Report: SchoolOS "Early Years" MVP

## 1. Executive Summary
The current architecture exhibits a "Split Personality." You have a **Legacy AI Pipeline** (`RhythmGenerator`) that attempts to plan everything "blindly" using a hardcoded prompt and stale data, and a **New Learning Engine** (`LearningPaths`) that is deterministic and robust but currently disconnected from the AI.

To achieve your goal of "AI Maximization" and a sound MVP, the system must shift from **AI-Generated Content** to **AI-Orchestrated Structure**. The AI should decide *when* to do things based on family energy/schedule, but the `LearningPaths` engine should decide *what* specific book or hymn comes next based on progress.

---

## 2. Pipeline Assessment ("To what degree does it work?")

**Current State: 3/10 (Broken Feedback Loop)**

The pipeline is currently linear and broken:
1.  **Planning**: AI generates a plan based on `family_profiles.catechism_position`.
2.  **Execution**: User completes an item. API records it in `liturgy_completions`.
3.  **Broken Link**: The `family_profiles` table is **never updated**.
4.  **Result**: The AI will endlessly suggest the same Hymn and Catechism Question because it looks at the stale profile data, not the live completion tables.

**The "Blind" AI**:
The AI is generating plans without knowing what books you actually own. It suggests "read a book" but cannot suggest "Read 'The Blue Boat'" because it has no access to your R2 library inventory.

---

## 3. AI Maximization & Decision Determinants

**Current Determinants:**
- **Static Inputs**: Hardcoded prompt list (Westminster Catechism, etc.).
- **Stale Context**: User's initial profile settings.
- **Randomness**: LLM hallucination for "activities" (e.g., "Draw a picture").

**Ideal Determinants (The "Maximization" Strategy):**
To maximize AI utility, it should function as a **Strategic Advisor (System 2)**, not a Content Fetcher.
1.  **User Constraints**: "We have 15 mins this morning" (Time-Model).
2.  **Child State**: "Child is energetic/tired" (Observation history).
3.  **Inventory**: "What is the next unread book in our library?" (Learning Path).

**Recommendation**:
Stop asking the AI to "generate a weekly plan with activities." Instead, ask the AI to **"Slot the next items from the active Learning Paths into this week's available time blocks."**

---

## 4. Activities & Presentation Gaps

**Missing Features:**
1.  **Visual Progress Trails**: The current dashboard shows "today" well (`WeekStrip`), but lacks a "Map" view. Parents need to see "We are here on the Hymn Path" (e.g., stone 5 of 100).
2.  **Book "Cover Flow"**: The user has 50-100 picture books. The UI needs a visual library view where the child can "choose" the next book if the path allows, or see the "Up Next" cover prominently.
3.  **Progress Reporting**:
    - The `EndOfDaySummary` is ephemeral.
    - **Missing**: A "Weekly Digest" email or view. "You read 5 books, learned 'God made me', and practiced sitting still for 10 minutes."

---

## 5. Critical Missing Pieces for MVP

To make the architecture sound, you must implement these three bridges:

### A. The "Path Resolver" Bridge
*   **Problem**: `RhythmGenerator` outputs generic "Book".
*   **Fix**: Create a `resolvePlan(plan)` step that iterates through the AI's generic slots and queries `GET /api/paths/today` to fill them with specific content (Book ID, Cover URL, Title).

### B. The "Inventory" Bridge
*   **Problem**: `library.ts` reads files from R2, but `LearningPaths` queries the `formations` database table.
*   **Fix**: You need a "Seed" script (or Admin button) that scans the R2 bucket (using `api/debug/books/audit` logic) and inserts every valid book into the `formations` table. This makes them "playable" in the Learning Path engine.

### C. The "Feedback" Bridge
*   **Problem**: Completions don't advance the plan.
*   **Fix**: Update the `POST /api/liturgy/complete` and `POST /api/reading/complete` endpoints to **also** call `advancePath()` (logic currently in `routes/paths.ts`). This ensures the next time the AI (or Resolver) looks, it sees the *next* item.

---

## 6. Implementation Plan (Short Term)

1.  **Seed Database**: Run a script to populate `formations` table with your 100 R2 books.
2.  **Enable Learning Paths**: Create a "Reading Path" and "Liturgy Path" in the database that selects from these formations.
3.  **Refactor Planner**: Modify `RhythmGenerator` to output *intent* ("Morning Liturgy Slot"), then use a code-based resolver to fetch the actual content from `LearningPaths`.

This architecture separates concerns: **AI handles Time & Strategy**, **Code handles Curriculum & State**. This is robust, deterministic, and scalable.
