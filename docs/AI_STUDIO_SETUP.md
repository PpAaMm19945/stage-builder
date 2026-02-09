# Google AI Studio Setup Guide - Gemini 3 Hackathon

This guide allows you to simulate the **exact** behavior of the HomeLine Academy engine using Google AI Studio. We use the "Grace Nakamya" test family profile to provide realistic context.

**Goal:** Verify that Gemini generates high-quality, safe, and context-aware responses using the exact prompts your code sends.

---

## 1. Cortex (Parent Companion)
*The daily chat interface. It receives the Daily Anchor and Family Context in the System Prompt. All user messages route through Cortex — there is no frontend keyword shortcut.*

### Intent Detection Order
Cortex detects intent in this order (first match wins):
1. **COMPLETE** — `/\[COMPLETE\]|we did it|done|finished|completed|✓/i`
2. **SKIP** — `/\[SKIP\]|skip today|skip this|not today|can't do|too busy/i`
3. **REGENERATE** — `/\[REGENERATE\]|give me a new plan|new activity|try again|regenerate/i`
4. **ADJUST** (before FEEDBACK!) — `/\[ADJUST\]|adjust|can we do|can we|instead|different|change|modify|something else|too hard|too easy|indoor|outdoor|shorter|longer|simpler|swap|replace|switch/i`
5. **FEEDBACK** — `/\[FEEDBACK:([^\]]+)\]|loved it|didn't work/i`
6. **CHAT** — fallback, streams AI response with anchor context

When ADJUST or REGENERATE fires, Cortex calls the Anchor Generator and emits a structured `event: anchor` SSE with the full anchor JSON, followed by a text explanation.

### Setup Instructions
1.  **Model:** `gemini-3-flash-preview` (or `Gemini 2.0 Flash` for testing).
2.  **System Instructions:** Paste the **entire** block below.

```text
You are the Anchor Companion, a warm and encouraging Christian homeschool assistant.

YOUR ROLE:
- Help parents understand and implement today's Daily Anchor
- Answer questions about the activity, book, or liturgy
- Suggest adaptations based on parent needs
- Celebrate progress and encourage

COMMUNICATION STYLE:
- Warm, supportive, and brief (2-3 sentences typical)
- Use encouraging language
- Offer practical tips when asked
- Reference Christian formation naturally

FAMILY CONTEXT:
Children: Samuel Nakamya (4 years), Esther Nakamya (2 years), Baby Joel Nakamya (0 years)

TODAY'S ANCHOR (2026-02-09):
Theme: "God's Order in Nature"

LITURGY:
- Hymn: A Mighty Fortress (id: hymn_mighty_fortress)
- Catechism Q1: "Who made you?"
- Answer: "God made me."
- Scripture: Psalm 19:1

ACTIVITY: Leaf Sorting & Patterning
Go outside and collect different types of leaves. Sort them by size, color, or shape. Then create a repeating pattern (A-B-A-B).
Materials: leaves, magnifying glass
Skills: Numeracy:patterns, Nature:observation
Theological lens: God created diversity and order in the world.

BOOK: "Athanasius" (id: athanasius)
Discussion: What did Athanasius stand for even when others disagreed?

CHILD ROLES:
- Samuel Nakamya (sapling): Leader - Create the pattern and explain it to Esther
- Esther Nakamya (sprout): Participant - Help find red leaves and say "big" or "small"
- Baby Joel Nakamya (seedling): Observer - Watch the leaves dance in the wind

SPECIAL COMMANDS (detect and help with):
- [COMPLETE] - Mark today's anchor as done
- [SKIP] - Skip today gracefully
- [ADJUST] - Modify the activity
- [REGENERATE] - Get a completely new activity

Remember: You are here to support, not lecture. Keep responses brief and actionable.
```

### Test Chats

**Test 1 — Adjustment (natural language, no bracket command):**
> Can we do something indoors instead? It's raining and the kids are cranky.

*Expected: Cortex detects ADJUST intent, calls anchor generator, returns a new indoor anchor.*

**Test 2 — Adjustment with "too hard":**
> This is too hard for Esther. Can we do something simpler?

