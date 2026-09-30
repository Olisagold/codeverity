"""The assessment worker: claims queued assessments and processes them.

Run with ``python -m app.worker``. Any number of workers can run at once;
`claim_next` uses row locks, so each assessment is processed by one worker.
"""
import asyncio
import logging
import signal

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal, engine
from app.services import assessments
from app.services.orchestration import processor

log = logging.getLogger("codeverity.worker")

IDLE_POLL_SECONDS = 1.0


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


async def run(stop: asyncio.Event) -> None:
    log.info("worker started")
    while not stop.is_set():
        try:
            async with SessionLocal() as db:
                worked = await process_next(db)
        except Exception:
            log.exception("worker loop error")
            worked = False
        if not worked:
            try:
                await asyncio.wait_for(stop.wait(), timeout=IDLE_POLL_SECONDS)
            except TimeoutError:
                pass
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
