# Enhanced Recommendation Matrix Proposal

## 1. Overview
This document outlines the proposed enhancements to the Activity and Book recommendation engine. The goal is to move from a simple **Age-Based Filtering** model to a **Multi-Factor Suitability Scoring** model. This will increase engagement by matching content to a child's interests, developmental stage, and context.

## 2. Data Schema Enhancements

### 2.1 Student Profile (`Student`)
We need to capture more "texture" about the child to personalize effectively.

```typescript
interface Student {
  // ... existing fields (id, name, ageInMonths) ...

  // NEW FIELDS
  gender: 'boy' | 'girl' | 'prefer_not_to_say'; // For diversity checks & framing

  // School Context (Crucial for 3+)
  gradeLevel?: 'nursery' | 'pre-k' | 'kindergarten' | 'grade-1';

  // Engagement Drivers
  interests: string[]; // e.g., ['dinosaurs', 'space', 'music', 'art']

  // Temperament / Learning Style
  temperament?: 'active' | 'quiet' | 'sensory-seeking' | 'observer';

  // Specific Focus Areas
  learningGoals?: string[]; // e.g., ['motor-skills', 'speech', 'social-confidence']
}
```

### 2.2 Activity Metadata (`Activity`)
Activities need tags to "hook" into the student profile.

```typescript
interface Activity {
  // ... existing fields ...

  // NEW METADATA
  tags: string[]; // e.g., ['dinosaurs', 'outdoor', 'messy', 'music']

  // Energy Requirement (Maps to Temperament)
  energyLevel: 'high' | 'moderate' | 'low';

  // Academic Alignment (for Grade Level logic)
  gradeStandards?: ('nursery' | 'pre-k' | 'kindergarten')[];

  // Gender Nuance (Rarely used for exclusion, mostly for weighting)
  // e.g., "Princess Dress Up" might have high affinity for some, but shouldn't strictly exclude others.
  primaryAppeal?: 'neutral' | 'feminine' | 'masculine';
}
```

### 2.3 Book Metadata (`Book`)
Books are highly interest-driven.

```typescript
interface Book {
  // ... existing fields ...

  topics: string[]; // e.g., ['animals', 'friendship', 'vehicles']
  protagonistGender: 'male' | 'female' | 'mixed' | 'animal'; // For diversity rotation

  // Text complexity
  lexileLevel?: string; // e.g., "BR" (Beginning Reader) or "200L"
}
```

---

## 3. The New Logic: Suitability Score

Instead of a boolean `true/false` (Is Age Valid?), we calculate a **Score (0-100)** for every item.

### The Algorithm

`FinalScore = (BaseAgeScore + InterestBonus + GradeMatch + TemperamentMatch) * DiversityMultiplier`

#### 1. Base Age Score (0-50 pts)
*   **Perfect Match:** Age is in the middle of `min` and `max`. (50 pts)
*   **Edge Match:** Age is near the `min` or `max`. (30 pts)
*   **Invalid:** Age is outside range. (0 pts - Filtered out)

#### 2. Interest Bonus (+30 pts)
*   If `Activity.tags` overlap with `Student.interests`:
    *   1 match: +15 pts
    *   2+ matches: +30 pts

#### 3. Grade/Skill Match (+20 pts)
*   **For Ages 3+:** If `Activity.gradeStandards` includes `Student.gradeLevel`, add 20 pts.
*   *Why?* Ensures we suggest school-relevant skills (e.g., cutting with scissors for Pre-K).

#### 4. Temperament Alignment (+10 pts)
*   `Student.temperament = 'active'` + `Activity.energyLevel = 'high'` = +10 pts.
*   `Student.temperament = 'quiet'` + `Activity.energyLevel = 'low'` = +10 pts.
*   *Mismatch:* 0 pts (Don't penalize too heavily, opposites are good for growth).

#### 5. Diversity Rotation (Book Specific)
*   Track recent history.
*   If last 3 books had `protagonist: male`, multiply `female` books by 1.5x.
*   *Goal:* Ensure balanced exposure regardless of user gender.

---

## 4. Implementation Stages

1.  **Phase 1: Data Collection**
    *   Update `Student` schema.
    *   Add UI in "Edit Profile" to collect these new fields.
    *   Update `Activity` data file to include `tags` and `energyLevel` for existing items.

2.  **Phase 2: Logic Engine**
    *   Rewrite the recommendation function to use the Scoring Algorithm.
    *   Update the "Daily Activities" dashboard to sort by Score.

3.  **Phase 3: Feedback Loop**
    *   Add "Did they like this?" buttons.
    *   Update `Student.interests` automatically based on liked activities.
