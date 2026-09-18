# Codeverity

## Structure

- `apps/web` — Next.js frontend
- `apps/api` — FastAPI backend
- `packages/shared` — Shared types/contracts
- `docs` — Architecture, API, research, and decision docs
- `infrastructure` — Docker, nginx, and deployment configs
- `scripts` — Utility scripts
- `tests` — Integration and end-to-end tests
- `codeverity-react` — Standalone React (Vite) app

## Getting started

1. Copy `.env.example` to `.env` and fill in the values.
2. `make build && make up`
