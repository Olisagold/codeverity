"""LLM provider adapters.

Each provider (OpenAI, Gemini, Llama, ...) implements the same interface
(`base.py`) so the orchestrator can call an arbitrary set of models without
knowing which providers are behind them.
"""