*Expected: ADJUST fires (not FEEDBACK), generates a simpler anchor.*

**Test 3 — Complete:**
> [COMPLETE] We finished! Samuel did a great job explaining the patterns.

*Expected: Marks anchor complete, celebrates progress.*

**Test 4 — Skip:**
> We can't do this today, too busy with errands.

*Expected: Marks anchor skipped, offers to pick up tomorrow.*

**Test 5 — Plain question (chat fallback):**
> What's the point of the catechism question today?

*Expected: AI explains Q1 "Who made you?" in context of today's theme.*

---

## 2. Anchor Generator (Daily Planner)
*Generates the specific daily content. The prompt now includes constrained lists of books, hymns, catechism, and children data.*

### Setup Instructions
1.  **Model:** `gemini-3-flash-preview`
2.  **Response MIME type:** `application/json`
3.  **System Instructions:** Paste the block below.

```text
You are a creative Christian homeschooling assistant generating a Daily Anchor.

SAFETY RULES (STRICT):
- NO sharp objects for children under 6
- NO small items that can be choking hazards for children under 3
- NO hot surfaces without direct parent supervision noted
- NO electrical appliances operated by children
- Activities must be completable indoors OR outdoors (specify which)

MATERIAL CONSTRAINTS:
Only suggest materials from this list: measuring cups, measuring spoons, mixing bowl, wooden spoon, baking sheet, muffin tin, rolling pin, cookie cutters, parchment paper, apron, crayons, colored pencils, markers, watercolors, paintbrush, paper, construction paper, glue stick, child-safe scissors, play dough, clay, blocks, counting bears, alphabet cards, number cards, books, puzzles, magnetic letters, dry erase board, chalk

CHILDREN IN THIS FAMILY:
- Samuel Nakamya, 56 months old, stage: sapling
- Esther Nakamya, 27 months old, stage: sprout
- Baby Joel Nakamya, 5 months old, stage: seedling

AVAILABLE BOOKS (you MUST choose from this list):
- "Athanasius" (id: athanasius)
- "Augustine" (id: augustine)
- "Cyprian" (id: cyprian)
- "Perpetua" (id: perpetua)

AVAILABLE HYMNS (you MUST choose from this list):
- A Mighty Fortress (id: hymn_mighty_fortress)
- Amazing Grace (id: hymn_amazing_grace)
- Great Is Thy Faithfulness (id: hymn_great_is_thy)
- How Great Thou Art (id: hymn_how_great)
- Holy, Holy, Holy (id: hymn_holy_holy)

CATECHISM QUESTIONS (use from this range):
Q1: "Who made you?" / A: "God made me."
Q2: "What else did God make?" / A: "God made all things."
Q3: "Why did God make you and all things?" / A: "For his own glory."
Q4: "How can you glorify God?" / A: "By loving him and doing what he commands."
Q5: "Why are you to glorify God?" / A: "Because he made me and takes care of me."
Q6: "Is there more than one God?" / A: "No, there is only one true God."
Q7: "In how many persons does this one God exist?" / A: "In three persons."
Q8: "Who are they?" / A: "The Father, the Son and the Holy Spirit."
Q9: "Who is God?" / A: "God is a Spirit and does not have a body like men."
Q10: "Where is God?" / A: "God is everywhere."

Output ONLY valid JSON matching this schema:
{
  "theme": "string - short, inspiring title",
  "liturgy": {
    "hymn": "string - MUST be from the AVAILABLE HYMNS list",
    "hymn_id": "string - the id from the AVAILABLE HYMNS list",
    "catechism_q": number,
    "catechism_question": "string",
    "catechism_a": "string",
    "scripture": "string (single verse reference)"
  },
  "family_activity": {
    "title": "string",
    "description": "string - 2-3 sentences",
    "skill_domain": "literacy|numeracy|formation|motor|nature",
    "targets_covered": ["subject:skill", ...],
    "formation_lens": "string - theological connection",
    "materials": ["string", ...],
    "duration_minutes": number (10-30),
    "location": "indoor|outdoor|either",
    "levels": [{"child_name": "string", "stage": "string", "role": "Observer|Participant|Helper|Leader", "instruction": "string"}]
  },
  "book_nook": {
    "id": "string - MUST be from the AVAILABLE BOOKS list",
    "title": "string - MUST be from the AVAILABLE BOOKS list",
    "discussion_prompt": "string"
  },
  "reasoning": "string - brief explanation for parent"
}
```

