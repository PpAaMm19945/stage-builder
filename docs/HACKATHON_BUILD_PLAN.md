# Hackathon Build Plan

> **Hackathon:** Gemini 3 Hackathon  
> **Deadline:** February 10, 2026 @ 4:00am GMT+3  
> **Prize Pool:** $100,000 ($50k Grand Prize)

---

## Submission Requirements

1. **Text description** (~200 words) - How Gemini 3 is used
2. **Public demo link** - Working product or AI Studio app
3. **Code repository** - Public GitHub
4. **3-minute video** - Demo and explanation

---

## What We're Submitting

**HomeLine Academy** - A Reformed Christian family formation platform that uses Gemini 3 to:

1. **Age-Adapt Content**: Catechism, hymns, and Bible verses automatically simplified for different age stages (Seedling → Oak)
2. **Generate History Stories**: Short narratives extracted from full chapters for younger children
3. **Recommend Formations**: Daily activity suggestions based on child's age, family rhythm, and available time
4. **Explain with Parent Posture**: AI explanations that coach the parent, not the child

---

## Judging Criteria Alignment

| Criteria | Weight | How We Score |
|----------|--------|--------------|
| **Technical Execution** | 40% | Deep Gemini integration for content generation, age-scaling, and recommendation |
| **Innovation** | 30% | Reformed-theology-constrained AI (unique ethical framework) |
| **Impact** | 20% | Affordable education for African families |
| **Presentation** | 10% | Clear demo showing age-stage switching |

---

## Build Priorities (30 Days)

### Week 1: Foundation (Jan 12-19)
- [x] Complete documentation update (README, AI_CONTEXT, ROADMAP)
- [x] Create liturgy_progressions schema (Migration 0039)
- [x] Seed WSC Q11-Q38 (Migration 0040)
- [ ] Complete WSC Q39-Q107
- [ ] Create all age-stage progressions for Q1-Q20
- [ ] Import hymns from reformed-hymns folder

### Week 2: Content (Jan 20-27)
- [ ] Create Chapter 1 short stories (Sprout/Sapling level)
- [ ] Design World History integration points
- [ ] Create 52-week memory verse plan
- [ ] Batch generate initial images for 1-2 books

### Week 3: AI Integration (Jan 28 - Feb 4)
- [ ] Migrate AI to Gemini 3 API
- [ ] Implement age-stage content generation
- [ ] Build "This Week's Liturgy" dashboard view
- [ ] Create history reader component

### Week 4: Polish (Feb 5-9)
- [ ] Record 3-minute demo video
- [ ] Write 200-word Gemini integration description
- [ ] Deploy to production
- [ ] Final testing and bug fixes

---

## Gemini 3 Integration Points

### 1. Age-Stage Content Paraphrasing
```
System: You are a Reformed Christian educator. Paraphrase the following catechism question for a [seedling|sprout|sapling] child. Use simple words. Do not change the theology.

Input: WSC Q4 + target stage
Output: Simplified content + memory portion + parent teaching note
```

### 2. History Story Generation
```
System: You are a storyteller for Christian children. Create a 2-minute story about [topic] for a [age-stage] child. Use the biblical framework from Chapter 1. Include names: Cush, Mizraim, Phut.

Input: Chapter excerpt + target stage
Output: Short narrative story
```

### 3. Daily Formation Recommendation
```
System: You are a Christian family formation assistant. Given this family's context, recommend formations for today. Prioritize liturgy, then history, then activities. Never recommend more than the parent can handle.

Input: Children ages, available time, day of week, current phase
Output: Formation list with context anchors
```

---

## Demo Script (3 minutes)

**0:00-0:30** - Problem: Education is expensive and complex for African families
**0:30-1:00** - Solution: HomeLine Academy with Gemini 3 AI
**1:00-2:00** - Demo: Show age-stage catechism switching (same Q, different levels)
**2:00-2:30** - Demo: Show daily rhythm generation
**2:30-3:00** - Impact: Theological constraints, no grades, family-first

---

## Known Gaps (Acceptable for Hackathon)

1. **Images**: Not all books have illustrations (placeholder acceptable)
2. **Full History**: Only Chapter 1-3 may be complete
3. **All WSC**: May only have Q1-50 fully paraphrased
4. **Upper grades**: Tree/Oak content is foundational (chapters exist)

---

## API Key Integration

The hackathon provides access to Gemini 3 API. To integrate:

1. Get API key from Google AI Studio
2. Add to Cloudflare Worker environment:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
3. Update `/cloudflare/src/index.ts` to use Gemini 3 endpoints

---

## Success Criteria

✅ A family can sign up and run a week of formation  
✅ AI generates age-appropriate liturgy  
✅ History stories render for at least Chapter 1  
✅ Demo video clearly shows Gemini 3 integration  
✅ Code is clean and theological constraints are visible
