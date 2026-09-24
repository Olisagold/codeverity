.PHONY: up down build logs test api-up api-logs api-shell api-test api-lint api-migrate api-migration

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