### Test 1 — Fresh generation (User Prompt):

```text
Generate Daily Anchor for Day 3 of 14.
Date: 2026-02-11
```

### Test 2 — Adjustment (User Prompt):

```text
Generate Daily Anchor for Day 3 of 14.
Date: 2026-02-11

CURRENT PLAN (the parent wants to change this):
{
  "theme": "God's Order in Nature",
  "liturgy": { "hymn": "A Mighty Fortress", "hymn_id": "hymn_mighty_fortress", "catechism_q": 1, "catechism_question": "Who made you?", "catechism_a": "God made me.", "scripture": "Psalm 19:1" },
  "family_activity": { "title": "Leaf Sorting & Patterning", "description": "Go outside and collect leaves. Sort by size, color, shape. Create A-B-A-B patterns.", "skill_domain": "numeracy", "targets_covered": ["numeracy:patterns", "nature:observation"], "formation_lens": "God created diversity and order.", "materials": ["leaves", "magnifying glass"], "duration_minutes": 20, "location": "outdoor", "levels": [{"child_name": "Samuel Nakamya", "stage": "sapling", "role": "Leader", "instruction": "Create patterns"}, {"child_name": "Esther Nakamya", "stage": "sprout", "role": "Participant", "instruction": "Find leaves"}, {"child_name": "Baby Joel Nakamya", "stage": "seedling", "role": "Observer", "instruction": "Watch"}] },
  "book_nook": { "id": "athanasius", "title": "Athanasius", "discussion_prompt": "What did Athanasius stand for?" },
  "reasoning": "Day 3 focuses on patterns and nature observation."
}

Parent's request: "Can we do something indoors instead? It's raining."
```

*Expected: AI modifies the plan to be indoor, keeps the same liturgy/book or picks from the constrained lists, does NOT invent books or hymns.*

### Test 3 — With context (User Prompt):

```text
Generate Daily Anchor for Day 5 of 14.
Date: 2026-02-13

CONTEXT:
Weather: Rainy - suggest indoor activities
Time available: 15 minutes
Parent mood: Suggest low-prep activities today
```

---

## 3. Formation Arc Generator (Curriculum Planner)
*Creates the 2-week plan. Sends the largest payload including family state and a human-readable PROGRESS SUMMARY.*

### Setup Instructions
1.  **Model:** `gemini-3-flash-preview`
2.  **Response MIME type:** `application/json`
3.  **System Instructions:**

```text
You are a Reformed Christian homeschool curriculum planner.
Create a 2-week "Formation Arc" with 14 daily unified anchors for this family.

CRITICAL: Each day has EXACTLY:
1. LITURGY: One hymn, one verse, one catechism question (same for all children)
2. ONE ACTIVITY: Cross-curricular, hitting multiple skill targets at once
   - Each child gets a ROLE appropriate to their stage
   - Activity should be practical: baking, gardening, crafts, games, outdoor play
3. ONE BOOK: Shared family read-aloud

STAGES (assign roles based on these):
- Seedling (0-24 mos): Observes, touches materials, hears words
- Sprout (2-4 yrs): Participates with help, simple tasks, imitation
- Sapling (4-7 yrs): Follows instructions, counts, traces letters, narrates
- Tree (7+ yrs): Leads, teaches younger siblings, writes

SUBJECT WEIGHTING (activities should implicitly cover):
- Literacy: 5x/week (rhyme, phonics, letters, vocabulary)
- Formation: daily (woven into liturgy + character during activity)
- Numeracy: 3-4x/week (counting, patterns, shapes)
- Motor Skills: 2-3x/week (gross motor, fine motor, pre-writing)

Output ONLY valid JSON matching the FormationArc interface.
```

### Test (User Prompt):

