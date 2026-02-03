# AI Formation Engine: The Invisible Tutor

> **Core Philosophy:** The AI is the engine, not the interface. It quietly orchestrates a "One Anchor" daily rhythm for the whole family, preventing parent burnout while ensuring age-appropriate formation.

---

## 1. The "One Anchor" Logic

**Problem:** Generating individual schedules for multiple children creates chaos and turns the parent into a logistics manager.
**Solution:** The AI generates **ONE** central activity for the family, but provides **differentiated** instructions for each child's level.

### The Algorithm
1.  **Analyze Family Context**: Identify all active children and their ages (e.g., Baby: 6mo, Toddler: 3y, Child: 6y).
2.  **Select Core Theme**: Pick a theological or character theme for the day (e.g., "Patience", "Creation", "Diligence").
3.  **Choose ONE Activity**: Select a single activity that fits the theme (e.g., "Baking Bread", "Nature Walk", "Building a Tower").
4.  **Differentiate ("Grow at Your Level")**:
    *   **Seedling (0-2y)**: Sensory focus (Touch, smell, observe).
    *   **Sprout (3-5y)**: Motor/Participation focus (Pour, mix, count).
    *   **Sapling (6+y)**: Cognitive/Responsibility focus (Measure, explain, lead).

---

## 2. Lens vs. Light (Skill Integration)

**Concept:** Theology is the **Lens** (The "Why"). Skills are the **Light** (The "What").
**Goal:** We do not separate "Subject Learning" from "Character Formation." We teach Skills *through* the Lens of Theology.

### The Workflow
1.  **Identify Formation Goal**: The system selects a character trait (e.g., "Orderliness").
2.  **Query Skill Database**: The system looks for a skill activity (e.g., from `skills.json` -> "Sorting Objects" or "Handwriting").
3.  **The "Lens" Rewrite**: The AI rewrites the skill instructions to emphasize the character trait.
    *   *Standard Skill*: "Sort the red and blue blocks."
    *   *Theology Lens*: "God is a God of order. Let's practice bringing order to chaos by sorting these blocks, just like God ordered the days."

---

## 3. The Book Nook (Living Books)

**Concept:** Every day includes a "Living Book" recommendation that aligns with the theme or stands alone as a worthy story.

### The Logic
1.  **Source**: `books.json` (Curated library of picture books).
2.  **Selection Criteria**:
    *   **Thematic Match**: prioritizing books that match the day's "Formation Goal".
    *   **Rotation**: Ensuring a mix of History, Faith, and Imagination.
    *   **Age Appropriateness**: Targeted at the youngest listener, but rich enough for older ones (or vice-versa, with explanation).

---

## 4. The Daily Output Structure (The Anchor Card)

The AI must generate a JSON object structure that directly feeds the `AnchorCard` UI:

```json
{
  "date": "2026-02-10",
  "theme": "The God of Order",
  "liturgy": {
    "hymn": "Holy, Holy, Holy",
    "catechism_q": 1,
    "catechism_a": "God made me and all things.",
    "scripture": "Genesis 1:1"
  },
  "family_activity": {
    "title": "Sorting the Creation",
    "description": "A sorting activity to teach classification and order.",
    "skill_domain": "Math / Logic",
    "formation_lens": "Orderliness",
    "levels": [
      { "stage": "Seedling", "instruction": "Let baby hold two different colored objects..." },
      { "stage": "Sprout", "instruction": "Sort the blocks into two piles by color..." },
      { "stage": "Sapling", "instruction": "Count the piles and explain why order helps us..." }
    ]
  },
  "book_nook": {
    "title": "God's Very Good Idea",
    "author": "Trillia Newbell",
    "cover_image": "url...",
    "discussion_prompt": "Why did God make us all different?"
  }
}
```
