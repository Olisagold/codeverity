"""Pydantic request/response schemas, one module per domain.

These are the API's public shapes — kept separate from `app.models` (the ORM
layer) so request/response contracts can evolve independently of the database
schema.
"""