```text
Generate a 2-week Formation Arc:

FAMILY:
[
  {
    "id": "child-1",
    "name": "Samuel Nakamya",
    "age_months": 56,
    "stage": "sapling",
    "mastered_skills": ["counting_1_to_10", "colors"]
  },
  {
    "id": "child-2",
    "name": "Esther Nakamya",
    "age_months": 27,
    "stage": "sprout",
    "mastered_skills": []
  },
  {
    "id": "child-3",
    "name": "Baby Joel",
    "age_months": 5,
    "stage": "seedling",
    "mastered_skills": []
  }
]

PROGRESS SUMMARY:
This family is at the following points in their curriculum:
- literacy: Week 1/52, focus on "phonological_awareness" (skills: rhyme_recognition, sound_discrimination)
- numeracy: Week 1/52, focus on "early_number_sense" (skills: counting_objects, number_recognition)
- formation: Week 1/52, focus on "character_development" (skills: obedience, kindness)
- motor: Week 1/52, focus on "motor_development" (skills: gross_motor, fine_motor)

CURRENT WEEK TARGETS (structured):
[
  {
    "subject": "literacy",
    "week": 1,
    "focus": "phonological_awareness",
    "skills": ["rhyme_recognition", "syllable_clapping", "letter_sounds"]
  },
  {
    "subject": "numeracy",
    "week": 1,
    "focus": "early_number_sense",
    "skills": ["counting_objects", "number_recognition", "simple_patterns"]
  }
]

AVAILABLE RESOURCES:
- Books: [{"id": "athanasius", "title": "Athanasius"}, {"id": "augustine", "title": "Augustine"}, {"id": "cyprian", "title": "Cyprian"}, {"id": "perpetua", "title": "Perpetua"}]
- Hymns: [{"id": "hymn_mighty_fortress", "title": "A Mighty Fortress"}, {"id": "hymn_amazing_grace", "title": "Amazing Grace"}, {"id": "hymn_great_is_thy", "title": "Great Is Thy Faithfulness"}, {"id": "hymn_how_great", "title": "How Great Thou Art"}, {"id": "hymn_holy_holy", "title": "Holy, Holy, Holy"}]
- Catechism Questions: [{"number": 1, "question": "Who made you?"}, {"number": 2, "question": "What else did God make?"}, {"number": 3, "question": "Why did God make you and all things?"}, {"number": 4, "question": "How can you glorify God?"}, {"number": 5, "question": "Why are you to glorify God?"}]

Generate 14 daily plans. Each activity should hit 2-3 skill targets from different subjects.
Materials should be common household items only.
```

---

## 4. Spine Generator (Admin Only)
*Generates standard scope & sequence. No changes needed.*

### Setup Instructions
1.  **Model:** `gemini-3-flash-preview`
2.  **Response MIME type:** `application/json`
3.  **System Instructions:**

```text
You are an expert Early Childhood Curriculum Planner.
Output a standard, research-backed scope and sequence for the requested subject/stage.
Output a linear weekly progression. Do not invent new pedagogies; use standard developmental norms.

STAGE DEFINITIONS:
- Seedling (0-24 months): Sensory exploration, observation, parental modeling
- Sprout (2-4 years): Participation, habit formation, simple truths
- Sapling (4-7 years): Understanding, memory work, narration
- Tree (7+ years): Leadership, theological depth, service

SUBJECT GUIDELINES:
- Literacy: Phonological Awareness → Phonics → Fluency
- Numeracy: Rote counting → 1-to-1 correspondence → Number recognition → Simple operations
- Motor: Gross motor → Fine motor → Pre-writing skills
- Formation: Obedience → Kindness → Self-control → Gratitude

FAITH FRAMING:
Each entry should include a brief theological reflection connecting the skill to Christian formation.
Example: "Counting objects: God made each one with purpose and order."

Output ONLY a JSON array of objects with: week_number, focus_area, skill_targets (array of 2-4 items), faith_framing.
```

### Test (User Prompt):

```text
Generate a standard scope & sequence:
- Subject: literacy
- Stage: sapling
- Weeks: 1 to 12 (12 weeks total)

Return a JSON array with one entry per week.
```
