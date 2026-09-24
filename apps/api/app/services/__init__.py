"""Business logic, one module per domain.

Routes in `app.api` stay thin: they validate input, call a service function,
and shape the response. Anything with more than a couple of lines of logic
belongs here instead of in a route handler.
"""
