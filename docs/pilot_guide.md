# SchoolOS Activities Overhaul: Pilot Rollout Guide

## 1. Upgrade Procedure
1. **Backup Database**: Ensure D1 backup is taken.
2. **Deploy Schema**: Run `wrangler d1 migrations apply DB --remote` (up to 0011).
3. **Run Audit (Local)**:
   - Run `node scripts/audit_activities.cjs`.
   - Review `activities_migration_plan.csv`.
   - (Optional) Generate manual SQL fixes if CSV reveals critical misalignments.
4. **Apply Backfill**: Run migration 0012 (populate initial biblical domains).
5. **Deploy Worker**: `npm run deploy` (Cloudflare).

## 2. Feature Flags / Configuration
- Verify `INDEX.TS` defaults: `content_status` filtering is ON by default.
- No remote config features flags used currently (code-based).

## 3. User Communication (Teachers/Parents)
- **New Terminology**: Explain "Biblical Domains" (Wisdom, Stature, Favor).
- **Family Sessions**: 
    - Highlight "Parent Script" feature.
    - Explain "Safety Notes" for new restricted items.

## 4. Feedback Loop
- **Monitor**: Watch for 404s on activities or empty recommendations.
- **Report**: Use `staging_run_report.md` format for initial feedback.
- **Adjustment**: 
    - Data fixes: Add to `0012_apply_changes.sql` or new migration.
    - Code fixes: Hotfix via worker deploy.

## 5. Rollback Plan
- If critical failure:
    - Revert Worker code to previous commit.
    - (Schema rollback difficult with SQLite/D1 without full restore).
    - If data issues, run SQL `UPDATE activities SET content_status='published'` to unhide everything temporarily.
