# AI Operations Dashboard (Spine, Activities, Daily Anchors)

## Goals and scope
This dashboard is intended to help leadership and operators monitor the AI systems that generate:
- **Curriculum spine** (multi-call consensus pipeline).
- **Daily anchors** (family-facing daily formation experience).
- **Activities** (the activities surfaced inside anchors/arc flows).

The goal is to see **what was generated**, **how often**, **how well it performs**, and **why it was generated**, while avoiding any exposure of personal information (PII). This document defines what is worth seeing, how to collect it, and how to build a dashboard that supports monitoring and operational oversight.

### Key modules in this codebase
- **Spine generation** uses `SpineGenerator` to create multi-call drafts, merge conflicts, and store spine metadata/entries. (`cloudflare/src/ai/spine-generator.ts`).
- **Daily anchors** are generated (cached or AI-generated) via `AnchorGenerator`. (`cloudflare/src/ai/anchor-generator.ts`).
- **Spine admin routes** already exist for generating, resolving, approving, and listing spine versions. (`cloudflare/src/routes/spine.ts`).

## What’s worth seeing (operational visibility requirements)

### 1) Spine generation health
**Why:** The spine is a foundational curriculum artifact; failures or low-quality output can cascade into formation arcs and daily anchors.

**Visibility requirements**
- **Spine generation runs**: timestamp, subject, stage, week range, run status.
- **Consensus vs. conflicts**: count of conflicts per run, conflict resolution status.
- **Draft metadata**: number of drafts produced (expected 3), failure count.
- **Approval status**: draft → approved/frozen and who approved.
- **Generation logs**: summarized AI prompt metadata (model, token usage, latency) without any raw user data.

**Relevant code surfaces**
- `SpineGenerator.generateSpine` (multi-call consensus pipeline). (`cloudflare/src/ai/spine-generator.ts`).
- Spine admin API endpoints (generate, resolve, approve, list, entries). (`cloudflare/src/routes/spine.ts`).

### 2) Daily anchor generation health
**Why:** Daily anchors are generated or retrieved daily; operational issues show up quickly for families.

**Visibility requirements**
- **Cache hit vs. generate**: how often anchors are generated vs. returned from cache.
- **Generation outcomes**: success/failure counts per day and per household segment (no PII).
- **Guardrail compliance**: materials whitelist compliance (violations should be logged).
- **AI generation metrics**: prompt/response sizes, tokens, latency, model.

**Relevant code surfaces**
- `AnchorGenerator.getTodayAnchor` and `generateAnchor` (cached vs. AI-generated). (`cloudflare/src/ai/anchor-generator.ts`).
- AI guardrails and materials whitelist (must enforce and log). (`cloudflare/src/ai/anchor-generator.ts`).

### 3) Activity generation/selection health
**Why:** Activities are the core of each anchor and must be trackable for quality and stability.

**Visibility requirements**
- **Activity selection breakdown**: percentage of prebuilt vs. AI generated.
- **Domain coverage** (if available from arcs/anchors): track content domain representation.
- **Failure/edge cases**: empty activities or missing fields.

**Relevant code surfaces**
- `AnchorGenerator.convertPlanToAnchor` (prebuilt plan conversion). (`cloudflare/src/ai/anchor-generator.ts`).

### 4) Performance and AI usage metrics
**Why:** AI systems cost money and can fail silently without visibility.

**Visibility requirements**
- **Calls per feature**: anchors, spine, report generation, etc.
- **Token usage**: input/output tokens (or proxy metrics if model doesn’t return tokens).
- **Latency**: request time to response time for AI calls.
- **Error rate**: per AI feature, per model.

**Relevant code surfaces**
- `SpineGenerator` uses Gemini for each draft and merge steps. (`cloudflare/src/ai/spine-generator.ts`).
- `AnchorGenerator` uses Gemini for daily anchor generation. (`cloudflare/src/ai/anchor-generator.ts`).
- `ReportGenerator` uses Gemini for weekly insights. (`cloudflare/src/ai/report-generator.ts`).

## Data architecture for the dashboard

### A) Metrics data model (suggested)
Create a table or structured log stream for AI telemetry. A minimal table schema:

```
ai_telemetry (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  feature TEXT,            -- "spine", "anchor", "report", "activity" etc.
  model TEXT,
  request_tokens INTEGER,
  response_tokens INTEGER,
  latency_ms INTEGER,
  status TEXT,             -- "success" | "error"
  error_type TEXT,         -- optional
  request_id TEXT,         -- trace ID across services
  metadata_json TEXT       -- safe metadata only
)
```

