# Codeverity

Codeverity is an API platform for multi model code assessment. It evaluates student code submissions using multiple language models in parallel, then runs an independent reassessment stage before returning a single, validated result to the integrating platform.

## Repository layout

```
codeverity/
├── apps/
│   ├── web/            Next.js frontend (marketing site, auth, dashboard, docs)
│   └── api/             FastAPI backend (planned)
├── packages/
│   └── shared/           Shared types and contracts (planned)
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── research/
│   └── decisions/
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── deployment/
├── scripts/
├── tests/
│   ├── integration/
│   └── e2e/
├── codeverity-react/    Legacy Vite/React prototype, kept for reference
├── docker-compose.yml
└── Makefile
```

## apps/web

The frontend is a Next.js 15 application using the App Router, TypeScript, and Tailwind CSS. It is organized into route groups:

- `(marketing)`: the public site, including the home page and dedicated pages for features, how it works, architecture, research, and use cases.
- `(auth)`: login, signup, forgot password, and reset password.
- `(dashboard)`: the authenticated dashboard, covering overview, API keys, assessments, webhooks, usage, logs, and settings.
- `docs`: a data driven documentation section with quickstart, authentication, guides, concepts, and API reference pages.

Shared UI primitives, dashboard components, and docs components live under `apps/web/components`, and page level data lives under `apps/web/lib`.

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- Docker, if you plan to run the full stack with `docker-compose`

### Environment variables

Copy the example environment file and fill in the values you need:

```
cp .env.example .env
```

### Run the frontend locally

```
cd apps/web
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Run the full stack with Docker

```
make build
make up
```

This brings up the web app, the API, Postgres, and Redis as defined in `docker-compose.yml`. The API service is a placeholder until the FastAPI backend is built out.

## Status

- `apps/web` is functional end to end: marketing pages, authentication flows, the dashboard, and the docs section all build and run.
- `apps/api`, `packages/shared`, `docs`, `infrastructure`, `scripts`, and `tests` are scaffolded but not yet implemented.
- `codeverity-react` is the original prototype the Next.js app was migrated from. It is kept locally for reference and is excluded from version control.

## License

Not yet decided.
