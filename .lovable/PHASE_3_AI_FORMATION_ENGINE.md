# FamilyPath AI Formation Engine — Complete Specification

> **Version**: 1.0  
> **Status**: Approved for Implementation  
> **Last Updated**: January 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Identity & Trust](#2-platform-identity--trust)
3. [The AI Formation Advisor](#3-the-ai-formation-advisor)
4. [Book Experience & Content Delivery](#4-book-experience--content-delivery)
5. [Progressive Planning System](#5-progressive-planning-system)
6. [Automated Progress Tracking](#6-automated-progress-tracking)
7. [The Chatbot ("Frontdesk Officer")](#7-the-chatbot-frontdesk-officer)
8. [Onboarding System](#8-onboarding-system)
9. [Notification System](#9-notification-system)
10. [Weekly Reporting](#10-weekly-reporting)
11. [Data Model Changes](#11-data-model-changes)
12. [Technical Architecture](#12-technical-architecture)
13. [Implementation Phases](#13-implementation-phases)
14. [Success Metrics](#14-success-metrics)

---

## 1. Executive Summary

### What We're Building

FamilyPath is transforming from a **rigid library path system** into an **intelligent family formation advisor**. The AI becomes a thoughtful curator that:

- Knows each family's children, time, and goals
- Plans progressively (each day builds on the last)
- Explains its decisions transparently
- Tracks progress automatically
- Reports weekly achievements

### Core Principles

1. **Trust First**: Earn trust before asking for data
2. **AI as Algorithm**: Maximum efficiency with full explainability
3. **Parent Sovereignty**: AI suggests, parents decide, parents can override
4. **Progressive Formation**: Days are connected, not isolated events
5. **Minimal Friction**: Completion is automatic; exceptions are manual

### The Vision Statement

> "FamilyPath is your family's formation companion. 15 minutes a day — a catechism question, a hymn, and a story — curated by AI, owned by you."

---

## 2. Platform Identity & Trust

### 2.1 The Trust Problem

Parents in 2024 are rightfully skeptical of apps that collect family data. Before asking for any information about children, we must answer:

> "Why should I trust you with information about my family?"

### 2.2 The Trust Covenant

A dedicated page (`/trust`) that parents can read before signing up. This is not a privacy policy in legalese — it's a human promise.

**The FamilyPath Covenant:**

```
We, the builders of FamilyPath, make these promises to you:

1. YOUR CHILDREN ARE NOT PRODUCTS
   We never sell data about your children. Period. Not to advertisers,
   not to "partners," not to anyone.

2. YOU OWN YOUR DATA
   Export everything anytime. Delete everything anytime.
   No questions, no waiting periods, no tricks.

3. AI SERVES YOU
   Our AI recommends. You decide. Always.
   Every AI action is logged and reversible.

4. NO DARK PATTERNS
   No guilt notifications. No streaks that shame.
   No tricks to keep you engaged.

5. TRANSPARENCY
   If we ever change these terms, we tell you first.
   You can leave anytime with all your data.
```

### 2.3 What Data We Collect (And Why)

| Data | Why We Need It | What We Do NOT Do |
|------|----------------|-------------------|
| Child's name | Personalize experience ("Good morning, Azie!") | Share with third parties |
| Child's birthdate | Select age-appropriate content | Store beyond what's needed |
| Parent email | Account recovery only | Send marketing emails |
| Progress data | Show accomplishments, plan next steps | Sell to EdTech companies |
| Time preferences | Schedule appropriately | Track when you're "active" |

### 2.4 Trust Indicators Throughout the App

- **Login Page**: "Your data is never sold" badge
- **Settings**: "Export All Data" button prominently displayed
- **Child Add Form**: "We only use this to select age-appropriate content"
- **Footer**: Link to Trust Covenant on every page

### 2.5 Minimal Data Principle

- Start with minimal data (just email to sign up)
- Ask for more only when needed
- Always explain WHY before asking
- Never require upfront data that's used later

---

## 3. The AI Formation Advisor

### 3.1 Role Definition

The AI is an **algorithm for maximum parental efficiency** with full explainability. It is NOT:

- A replacement for parental judgment
- An autonomous agent that acts without permission
- A tracker that monitors children's behavior
- A teacher that instructs children directly

It IS:

- A curator that selects from the library
- A planner that organizes the week
- An explainer that justifies every choice
- A reporter that summarizes progress

### 3.2 AI Decision Transparency

Every AI recommendation must be explainable. Examples:

**Book Selection:**
> "I'm suggesting 'Augustine: The Boy Who Ran' because:
> 1. It's next in the African Fathers series you're reading
> 2. The grace theme connects to yesterday's catechism (Q15)
> 3. At 8 pages, it fits your 15-minute morning slot
> 4. Azie (7) can read it aloud to Arie (3) — building Azie's fluency while Arie absorbs the story"

**Schedule Adjustment:**
> "I'm making Fridays lighter because:
> 1. You mentioned Friday evenings are busy
> 2. The catechism and hymn take 5 minutes combined
> 3. The week's book reading will be complete by Thursday
> 4. This preserves momentum without overwhelming the end of week"

**Efficiency Insight:**
> "By having Azie read to Arie, you get 'stacked formation':
> - Azie practices reading fluency
> - Arie absorbs vocabulary and narrative
> - Both hear the same story for family discussion
> - One activity, two children, double impact"

### 3.3 AI Constraints

1. **Never act without confirmation** (except automatic completion tracking)
2. **Always log actions** to the action history
3. **Stay within the library** — only suggest content that exists
4. **Respect time constraints** — never plan more than available time
5. **Respect preferences** — if parent says "no hymns Monday," honor it

---

## 4. Book Experience & Content Delivery

### 4.1 Dual Delivery Mode

Every book offers two ways to experience it:

**Mode 1: Read Now (Digital)**
- Opens in-app carousel/reader
- Swipe through pages on screen
- Optimized for tablets and phones
- Completion tracked automatically when reader closes

**Mode 2: Download to Print**
- Generates print-optimized PDF
- Includes optional discussion questions at end
- Parent prints, binds, reads physically
- Completion logged manually via "Mark as Read" button

### 4.2 Book Card Design

When AI suggests a book, the card displays:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Cover Image]                                                  │
│                                                                 │
│  "Augustine: The Boy Who Ran from God"                         │
│  African Men of Faith Series • Book 3 of 12                    │
│                                                                 │
│  📖 8 pages • ⏱ 10 min read • 👶 Ages 3-8                      │
│                                                                 │
│  WHY TODAY:                                                     │
│  "Continues the series. The grace theme connects to            │
│  yesterday's catechism. Azie can read to Arie."                │
│                                                                 │
│  ┌─────────────┐  ┌─────────────────────┐                      │
│  │  📖 Read Now │  │  🖨️ Download PDF    │                      │
│  └─────────────┘  └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Progressive Book Reading

For longer books or series:

- AI tracks current page/chapter position
- If a reading session is incomplete, it resumes next time
- Weekly plan shows: "Continue Augustine (pages 5-8)"
- Series progress visible: "Book 3 of 12 in African Fathers"

### 4.4 Book Library Organization

**Series Collections:**
- African Men of Faith (picture books)
- Pastor Curtis Knapp (theological booklets)
- Scripture Stories (Bible narratives)

**Metadata for Each Book:**
- Title, author, series
- Page count, estimated read time
- Age range (min/max months)
- Topics/themes (for AI connections)
- Reading level: read-aloud / read-together / independent

---

## 5. Progressive Planning System

### 5.1 Core Principle: Days Are Connected

The AI does not plan each day in isolation. Instead:

- **Monday's activities inform Tuesday's**
- **Uncompleted work carries forward gracefully**
- **The week tells a coherent story**

### 5.2 Weekly Plan Structure

The weekly plan is generated once and stored. It contains:

```
Week of January 20-26, 2026

MONDAY
├── Morning (20 min available)
│   ├── Catechism Q15 (5 min) — All children
│   ├── Hymn: A Mighty Fortress (5 min) — All children
│   └── Book: Augustine pages 1-4 (10 min) — Azie reads to Arie
│
└── Evening (10 min available)
    └── Scripture: Psalm 23 review (10 min) — All children

TUESDAY
├── Morning (20 min available)
│   ├── Catechism Q16 (5 min)
│   ├── Hymn: A Mighty Fortress review (3 min)
│   └── Book: Augustine pages 5-8 (12 min)
...
```

### 5.3 Regeneration Rules

**When parent requests regeneration mid-week:**

1. **Past days are FROZEN** — Monday's plan stays as-is
2. **Today can be modified** — If it's Tuesday afternoon, today can change
3. **Future days regenerate** — Wednesday onward get new plans
4. **Uncompleted items are considered** — AI asks: "Monday's book wasn't finished. Should I add it to today?"

**Regeneration Prompt:**
> "You're regenerating on Tuesday. Here's what I'll do:
> - Monday is locked (already passed)
> - Tuesday can be adjusted
> - Wednesday-Friday will be replanned
> 
> I notice Augustine pages 5-8 weren't completed. Should I:
> [Add to Tuesday] [Move to Wednesday] [Skip and continue]"

### 5.4 Graceful Fallback for Uncompleted Activities

**Activity Types and Fallback Behavior:**

| Activity Type | If Not Completed | Fallback Behavior |
|---------------|------------------|-------------------|
| Book (progressive) | Pages 5-8 not read | Auto-transfer to next day |
| Catechism | Q15 not done | Add to next day's queue |
| Hymn | Not sung | Optional: repeat or skip |
| Scripture memory | Verse not reviewed | Extend review period |
| Hands-on activity | Craft not done | Skip (non-progressive) |

**Progressive Activities:**
- Book reading (page-based)
- Scripture memory (verse-based)
- Catechism (question-based)

These NEVER get skipped silently. They transfer forward.

**Non-Progressive Activities:**
- Hymn singing (can repeat or skip)
- Hands-on crafts (if missed, offer alternative)
- Discussion prompts (if missed, skip)

These CAN be skipped with notification.

### 5.5 End-of-Day Summary

At the end of each day (or when parent opens app next morning), show:

```
┌─────────────────────────────────────────────────────────────────┐
│  MONDAY SUMMARY                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Catechism Q15 — Completed                                   │
│  ✅ Hymn: A Mighty Fortress — Completed                         │
│  ⏳ Book: Augustine pages 1-4 — In Progress (page 2)           │
│                                                                 │
│  Tomorrow: Augustine pages 2-8 (continuing from page 2)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Automated Progress Tracking

### 6.1 Core Principle: Completion Should Be Automatic

Parents are busy. Clicking "Mark Complete" for every activity adds friction. Instead:

> **Interaction = Completion** (with override option)

### 6.2 Completion Triggers by Activity Type

| Activity Type | Completion Trigger | Override Option |
|---------------|-------------------|-----------------|
| Book (digital read) | Close the reader | "We didn't finish" button |
| Book (pages) | Reach last page or close after 2+ pages | "Mark incomplete" |
| Catechism | View answer or close question card | "We skipped this" |
| Hymn | Play audio ends OR close after 30+ seconds | "Didn't sing today" |
| Scripture | View verse for 10+ seconds | "Need to review again" |
| Video | Watch 80%+ of video | "Didn't watch" |
| PDF/Print | Download triggered | "Mark when read" (manual) |

### 6.3 The Completion Flow

**Automatic Completion (Default):**

1. Parent taps "Read Now" on a book
2. Parent reads with children, closes reader
3. System logs: "Augustine completed at 8:42 AM"
4. Toast appears: "Augustine marked complete ✓ [Undo]"
5. If parent taps Undo within 5 seconds, completion is reversed

**Manual Override:**

If parent closes early or needs to mark incomplete:
- "We didn't finish" button in reader
- "Mark incomplete" in daily summary
- AI adjusts next day accordingly

### 6.4 Progress States

Each activity can be in one of these states:

| State | Meaning | Visual |
|-------|---------|--------|
| `upcoming` | Scheduled for later today | Gray, no icon |
| `current` | Ready to start now | Primary color, "Start" button |
| `in_progress` | Started but not finished | Yellow, progress bar |
| `completed` | Finished | Green checkmark |
| `skipped` | Parent chose to skip | Gray strikethrough |
| `transferred` | Moved to next day | Orange arrow |

### 6.5 Progress Data Storage

```
activity_progress:
  - id: uuid
  - family_id: ref
  - activity_type: 'book' | 'catechism' | 'hymn' | 'scripture' | 'video'
  - content_id: ref (book_id, question_number, etc.)
  - scheduled_date: date
  - status: 'upcoming' | 'current' | 'in_progress' | 'completed' | 'skipped' | 'transferred'
  - started_at: timestamp | null
  - completed_at: timestamp | null
  - progress_data: json (page number, seconds watched, etc.)
  - completion_source: 'auto' | 'manual'
  - transferred_to: date | null
```

---

## 7. The Chatbot ("Frontdesk Officer")

### 7.1 Complete Rebuild Required

The current chatbot has fundamental issues:
- Weak AI model (Llama 3 8B)
- Fragile action parsing (regex-based)
- Buttons that fail silently
- No confirmation before actions
- No action logging

**Solution: Complete architecture rebuild using Lovable AI Gateway.**

### 7.2 The Frontdesk Officer Persona

The chatbot is the **FamilyPath Frontdesk Officer** — helpful, capable, but never autonomous.

**Personality Traits:**
- Warm but efficient
- Explains reasoning without lecturing
- Asks for confirmation before acting
- Remembers context from conversation
- Never makes parents feel judged

**System Prompt Core:**
```
You are the FamilyPath Frontdesk Officer.

YOUR ROLE:
- First point of contact for families
- Greet, help, and get things done
- You have many capabilities but always ask before acting

YOUR RULES:
1. NEVER act without confirmation
2. ALWAYS explain your reasoning briefly
3. KEEP IT SIMPLE — most parents have 5 minutes
4. LOG EVERYTHING — every action is recorded
5. STAY IN YOUR LANE — you suggest, parents decide

YOUR TONE:
- Warm, not corporate
- Efficient, not rushed
- Humble, not preachy
- Encouraging, not guilt-inducing
```

### 7.3 Chatbot Capabilities

The frontdesk officer can:

| Capability | Example | Confirmation Required |
|------------|---------|----------------------|
| Suggest today's rhythm | "What should we do today?" | No (read-only) |
| Explain a choice | "Why this book?" | No (read-only) |
| Adjust schedule | "Make Fridays lighter" | Yes |
| Skip an activity | "Skip today's hymn" | Yes |
| Add a child | "Add my daughter Lily, she's 5" | Yes |
| Report progress | "How did we do this week?" | No (read-only) |
| Answer questions | "What is total depravity?" | No (read-only) |
| Log observation | "Azie loved the Augustine story" | Yes (logs to profile) |

### 7.4 Confirmation Before Action Pattern

**Current (Broken):**
```
User: "Make Fridays lighter"
Bot: "Done! I've adjusted your schedule."
```

**New (Required):**
```
User: "Make Fridays lighter"

Bot: "I can do that. Here's what I'll change:

BEFORE (Friday):
- Catechism Q20 (5 min)
- Hymn: Be Thou My Vision (5 min)
- Book: Athanasius pages 1-4 (10 min)
- Activity: Nature walk (20 min)

AFTER (Friday):
- Catechism Q20 (5 min)
- Hymn: Be Thou My Vision (5 min)

I'm removing the book and activity. The book will move to Thursday.

[✓ Confirm Change]  [✗ Cancel]  [Adjust]"
```

### 7.5 Action Logging

Every action the AI takes is logged:

```
ai_action_log:
  - id: uuid
  - family_id: ref
  - action_type: 'schedule_change' | 'skip_activity' | 'add_child' | 'log_observation'
  - action_data: json (what changed)
  - reason: string (AI's explanation)
  - status: 'pending' | 'confirmed' | 'rejected'
  - created_at: timestamp
  - confirmed_at: timestamp | null
  - confirmed_by: 'parent' | 'auto'
```

**Parents can review:**
- Settings → "AI Actions" shows history
- "This week, the AI made 3 changes. [Review]"
- Any action can be reversed within 7 days

### 7.6 Three Chat Modes (Seamlessly Integrated)

The chat automatically detects intent and responds appropriately:

**Mode 1: Primary Interface**
> "What should we do today?"
> → Returns today's rhythm with explanations

**Mode 2: Adjustment Tool**
> "Skip the book today"
> → Confirms, makes change, logs it

**Mode 3: Coaching Companion**
> "How did we do this week?"
> → Summarizes progress, offers encouragement

### 7.7 Technical Implementation

**AI Provider: Lovable AI Gateway**
- Model: `google/gemini-3-flash-preview`
- Method: Tool calling for structured output
- Streaming: Yes, for conversational responses

**Tool Calling Schema:**
```typescript
tools: [
  {
    name: "get_todays_rhythm",
    description: "Retrieve today's formation activities",
    parameters: {}
  },
  {
    name: "adjust_schedule",
    description: "Modify the family's weekly schedule",
    parameters: {
      changes: [{ day, action, activity_id, reason }]
    }
  },
  {
    name: "skip_activity",
    description: "Skip a specific activity",
    parameters: {
      activity_id, reason, transfer_to_date
    }
  },
  {
    name: "log_observation",
    description: "Record a parent's observation",
    parameters: {
      child_id, observation_text, sentiment
    }
  },
  {
    name: "generate_report",
    description: "Generate weekly progress report",
    parameters: {
      week_start, include_insights
    }
  }
]
```

---

## 8. Onboarding System

### 8.1 Three Onboarding Modes

Different parents have different comfort levels. Offer choice:

**Mode 1: Quick Start (1 minute)**
- Just add children's names and ages
- Dashboard appears with default rhythm
- AI learns preferences over time through chat

**Mode 2: Guided Setup (5 minutes)**
- Step-by-step wizard
- Collects: children, time availability, goals, preferences
- Personalized from day one

**Mode 3: Conversational Setup**
- Chat-based onboarding
- AI asks questions naturally
- Feels less like a form

### 8.2 Mode Selection Screen

After login, first-time users see:

```
Welcome to FamilyPath!

How would you like to get started?

┌─────────────────────────────────────────────────────────────────┐
│  ⚡ QUICK START                                                  │
│  Just add your children. We'll figure out the rest together.   │
│  Takes about 1 minute.                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📋 GUIDED SETUP                                                 │
│  Answer a few questions for personalized planning from day one. │
│  Takes about 5 minutes.                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  💬 CHAT WITH US                                                 │
│  Tell us about your family in conversation.                     │
│  Natural and easy.                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Quick Start Flow

1. "What's your first child's name?"
2. "When were they born?" (date picker)
3. "Add another child?" (optional loop)
4. → Dashboard with default 15-min morning rhythm

**Post-Quick-Start:**
- Notification bell shows: "Tell us more for better suggestions"
- AI asks follow-up questions in chat over time
- Profile builds gradually

### 8.4 Guided Setup Flow

**Step 1: Your Children**
- Add each child: name, birthdate, optional nickname
- Shows calculated age: "Azie is 7 years old"

**Step 2: Your Time**
- Morning availability: slider (5-60 min)
- Evening availability: slider (0-30 min)
- Which days? (Mon-Sun checkboxes)

**Step 3: Your Goals** (multi-select)
- [ ] Learn the Westminster Catechism
- [ ] Memorize hymns together
- [ ] Read through the African Fathers series
- [ ] Read Pastor Curtis's books
- [ ] Daily family devotions
- [ ] Other: _______________

**Step 4: Preferences** (optional)
- [ ] Skip Sundays (we worship at church)
- [ ] Lighter Fridays
- [ ] No hands-on activities, just reading
- [ ] More hymns, less catechism
- [ ] Custom: _______________

**Step 5: Generate Plan**
- "Creating your family's first week..."
- → Dashboard with personalized rhythm

### 8.5 Conversational Setup Flow

```
AI: "Welcome to FamilyPath! I'm here to help set up your family's 
     formation rhythm. To start, who are the children in your family?"

Parent: "We have Azie who's 7 and Arie who's 3"

AI: "Got it! Azie (7) and Arie (3). Great ages — Azie can start 
     reading aloud to Arie, which is wonderful for both of them.
     
     How much time do you have for formation each day?"

Parent: "Maybe 20 minutes in the morning"

AI: "Perfect. 20 minutes is enough for a catechism question, a hymn, 
     and a short story together.
     
     What would you like to focus on? Some families prioritize:
     - Learning the catechism
     - Memorizing hymns
     - Reading through our book series
     
     Or all of the above?"

Parent: "All of it, but catechism is most important"

AI: "Understood. I'll make catechism the anchor of each day, with hymns 
     and reading to complement it.
     
     Ready for me to create your first week's plan?
     
     [Yes, create my plan]  [I have more to tell you]"
```

---

## 9. Notification System

### 9.1 Core Principle: No Intrusive Pop-ups

Replace persistent, non-closable pop-ups with a **notification bell system**.

### 9.2 Notification Bell Design

```
Header:  [Logo]  FamilyPath                    🔔 (3)  [Profile]
```

When clicked:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 Notifications                                    [Clear All] │
├─────────────────────────────────────────────────────────────────┤
│  📝 Complete your profile for better suggestions       [Dismiss] │
│     Help us personalize your experience                         │
│                                                                 │
│  📊 Your weekly report is ready!                       [View]   │
│     See what your family accomplished                           │
│                                                                 │
│  💡 Tip: Azie might enjoy the Athanasius story        [Dismiss] │
│     Based on how much they liked Augustine                      │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Notification Types

| Type | Urgency | Behavior |
|------|---------|----------|
| Profile incomplete | Low | Badge only, no pop-up |
| Weekly report ready | Medium | Badge + optional push |
| AI suggestion | Low | Badge only |
| Uncompleted progressive activity | Medium | Badge, becomes pop-up after 3 days |
| System message | High | Pop-up (rare) |

### 9.4 Pop-up Rules

Pop-ups are allowed ONLY for:
- Critical account issues (payment failed, account suspended)
- Data loss prevention (unsaved changes)
- First-time feature introduction (once per feature)

All pop-ups must be:
- Closable immediately
- Have a "Don't show again" option
- Never guilt-inducing

### 9.5 Notification Preferences

In Settings, parents can:
- Turn off all non-critical notifications
- Choose push notification preferences
- Set "quiet hours" (no badges update during certain times)

---

## 10. Weekly Reporting

### 10.1 Report Purpose

The AI should report back to parents:
- What was accomplished
- How time was spent
- Insights about efficiency
- Preview of next week

### 10.2 Weekly Report Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 FAMILY FORMATION REPORT                                     │
│  Week of January 20-26, 2026                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FORMATION COMPLETED                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓ 5 Catechism questions learned (Q12-Q16)                     │
│  ✓ 5 Hymns sung (A Mighty Fortress — memorized!)               │
│  ✓ 3 Books read (Augustine, Athanasius, Cyprian)               │
│  ✓ 2 Scripture verses reviewed (Psalm 23, John 3:16)           │
│                                                                 │
│  TIME INVESTED                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Total: 1 hour 45 minutes this week                            │
│  Daily average: 15 minutes                                     │
│  Most active day: Tuesday (25 minutes)                         │
│                                                                 │
│  EFFICIENCY INSIGHTS                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  "By having Azie (7) read to Arie (3), you achieved            │
│   'stacked formation':                                          │
│   • Azie practiced reading fluency                              │
│   • Arie absorbed vocabulary and narrative                      │
│   • Both heard the same story for family discussion             │
│   • One activity, two children, double impact"                  │
│                                                                 │
│  NEXT WEEK PREVIEW                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Continue African Fathers: Perpetua's story                   │
│  • Catechism Q17-Q21 (on grace and salvation)                  │
│  • New hymn: "Be Thou My Vision"                                │
│  • Scripture: Begin Psalm 1 memorization                        │
│                                                                 │
│  [View Full Details]  [Share This Report]                       │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Report Availability

- Generated automatically Sunday evening
- Available in app under Progress → Weekly Reports
- Optional email digest (parent chooses frequency)
- Historical reports always accessible

### 10.4 Report Insights

The AI provides specific insights:

**Efficiency Gains:**
- "Reading together saved 20 minutes vs. separate activities"
- "Morning consistency was 100% this week"

**Pattern Recognition:**
- "Azie engages most with story-based content"
- "Arie is ready for longer reading sessions"

**Encouragement:**
- "You're 40% through the catechism — great progress!"
- "The family has read 12 books together since starting"

---

## 11. Data Model Changes

### 11.1 New Tables

**family_profiles**
```sql
CREATE TABLE family_profiles (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  
  -- Time availability
  morning_minutes INTEGER DEFAULT 15,
  evening_minutes INTEGER DEFAULT 0,
  available_days TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
  
  -- Goals and preferences
  goals TEXT DEFAULT '[]',
  preferences TEXT DEFAULT '{}',
  
  -- Current progress positions
  catechism_position INTEGER DEFAULT 1,
  catechism_source TEXT DEFAULT 'wsc',
  hymn_position INTEGER DEFAULT 1,
  scripture_book TEXT DEFAULT 'psalms',
  scripture_chapter INTEGER DEFAULT 1,
  
  -- Metadata
  onboarding_mode TEXT,  -- 'quick' | 'guided' | 'conversational'
  onboarding_completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**weekly_plans_v2**
```sql
CREATE TABLE weekly_plans_v2 (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  week_start TEXT NOT NULL,  -- Monday date
  
  -- The plan data
  plan_data TEXT NOT NULL,  -- JSON structure of full week
  
  -- Generation metadata
  generated_at TEXT NOT NULL,
  generated_by TEXT DEFAULT 'ai',  -- 'ai' | 'manual'
  regenerated_at TEXT,
  
  -- Frozen days (past days that can't change)
  frozen_through TEXT,  -- Date: days up to this are frozen
  
  UNIQUE(family_id, week_start),
  FOREIGN KEY (family_id) REFERENCES households(id) ON DELETE CASCADE
);
```

**activity_progress**
```sql
CREATE TABLE activity_progress (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  
  -- What activity
  activity_type TEXT NOT NULL,  -- 'book' | 'catechism' | 'hymn' | 'scripture' | 'video'
  content_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'upcoming',  -- upcoming | current | in_progress | completed | skipped | transferred
  started_at TEXT,
  completed_at TEXT,
  
  -- Progress details
  progress_data TEXT,  -- JSON: { page: 4, total_pages: 8 } or { seconds_watched: 120 }
  completion_source TEXT,  -- 'auto' | 'manual'
  
  -- Transfer tracking
  transferred_to TEXT,  -- Date if moved to another day
  transferred_from TEXT,  -- Date if this was transferred here
  
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (family_id) REFERENCES households(id) ON DELETE CASCADE
);
```

**ai_action_log**
```sql
CREATE TABLE ai_action_log (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  
  -- Action details
  action_type TEXT NOT NULL,  -- 'schedule_change' | 'skip_activity' | 'add_child' | 'log_observation'
  action_data TEXT NOT NULL,  -- JSON of what changed
  reason TEXT,  -- AI's explanation
  
  -- Confirmation
  status TEXT DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'rejected'
  confirmed_at TEXT,
  confirmed_by TEXT,  -- 'parent' | 'auto'
  
  -- Reversal
  reversed_at TEXT,
  reversal_reason TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (family_id) REFERENCES households(id) ON DELETE CASCADE
);
```

### 11.2 Modified Tables

**students** — Add fields:
- `observations TEXT` — JSON array of parent observations
- `ai_insights TEXT` — AI-generated insights about the child

**evidences** — Add fields:
- `completion_source TEXT DEFAULT 'manual'` — 'auto' | 'manual'
- `session_data TEXT` — JSON with timing, page progress, etc.

---

## 12. Technical Architecture

### 12.1 System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├──────────────────────────────────────────────────────────────────┤
│  Dashboard ─────────> GET /api/rhythm/today                      │
│  Chat ──────────────> POST /api/chat (streaming)                 │
│  Onboarding ────────> PUT /api/profile                           │
│  Progress ──────────> GET /api/progress/week                     │
│  Reports ───────────> GET /api/reports/weekly                    │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE WORKER (Hono)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐                                                │
│   │  D1 Database │◄── All data storage                           │
│   └─────────────┘                                                │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              AI FORMATION ADVISOR                        │   │
│   │  • Loads family profile                                  │   │
│   │  • Queries library content                               │   │
│   │  • Generates progressive weekly plans                    │   │
│   │  • Tracks completion automatically                       │   │
│   │  • Produces weekly reports                               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │          LOVABLE AI GATEWAY                              │   │
│   │  https://ai.gateway.lovable.dev/v1/chat/completions      │   │
│   │  Model: google/gemini-3-flash-preview                    │   │
│   │  Features: Tool calling, streaming, structured output    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────┐                                                │
│   │  R2 Storage │◄── Book assets, PDFs                          │
│   └─────────────┘                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 12.2 API Endpoints

**Profile Management:**
- `GET /api/profile` — Get family profile
- `PUT /api/profile` — Update profile
- `POST /api/profile/goals` — Update goals

**Rhythm & Planning:**
- `GET /api/rhythm/today` — Get today's activities
- `GET /api/rhythm/week` — Get full week plan
- `POST /api/rhythm/regenerate` — Regenerate (respects frozen days)

**Progress Tracking:**
- `POST /api/progress/start` — Mark activity started
- `POST /api/progress/complete` — Mark activity complete (auto or manual)
- `POST /api/progress/skip` — Skip activity
- `GET /api/progress/week` — Get week's progress

**Chat:**
- `POST /api/chat` — Streaming chat with AI
- `GET /api/chat/actions` — Get AI action history

**Reports:**
- `GET /api/reports/weekly` — Get weekly report
- `GET /api/reports/weekly/:date` — Get specific week's report

**Books:**
- `GET /api/books/:id/pages` — Get book pages for reader
- `GET /api/books/:id/pdf` — Get print-ready PDF

### 12.3 AI Integration

**Provider:** Lovable AI Gateway
**Model:** `google/gemini-3-flash-preview`
**Features Used:**
- Tool calling for structured output
- Streaming for chat responses
- JSON mode for reports

**Rate Limiting:**
- Cache generated plans (only regenerate on request)
- Cache weekly reports (regenerate Sunday)
- Batch library queries

---

## 13. Implementation Phases

### Phase 3A: Foundation (Week 1)
| Task | Priority | Estimate |
|------|----------|----------|
| Create Trust Covenant page | Critical | 3 hours |
| Add trust indicators to login/signup | Critical | 2 hours |
| Set up Lovable AI Gateway client | Critical | 2 hours |
| Create notification bell component | High | 3 hours |
| Remove intrusive pop-ups | Medium | 1 hour |

### Phase 3B: Data Layer (Week 1-2)
| Task | Priority | Estimate |
|------|----------|----------|
| Create family_profiles table | Critical | 1 hour |
| Create weekly_plans_v2 table | Critical | 1 hour |
| Create activity_progress table | Critical | 1 hour |
| Create ai_action_log table | High | 1 hour |
| Migrate existing data | High | 3 hours |

### Phase 3C: Chatbot Rebuild (Week 2)
| Task | Priority | Estimate |
|------|----------|----------|
| New chat component with streaming | Critical | 4 hours |
| Implement tool calling | Critical | 4 hours |
| Confirmation-before-action pattern | Critical | 3 hours |
| Action history view | High | 2 hours |

### Phase 3D: Progressive Planning (Week 3)
| Task | Priority | Estimate |
|------|----------|----------|
| Weekly plan generation | Critical | 4 hours |
| Day freezing logic | Critical | 2 hours |
| Activity transfer logic | Critical | 3 hours |
| End-of-day summary | High | 2 hours |

### Phase 3E: Automated Progress (Week 3)
| Task | Priority | Estimate |
|------|----------|----------|
| Auto-completion triggers | Critical | 4 hours |
| Progress state machine | Critical | 3 hours |
| Override/undo flow | High | 2 hours |
| Progress UI indicators | High | 2 hours |

### Phase 3F: Onboarding (Week 4)
| Task | Priority | Estimate |
|------|----------|----------|
| Mode selection screen | High | 2 hours |
| Quick Start flow | High | 2 hours |
| Guided Setup wizard | High | 4 hours |
| Conversational onboarding | Medium | 4 hours |

### Phase 3G: Reporting (Week 4)
| Task | Priority | Estimate |
|------|----------|----------|
| Weekly report generation | High | 4 hours |
| Report UI component | High | 3 hours |
| AI insights generation | Medium | 3 hours |
| Historical reports view | Medium | 2 hours |

### Phase 3H: Book Experience (Week 5)
| Task | Priority | Estimate |
|------|----------|----------|
| Book metadata normalization | High | 3 hours |
| "Read Now" improvements | High | 3 hours |
| "Download PDF" flow | Medium | 4 hours |
| Page progress tracking | High | 2 hours |

**Total Estimated Time: ~100 hours (5 weeks at 20 hrs/week)**

---

## 14. Success Metrics

### Trust Metrics
- 80% of visitors who see Trust Covenant proceed to sign up
- <1% of users request data deletion in first month
- Zero data-related complaints

### Onboarding Metrics
- Average setup time < 3 minutes (any mode)
- 90% complete onboarding without dropping off
- 70% of "Quick Start" users complete profile within first week

### Engagement Metrics
- 70% weekly retention (users who complete at least one activity)
- 80% of suggested activities are interacted with
- <5% manual "mark incomplete" rate (auto-completion working)

### AI Quality Metrics
- 95% of AI actions execute successfully
- <10% of confirmed actions are reversed
- 90% of chat queries receive helpful responses

### Progress Metrics
- 80% of weekly reports are viewed
- Average completion rate of scheduled activities: 75%
- Progressive activities (books, catechism) completion rate: 90%

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Formation | The process of shaping character, knowledge, and habits |
| Rhythm | The daily schedule of formation activities |
| Progressive Activity | An activity that builds on previous sessions (reading pages, catechism questions) |
| Stacked Formation | One activity that benefits multiple children differently |
| Frontdesk Officer | The AI chatbot persona |
| Frozen Days | Past days in a weekly plan that cannot be regenerated |
| Trust Covenant | The promise page explaining data handling |

---

## Appendix B: Content Library Summary

| Content Type | Quantity | Source |
|--------------|----------|--------|
| Hymns | 100+ | Reformed tradition |
| Catechism (WSC) | 107 Q&A | Westminster Shorter Catechism |
| Catechism (Prove It) | 50+ Q&A | Children's catechism |
| African Fathers Books | 12 | Picture book series |
| Pastor Curtis Books | 10+ | Theological booklets |
| Scripture Memory | 100+ verses | Curated collection |

---

## Appendix C: Activity Completion Triggers

| Activity | Trigger | Time Threshold | Override |
|----------|---------|----------------|----------|
| Book (carousel) | Close reader | After 2+ pages | "Didn't finish" |
| Book (single view) | View last page | N/A | "Mark incomplete" |
| Catechism | View answer | N/A | "Skipped" |
| Hymn | Close after playing | 30+ seconds | "Didn't sing" |
| Scripture | Close verse view | 10+ seconds | "Need to review" |
| Video | Playback ends | 80% watched | "Didn't watch" |
| PDF download | Download triggered | N/A | "Mark when read" (manual) |

---

*End of Specification Document*
