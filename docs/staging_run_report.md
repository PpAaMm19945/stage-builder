# Activities Overhaul: Staging Run Verification Report

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Environment:** Staging / Local Dev

## 1. Migration Success
- [ ] **Migration 0011 (Schema)** applied successfully?
- [ ] **Data Audit Script** ran and produced CSV?
- [ ] **CSV Review** completed (simulated)?
- [ ] **Migration 0012 (Backfill)** applied successfully?

## 2. Data Integrity Checks
| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| New columns exist | `content_status`, `biblical_domain`, etc. present | | |
| Blacklisted items | Status = `blacklisted` (e.g., Yoga) | | |
| Restricted items | `safety_note` populated (e.g., Beads) | | |
| Biblical Domains | `cognitive` -> `wisdom`, etc. | | |

## 3. API Behavior (Cloudflare Worker)
### GET /api/activities
- [ ] **Filtering**: Verified blacklisted items are NOT returned by default.
- [ ] **Metadata**: Verified new fields (`safety_note`, `parent_script`) are in response.

### GET /api/family/today
- [ ] **Recommendation**: Returns `uses_core_kit=1` item if available.
- [ ] **Structure**: Response includes `familyPrompt` and `childInstructions` with tiers.

### POST /family-sessions/compose
- [ ] **Success Case**: Returns valid session for mixed ages (e.g. 2yo + 5yo).
- [ ] **Error Case**: Returns 400 if children array missing.

## 4. Regression Testing
- [ ] Existing student daily plan still loads?
- [ ] Materials settings still work?

## 5. Issues Log
- [ ] Issue 1: ...
- [ ] Issue 2: ...

## 6. Sign-off
- [ ] Ready for Production?
