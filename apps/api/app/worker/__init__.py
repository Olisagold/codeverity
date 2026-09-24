"""Background job worker (Phase 2+).

A separate process from the API, built on the same image, that consumes
assessment jobs off the Redis queue and delivers webhook events. Runs as its
own container in docker-compose and in production.
"""
