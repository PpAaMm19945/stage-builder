# Curriculum Review Process

## Overview

This document outlines the process for reviewing and expanding the SchoolOS activity catalog to ensure quality, coverage, and alignment with family-friendly materials.

## Exporting the Current Catalog

### API Endpoint
```bash
GET /api/activities/export
```

**Authentication Required**: Yes (any authenticated user)

**Response**: JSON array of all activities with complete metadata

### Example Usage
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://stage-builder.antmwes104-1.workers.dev/api/activities/export \
  > activities_export.json
```

## Review Criteria

### 1. Materials Requirements
- **Maximum materials per activity**: 3-5 items
- **Prioritize**: Common household items, core kit materials
- **Flag**: Activities requiring specialized/expensive materials

### 2. Core Kit Activities
- Check `uses_core_kit` flag (should be `1` or `true`)
- Core kit should include: blocks, balls, paper, crayons, books
- Aim for 60%+ of activities using only core kit

### 3. Nature-Ready Activities
- Activities using natural materials: sticks, rocks, leaves, water
- "No-material" activities: songs, movement games, storytelling
- Should represent 20-30% of total catalog

### 4. Tier Coverage
- Each activity should have `tiered_expectations` for multiple age ranges
- Verify age ranges don't have gaps:
  - Tier 1: Youngest age range (e.g., 18-30 months)
  - Tier 2: Middle age range (e.g., 31-48 months)
  - Tier 3: Oldest age range (e.g., 49-72 months)

### 5. Domain Balance
Ensure balanced coverage across:
- `cognitive`: Problem-solving, memory
- `motor`: Gross & fine motor skills
- `language`: Speech, vocabulary
- `social-emotional`: Cooperation, emotions
- `pre-academic`: Sorting, patterns, early math

## Identifying Gaps

### By Age Band
Count activities per age range:
```sql
SELECT 
  CASE 
    WHEN min_age_months < 24 THEN '12-24 months'
    WHEN min_age_months < 36 THEN '24-36 months'
    WHEN min_age_months < 48 THEN '36-48 months'
    ELSE '48+ months'
  END as age_band,
  COUNT(*) as activity_count
FROM activities
WHERE is_active = 1
GROUP BY age_band;
```

### By Domain
```sql
SELECT domain, COUNT(*) as count
FROM activities
WHERE is_active = 1
GROUP BY domain
ORDER BY count DESC;
```

## Adding New Activities

### Priority Areas (Based on User Feedback)
1. **Toy cars** - role play, ramps, sorting
2. **Blocks** - building, patterns, counting
3. **Paper & crayons** - drawing, tracing, cutting
4. **Nature walks** - scavenger hunts, collecting, observing
5. **Zero-material** - movement games, songs, pretend play

### Migration Pattern

Use the existing migration pattern from `cloudflare/migrations/0007_tiered_expectations.sql`:

```sql
-- Example: Adding a new "Car Ramp Building" activity
INSERT INTO activities (
  id, title, description, domain,
  min_age_months, max_age_months,
  duration_minutes, difficulty,
  materials, instructions, learning_outcomes,
  activity_type, tiered_expectations,
  uses_core_kit, mess_level, prep_time_minutes,
  is_active
) VALUES (
  'act-car-ramps-001',
  'Build a Car Ramp',
  'Create ramps and race toy cars to learn about gravity and speed',
  'cognitive',
  24, 60,
  15, 2,
  '["Toy Cars", "Books or Blocks", "Cardboard"]',
  '["Stack books to make a ramp", "Roll cars down", "Try different heights"]',
  '["Understands cause and effect", "Experiments with angles", "Vocabulary: fast, slow, high, low"]',
  'family_session',
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Roll car down ramp, watch it go"},
    {"age_min":37,"age_max":48,"tier":"Tier 2","expectation":"Build own ramp, race 2 cars"},
    {"age_min":49,"age_max":60,"tier":"Tier 3","expectation":"Test different ramp heights, predict which is faster"}
  ]',
  1, -- uses_core_kit (cars are common)
  2, -- low mess
  3, -- 3 min prep
  1  -- is_active
);
```

### Activity Creation Checklist
- [ ] Unique ID (format: `act-{topic}-{number}`)
- [ ] Clear, parent-friendly title
- [ ] Description explains the value/skill
- [ ] Appropriate domain assignment
- [ ] Realistic age range (min/max months)
- [ ] Duration: 10-20 minutes typical
- [ ] Materials: 3-5 items max, household preferred
- [ ] Step-by-step instructions (3-5 steps)
- [ ] Learning outcomes that map to domain
- [ ] Tiered expectations covering age range
- [ ] `activity_type = 'family_session'` for multi-child activities
- [ ] `uses_core_kit = 1` if only basic materials
- [ ] `mess_level`: 1 (none) to 5 (very high)
- [ ] `prep_time_minutes`: realistic estimate

## Quality Guidelines

### Writing for Tired Parents
- **Instructions**: Max 5 steps, each one sentence
- **Materials**: Use generic names ("blocks" not "LEGO®")
- **Expectations**: Focus on process, not perfection
- **Mess level**: Be honest - parents need to plan

### Testing New Activities
Before adding activities to production:
1. Test with at least 2 children of different ages
2. Verify materials are truly household items
3. Confirm timing is realistic (add 5min buffer)
4. Check that instructions are clear without pictures

## Review Cadence

- **Monthly**: Export catalog, check coverage gaps
- **Quarterly**: User feedback review, retire low-performing activities
- **Ongoing**: Flag activities with low completion rates or negative feedback

## Contact

For curriculum questions or to propose new activities, contact the development team.