**Important:** Avoid raw prompt/response storage here. If content review is required, store a **sanitized version** of responses in a separate table with PII scrubbing.

### B) Content audit log (sanitized)
If you want to audit actual generated content (spines and anchors), store a scrubbed copy with references to primary IDs.

```
ai_content_audit (
  id TEXT PRIMARY KEY,
  feature TEXT,               -- "spine" | "anchor"
  content_id TEXT,            -- curriculum_spine.id or daily_anchors.id
  content_excerpt TEXT,       -- scrubbed, short excerpt
  created_at TEXT,
  metadata_json TEXT          -- safe metadata only
)
```

### C) Aggregation layer
Create periodic aggregates (e.g., daily rollups) that are used in the dashboard:
- `ai_telemetry_daily`: total calls, total tokens, avg latency, error rate.
- `spine_conflicts_daily`: #conflicts created/resolved.
- `anchor_generation_daily`: #cached vs. AI-generated anchors.

## Dashboard pages and required data

### 1) Overview (AI Ops)
**Purpose:** one-page summary of AI health.

**Panels**
- Total AI calls (last 24h / 7d / 30d)
- Error rate
- Average latency
- Total tokens (or estimated usage)
- Top features by volume (spine / anchors / reports)

**Data sources**
- `ai_telemetry` aggregate table.

### 2) Spine Monitoring
**Panels**
- Spine generation runs table (status, subject, weeks, stage, created at).
- Conflicts count + resolution status.
- Approved spines list.
- Drill-down: display entries for a spine version.

**Data sources**
- Spine metadata / curriculum entries.
- Conflict data from `spine_metadata.generation_log` (if used) and conflict endpoints.

**Relevant endpoints**
- `GET /api/admin/spine/list` for spine versions. (`cloudflare/src/routes/spine.ts`).
- `GET /api/admin/spine/entries?version=...&subject=...` for entries. (`cloudflare/src/routes/spine.ts`).

### 3) Daily Anchor Monitoring
**Panels**
- Anchors generated vs cached, per day.
- Anchor success rate (failures, exceptions).
- Guardrail violations (materials or safety compliance).
- Sample of recent anchor summaries (sanitized).

**Data sources**
- `daily_anchors` table (existing).
- `ai_telemetry` and `ai_content_audit`.

### 4) Activity Monitoring
**Panels**
- Activity counts by domain or type (if stored in anchor/arc data).
- Missing or malformed activities.
- Prebuilt vs AI-generated ratio.

**Data sources**
- `daily_anchors.anchor_data` fields.

### 5) Performance & Cost
**Panels**
- Token usage by feature.
- Average latency by model.
- Errors by feature + model.

**Data sources**
- `ai_telemetry`.

## Triggering spine generation (admin UX + API)
The backend already exposes an admin endpoint for spine generation. This should be integrated into the dashboard as a “Generate Spine” action.

**Endpoint**
- `POST /api/admin/spine/generate`
  - Required body: `subject`, `startWeek`, `endWeek`, `stage`.
  - Uses default sources and triggers the multi-call consensus pipeline. (`cloudflare/src/routes/spine.ts`).

**Admin UI flow**
1. Choose subject, stage, and week range.
2. Submit to `POST /api/admin/spine/generate`.
3. Display returned version, conflict count, and auto-refresh spine list.
4. If conflicts exist, deep-link to the conflict resolution panel.

## Security and privacy requirements
- **No PII in the dashboard**: do not expose names, emails, IDs, or contextual family data.
- **Redact content**: if content viewing is required, show only sanitized excerpts.
- **Admin-only access**: all spine endpoints and the dashboard should require admin auth.

## Admin authentication design (email allowlist + test access)
The dashboard is meant for a tiny, trusted operator group. The simplest robust model is **email allowlisting** for real Google accounts **plus** a **non-Google test access path** for `test@gmail.com` (or any non-real account) that never depends on Google OAuth.

