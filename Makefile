.PHONY: up down build logs test api-up api-logs api-shell api-test api-lint api-migrate api-migration dev worker-logs

dev:
	docker compose up -d --build api worker
	@echo "Waiting for the API..."
	@until curl -sf http://localhost:8000/health >/dev/null; do sleep 1; done
	docker compose exec api alembic upgrade head
	@echo "API: http://localhost:8000   Web: http://localhost:3000"
	cd apps/web && npm run dev

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

test:
	$(MAKE) -C tests integration

# ── API ───────────────────────────────────────────────────
api-up:
	docker compose up -d --build api

worker-logs:
	docker compose logs -f worker

api-logs:
	docker compose logs -f api

api-shell:
	docker compose exec api bash

api-test:
	docker compose exec api pytest

api-lint:
	docker compose exec api ruff check .

api-migrate:
	docker compose exec api alembic upgrade head

# usage: make api-migration name="add api keys table"
api-migration:
	docker compose exec api alembic revision --autogenerate -m "$(name)"
