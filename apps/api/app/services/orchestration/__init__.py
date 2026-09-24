"""Multi-model assessment orchestration (Phase 3).

Fans a submission out to several LLM providers in parallel (see `providers/`),
then runs an independent reassessment pass over their output to produce one
final, validated result.
"""
