"""SQLAlchemy ORM models.

One module per domain (organization, user, api_key, assessment, webhook, ...),
added as Phase 1+ of the roadmap in README.md is implemented. `app/db/base.py`
imports every model module so Alembic's autogenerate can see them.
"""
