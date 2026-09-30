"""Background job worker (Phase 2+).

A separate process from the API, built on the same image, that claims queued
assessments from Postgres and processes them. Runs as its own container in
docker-compose and in production: ``python -m app.worker``.
"""