### A) Core requirements
- Allow **only** `antmwes104.1@gmail.com` and `test@gmail.com`.
- Support the real Google email via OAuth sign-in.
- Provide a controlled test-only access path that does **not** rely on Google (since `test@gmail.com` isn't a real account).
- Keep all admin endpoints private even if the base Worker URL is public.

### B) Recommended approach (two-factor access paths)
1. **Primary (real Google account):** Use Google OAuth on the frontend, then attach a signed session token to backend requests.\n
   - Frontend obtains ID token from Google sign-in.\n
   - Backend verifies the ID token signature and extracts email.\n
   - Backend checks email against an allowlist (`ADMIN_EMAIL_ALLOWLIST`).\n
\n
2. **Secondary (test access):** Use a **static admin API key** header for the non-Google test email.\n
   - Backend accepts `X-Admin-Api-Key` only if it matches a secret in environment.\n
   - For visibility, store `admin_actor = \"test@gmail.com\"` in logs when this path is used.\n
   - This avoids fake OAuth and keeps access explicit and auditable.\n

### C) Backend enforcement details (conceptual)
Add a shared middleware for all `/api/admin/*` routes:\n
1. **Google ID token path**\n
   - Read `Authorization: Bearer <google_id_token>`.\n
   - Verify token with Google public keys.\n
   - Extract `email` and `email_verified`.\n
   - Ensure `email` is in `ADMIN_EMAIL_ALLOWLIST`.\n
\n
2. **API key path (test-only)**\n
   - If no Bearer token, check `X-Admin-Api-Key`.\n
   - Compare with `ADMIN_TEST_API_KEY` (secret).\n
   - If valid, set actor to `test@gmail.com` and proceed.\n
\n
3. **Reject otherwise**\n
   - Return `401 Unauthorized`.\n

### D) Frontend behavior for admin dashboard
- **Real admin**: Use Google sign-in and store ID token in memory or secure storage; send as `Authorization` header on all admin API requests.\n
- **Test access**: For local/staging, add a simple “Test Admin Key” input that stores the key in memory and sends it as `X-Admin-Api-Key`.\n

### E) Why not “passcode in URL” anymore?
The previous passcode-in-URL approach is insecure (leaks in logs, screenshots, and referrers) and brittle. The above model keeps secrets in headers and is compatible with both real and test-only access.

### F) Environment variables needed
- `ADMIN_EMAIL_ALLOWLIST` (comma-separated): `antmwes104.1@gmail.com,test@gmail.com`\n
- `ADMIN_TEST_API_KEY` (strong random string)\n

### G) Optional: Cloudflare Access (if you prefer managed auth)
Cloudflare Access can enforce the email allowlist at the edge, but it **cannot** authenticate a non-real Google account. You would still need the API key path for `test@gmail.com`. For a minimal implementation, application-level enforcement as described above is sufficient.

## Implementation plan (step-by-step)

### Phase 1: Instrumentation
1. Add telemetry logging around every Gemini call in:
   - `SpineGenerator.generateDraft` and `mergeDrafts`.
   - `AnchorGenerator.generateWithAI`.
   - `ReportGenerator.generateInsights`.
2. Record **model**, **latency**, **token usage** (or approximate), **status**, **error**.

### Phase 2: Admin APIs for telemetry and audit
1. Create `GET /api/admin/ai/telemetry` with query filters (feature, date range).
2. Create `GET /api/admin/ai/anchors` for recent anchors (sanitized).
3. Create `GET /api/admin/ai/spine/telemetry` (summary and conflicts).

### Phase 3: Dashboard UI
Build a new “AI Operations” section with subpages:
- Overview
- Spine
- Anchors
- Activities
- Performance

### Phase 4: Alerting/Monitoring (optional)
- Alerts on error spikes or unusually high latency.
- Alerts on conflict rates exceeding threshold (e.g., >20%).

## Sample metrics definitions
- **spine_generation_calls**: # of `generateSpine` calls per day.
- **spine_conflicts_rate**: conflicts / total weeks.
- **anchor_generation_rate**: # anchors generated / total anchors requested.
- **anchor_cache_hit_rate**: cached anchors / total.
- **avg_ai_latency_ms**: avg duration of AI calls.
- **tokens_per_call**: total tokens / AI calls (per feature).

---

## Summary of existing hooks
- **Spine generation**: `POST /api/admin/spine/generate` (already implemented). (`cloudflare/src/routes/spine.ts`).
- **Spine list + entries**: `GET /api/admin/spine/list`, `GET /api/admin/spine/entries`. (`cloudflare/src/routes/spine.ts`).
- **Anchor generator**: generates and stores daily anchors with guardrails. (`cloudflare/src/ai/anchor-generator.ts`).

This document should be used as a blueprint for building a full AI operations dashboard with visibility into spine, activities, and daily anchors, along with robust performance and reliability metrics.
