"""Enums shared by several models. Kept free of model imports to avoid import cycles."""
import enum


class ApiKeyEnvironment(enum.StrEnum):
    live = "live"
    test = "test"
