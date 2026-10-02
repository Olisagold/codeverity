"""The worker: processes queued assessments and sends webhook deliveries.

Run with ``python -m app.worker``. Any number of workers can run at once; both
queues are claimed with row locks, so each job is handled by one worker. The
two queues run as separate loops so slow model calls never delay webhooks.
"""

import asyncio
import logging
import signal
from collections.abc import Awaitable, Callable

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import SessionLocal, engine
from app.services import assessments, usage, webhooks
from app.services.orchestration import processor

log = logging.getLogger("codeverity.worker")

IDLE_POLL_SECONDS = 1.0
PRUNE_INTERVAL_SECONDS = 3600


async def process_next(db: AsyncSession) -> bool:
    """Claim and process one assessment. Returns False when the queue is empty."""
    assessment = await assessments.claim_next(db)
    if assessment is None:
        return False

    log.info("processing %s (attempt %d)", assessment.public_id, assessment.attempts)
    try:
        outcome = await processor.process(assessment)
    except assessments.ProcessingError as exc:
        await assessments.fail(db, assessment, exc.code, exc.message)
        log.info("failed %s: %s", assessment.public_id, exc.code)
    except Exception:
        log.exception("unexpected error processing %s", assessment.public_id)
        await db.rollback()
        await assessments.fail(
            db, assessment, "INTERNAL_ERROR", "An unexpected error occurred during assessment."
        )
    else:
        await assessments.complete(db, assessment, outcome)
        log.info("completed %s", assessment.public_id)
    return True


async def _loop(name: str, step: Callable[[AsyncSession], Awaitable[bool]], stop) -> None:
    while not stop.is_set():
        try:
            async with SessionLocal() as db:
                worked = await step(db)
        except Exception:
            log.exception("%s loop error", name)
            worked = False
        if not worked:
            try:
                await asyncio.wait_for(stop.wait(), timeout=IDLE_POLL_SECONDS)
            except TimeoutError:
                pass


async def _prune_logs(stop: asyncio.Event) -> None:
    """Delete request logs past the retention period, once an hour."""
    while not stop.is_set():
        try:
            async with SessionLocal() as db:
                deleted = await usage.prune_logs(db, get_settings().log_retention_days)
            if deleted:
                log.info("pruned %d request logs", deleted)
        except Exception:
            log.exception("log pruning error")
        try:
            await asyncio.wait_for(stop.wait(), timeout=PRUNE_INTERVAL_SECONDS)
        except TimeoutError:
            pass


async def run(stop: asyncio.Event) -> None:
    log.info("worker started")
    async with httpx.AsyncClient(
        timeout=webhooks.DELIVERY_TIMEOUT_SECONDS, follow_redirects=False
    ) as client:
        await asyncio.gather(
            _loop("assessments", process_next, stop),
            _loop("webhooks", lambda db: webhooks.deliver_next(db, client), stop),
            _prune_logs(stop),
        )
    await engine.dispose()
    log.info("worker stopped")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

    async def _main() -> None:
        stop = asyncio.Event()
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, stop.set)
        await run(stop)

    asyncio.run(_main())
