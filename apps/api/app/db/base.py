"""Declarative base and the model import hub.

Alembic's autogenerate needs every model class imported somewhere before it
inspects metadata. Rather than importing models directly in `env.py`, each
model module is imported here, and `env.py` imports this module instead.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import model modules below as they're added, so their tables register on
# Base.metadata, e.g.:
# from app.models import organization, user, api_key, assessment, webhook  # noqa: F401
