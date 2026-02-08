

# Onboarding, Messaging, and "Tomorrow's Table" Audit

## What I Found

### 1. The Onboarding Flow is Broken

The `WelcomeFlow` dialog (the actual onboarding) is mounted inside `src/pages/early-years/Today.tsx` -- a **legacy page that no one visits anymore**. The current dashboard route (`/dashboard`) renders `DailyAnchorView`, which has **no onboarding at all**.

There is also a separate `/onboarding` page (`src/pages/Onboarding.tsx`) that is a protected route, but **nothing links to it or redirects new users there**.

**Result:** A new user signs in via Google, lands on `/dashboard`, and sees the raw Anchor card (or an error if no anchor exists) with zero onboarding.

### 2. The "Tomorrow's Table" Popup is a Dead Feature

The `TomorrowsPrepModal` calls `family.getToday()` which hits `/api/family/today`. This endpoint returns data from the **legacy weekly planner system** (`weekly_plans_v2` table). Since the app has pivoted to the Anchor system, this table is likely empty for new users and possibly stale for existing ones.

The popup will almost always show "No specific prep needed for tomorrow!" because there is no data to display. It is **not connected to the Anchor pipeline** at all.

**Recommendation:** Remove it. It adds visual noise without delivering value.

### 3. Branding Inconsistencies

Multiple places still say "SchoolOS" instead of "FamilyPath":
- Footer in `MainLayout.tsx`: "2024 SchoolOS"
- Privacy Policy and Terms of Service pages
- Settings page descriptions
- Hymnal reader title
- PDF export footers
- `localStorage` keys (`schoolos_token`, `schoolos_onboarding_complete`, etc.)
- Data archive filenames
- Copyright year says 2024 (should be 2025)

### 4. Messaging Evaluation

**What works well:**
- `GuestHome.tsx` (landing page) -- "Your Family's Library" with hymns, books, activities counts. Clean, inviting, no AI language. The "Free to browse. Sign in to personalize." copy is excellent.
- `Login.tsx` -- "Unlock Your Family's Learning Path" is warm and parent-friendly.
- Sidebar has "Support FamilyPath" with a funding widget -- good for the free/donation model.

**What needs adjustment:**
- Login page says "personalized rhythms" and "Weekly Planner" -- these are legacy concepts. Should say "daily learning anchor" or simply "personalized learning paths."
- The "Anchor Companion" chat sidebar title and "I'll help guide your family through today's learning anchor" language exposes the AI engine. Should be softer -- "Your daily guide" or similar.
- The `DailyAnchorView` loading state says "Preparing today's anchor..." -- the word "anchor" is internal jargon that may confuse parents.

---

## The Plan

### Phase 1: Fix the Auth and Landing Flow

**Goal:** Make Google Auth the very first thing a visitor encounters (as requested).

**Changes to `src/App.tsx`:**
- Change the root route (`/`) so that it either:
  - Shows `GuestHome` for unauthenticated users (current behavior, this is fine)
  - OR redirects directly to `/login` (if you want Google Auth front and center)
- Keep `GuestHome` as-is but make the "Sign In to Personalize" button more prominent (swap CTA order -- sign-in first, browse second)

**Changes to `src/pages/Login.tsx`:**
- Update copy: "Weekly Planner" becomes "Learning Paths" or "Daily Rhythm"
- Update copy: "personalized rhythms" becomes "personalized learning paths"
- Update copyright year to 2025

### Phase 2: Wire Up Onboarding to the Dashboard

**Changes to `src/components/anchor/DailyAnchorView.tsx`:**
- Import and render `WelcomeFlow` so first-time users get the onboarding dialog
- The dialog already checks `localStorage` for completion status, so it will only show once

**Changes to `src/components/onboarding/WelcomeFlow.tsx`:**
- Fix Step 0 routing: currently all three modes go to `setStep(1)`. Wire "quick" to go directly to add-child (step 2), "guided" to preferences (step 1), "chat" to conversational (step 5)
- Update the generate mutation to call `anchor` API instead of `weeklyPlan.regenerate` (legacy)
- Remove the redirect to `/early-years/planner` (dead route) -- stay on `/dashboard`

### Phase 3: Remove "Tomorrow's Table" Popup

**Files changed:**
- `src/components/layout/MainLayout.tsx` -- Remove the `TomorrowsPrepModal` import and render
- Optionally delete `src/components/evening/TomorrowsPrepModal.tsx` and `src/hooks/useEveningPrompt.ts` entirely

**Reasoning:** The popup queries a legacy API endpoint that returns empty data. It will always say "No specific prep needed." It is not connected to the Anchor system, and wiring it up would require building a "tomorrow's anchor preview" feature that does not exist yet. Better to remove it now and add a proper version later if needed.

### Phase 4: Branding Cleanup

**Scope:** Find-and-replace "SchoolOS" with "FamilyPath" in user-facing strings across these files:
- `src/components/layout/MainLayout.tsx` (footer)
- `src/pages/legal/PrivacyPolicy.tsx`
- `src/pages/legal/TermsOfService.tsx`
- `src/components/settings/SettingsAccount.tsx`
- `src/components/library/HymnalReader.tsx`
- `src/components/pdf/documents/ActivityDocument.tsx`

**Note:** `localStorage` keys like `schoolos_token` should NOT be renamed (would log everyone out). Only user-visible text changes.

### Phase 5: Soften AI Language

**Changes across dashboard components:**
- "Anchor Companion" becomes "Daily Guide" or "Your Guide"
- "today's learning anchor" becomes "today's learning"
- "Preparing today's anchor..." becomes "Preparing today's learning..."
- Any references to "Beast engine," "AI engine," or "Gemini" in user-facing UI should be removed or softened

---

## Technical Summary

| Phase | Files Changed | Risk |
|-------|--------------|------|
| 1. Auth flow | `Login.tsx` | Low -- copy changes only |
| 2. Onboarding wiring | `DailyAnchorView.tsx`, `WelcomeFlow.tsx` | Medium -- logic changes to step routing and API calls |
| 3. Remove popup | `MainLayout.tsx`, delete 2 files | Low -- removing unused feature |
| 4. Branding | 6 files | Low -- string replacements |
| 5. AI language | 3-4 files in anchor/chat components | Low -- copy changes |

