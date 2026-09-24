# apps/api — Codeverity API

FastAPI backend for Codeverity. It accepts a code submission, sends it to several
language models in parallel, runs an independent reassessment ("judge") pass over
their output, and returns one validated result to the integrating platform.

This document is the build roadmap: what exists today, what's next, and the target
shape of the API.

## System architecture

![Codeverity system architecture](docs/diagrams/system-architecture.png)

Vercel hosts the Next.js dashboard; Render or Railway runs the FastAPI API and the
job worker in Docker; Neon (Postgres) and Upstash (Redis) are the managed data
services. The worker fans a submission out to several LLM providers in parallel,
then runs an independent reassessment ("judge") pass before persisting the final
result and firing a webhook. See
[assessment-lifecycle.png](docs/diagrams/assessment-lifecycle.png) for that request
flow in detail, and [`docs/diagrams/`](docs/diagrams/) for the editable `.excalidraw`
sources.

## Status: Phase 0 complete

The service currently runs, connects to Postgres and Redis, and has no business
logic yet. Everything past this point is planned.

| Phase | Scope | Status |
|---|---|---|
| 0 | Project scaffold, Docker, health checks | ✅ Done |
| 1 | Auth, organizations, API keys | 🔲 Not started |
| 2 | Assessment CRUD + job queue | 🔲 Not started |
| 3 | Multi-model orchestration + reassessment | 🔲 Not started |
| 4 | Webhooks | 🔲 Not started |
| 5 | Usage, logs, rate limiting | 🔲 Not started |
| 6 | Migrations, deploy, hardening | 🔲 Not started |

## Tech stack

- **FastAPI** + **Uvicorn** — async web framework and server
- **SQLAlchemy 2.0** (async) + **asyncpg** — database access
- **Redis** — job queue and caching
- **Pydantic Settings** — configuration from environment variables
- **pytest**, **ruff** — testing and linting
- **Docker** — local development via `docker-compose.yml` at the repo root; Render
  or Railway in production, with Neon (Postgres) and Upstash (Redis) as managed
  services. See [system-architecture.png](docs/diagrams/system-architecture.png).

## Phase 0 — Scaffold (done)

- [x] `Dockerfile`, wired into the repo's `docker-compose.yml`
- [x] `app/core/config.py` — settings from `.env`
- [x] `app/db/session.py` — async SQLAlchemy engine + session
- [x] `GET /health` — liveness
- [x] `GET /health/ready` — checks Postgres and Redis are reachable
- [x] `pytest` + `ruff` configured, one passing test

## Phase 1 — Auth, organizations, API keys

The dashboard already has UI for this (`apps/web/app/(dashboard)/dashboard/settings`,
`.../api-keys`), so the data model below follows what it expects.

- [ ] `organizations` table — name, slug, created_at
- [ ] `users` table — email, password hash, organization membership, role (owner/member)
- [ ] Session auth for the dashboard (login, signup, forgot/reset password) — likely
      JWT access token + refresh token, matching `JWT_SECRET` / `JWT_EXPIRES_IN` in `.env`
- [ ] `api_keys` table — id, org, name, hashed secret, environment (`live`/`test`),
      last_used_at, active
- [ ] API key auth dependency for `Authorization: Bearer sk_live_...` on the public API
- [ ] Endpoints: `POST /v1/auth/login`, `POST /v1/auth/signup`,
      `POST /v1/auth/forgot-password`, `POST /v1/auth/reset-password`
- [ ] Endpoints: `GET/POST /v1/api-keys`, `DELETE /v1/api-keys/{id}`

## Phase 2 — Assessments (core resource)

Matches the shape already defined in `apps/web/types/dashboard.ts` and the docs
content in `apps/web/lib/docsContent/coreApi.ts`.

- [ ] `assessments` table — id, org, status (`queued`/`processing`/`completed`/`failed`),
      language, assignment (title, requirements), submission code, score, confidence,
      processing_seconds, timestamps
- [ ] `POST /v1/assessments` — validate input, create row with status `queued`,
      push a job onto the Redis queue, return `202 Accepted`
- [ ] `GET /v1/assessments/{id}` — current status
- [ ] `GET /v1/assessments/{id}/result` — final feedback once completed
- [ ] `GET /v1/assessments` — list, paginated, filterable by status
- [ ] A worker process (RQ or Celery) that consumes the queue — separate container
      from the API, sharing the same image

## Phase 3 — Multi-model orchestration + reassessment

This is the core product logic. See
[assessment-lifecycle.png](docs/diagrams/assessment-lifecycle.png) for the full flow.

- [ ] Model client abstraction — one interface, adapters for each provider
      (e.g. OpenAI, Gemini, Llama), so adding a model doesn't touch orchestration code
- [ ] Fan out one submission to N models in parallel (`asyncio.gather`), each scored
      against the assignment's requirements
- [ ] Independent reassessment ("judge") stage: given the models' outputs, resolve
      disagreements and produce one final score, summary, and recommendation
- [ ] Persist per-model results plus the judge's final result; move status to
      `completed`, or `failed` with an error reason if every model call fails
- [ ] Timeout and partial-failure handling — one slow/broken model shouldn't fail
      the whole assessment
- [ ] Retry policy for transient provider errors

## Phase 4 — Webhooks

Matches `apps/web/app/(dashboard)/dashboard/webhooks` and the webhook docs page.

- [ ] `webhook_endpoints` table — org, url, active, subscribed events
- [ ] `webhook_deliveries` table — event id, endpoint, payload, response status, timestamp
- [ ] Emit `assessment.completed` / `assessment.failed` events when an assessment
      finishes
- [ ] Delivery worker with retries (exponential backoff) on non-2xx responses
- [ ] `GET/POST /v1/webhooks`, `DELETE /v1/webhooks/{id}`, delivery log endpoint
- [ ] HMAC signing of webhook payloads so receivers can verify authenticity

## Phase 5 — Usage, logs, rate limiting

Matches `apps/web/app/(dashboard)/dashboard/usage` and `.../logs`.

- [ ] Request logging middleware — method, path, status, duration, API key used
- [ ] `GET /v1/usage` — request/assessment counts over 7d/30d/90d, per the
      `SeriesPoint` shape the dashboard already expects
- [ ] `GET /v1/logs` — recent request log, paginated
- [ ] Per-key rate limiting backed by Redis (the dashboard already shows `429`s in
      its mock log data)

## Phase 6 — Migrations, deploy, hardening

- [ ] Add Alembic; first migration creates the Phase 1–5 tables
- [ ] `render.yaml` (or Railway config) for one-command deploys of the API + worker
- [ ] Point production `DATABASE_URL` at Neon (pooled connection) and `REDIS_URL`
      at Upstash; disable asyncpg's prepared-statement cache for the pooled connection
- [ ] Structured logging + basic error tracking
- [ ] CORS locked down to the actual frontend origin(s) in production
- [ ] A backend CI workflow (lint + test), mirroring
      [`.github/workflows/frontend-ci.yml`](../../.github/workflows/frontend-ci.yml)

## Local development

```bash
# from the repo root
make api-up      # build + start api, worker (once it exists), db, redis
make api-logs    # follow logs
make api-test    # run pytest inside the container
make api-lint    # run ruff inside the container
make down        # stop everything
```

`GET http://localhost:8000/health/ready` should return
`{"status":"ok","checks":{"database":"ok","redis":"ok"}}` once the stack is up.
Interactive docs: `http://localhost:8000/docs`.
