"""Shared FastAPI dependencies.

Request-scoped dependencies used across route modules — the database session
(re-exported from `app.db.session`), and, from Phase 1 onward, the API key /
session auth dependencies that resolve the current organization and user.
"""
from app.db.session import get_db

__all__ = ["get_db"]
