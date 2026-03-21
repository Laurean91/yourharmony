"""
Global exception handlers.

Handler resolution order (FastAPI matches most-specific first):
  1. RequestValidationError  → 422  (Pydantic schema violations)
  2. HTTPException           → pass-through (our own 404/409/401)
  3. IntegrityError          → 409/422 (DB constraint violations)
  4. Exception               → 500  (catch-all, never leaks internals)
"""

import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


async def validation_error_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Formats Pydantic v2 validation errors into a clean, human-readable list.

    Default FastAPI format is verbose. This produces:
      { "detail": [{ "field": "age", "message": "Input should be less than or equal to 99" }] }
    """
    errors = []
    for error in exc.errors():
        loc = error.get("loc", [])
        # Skip the first element ("body", "query", etc.) — not useful to API consumers
        field = ".".join(str(l) for l in loc[1:]) if len(loc) > 1 else str(loc[0]) if loc else "unknown"
        errors.append({
            "field": field,
            "message": error.get("msg", "Invalid value"),
            "type": error.get("type", ""),
        })

    logger.warning(
        "Validation error on %s %s: %d field(s) failed",
        request.method, request.url.path, len(errors),
    )
    return JSONResponse(status_code=422, content={"detail": errors})


async def http_exception_handler(
    _request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """
    Pass-through for all HTTPExceptions raised by our own code.
    Adds consistent {"detail": "..."} structure for all HTTP errors.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


async def integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    """
    Catches DB constraint violations — the final safety net for race conditions.

    Common causes:
      - Duplicate enrollment (composite PK violation) → 409
      - FK violation (referencing deleted entity)     → 422
    """
    orig_str = str(exc.orig).lower() if exc.orig else ""

    if "unique" in orig_str or "duplicate" in orig_str:
        logger.warning(
            "Unique constraint violation: %s %s", request.method, request.url.path
        )
        return JSONResponse(
            status_code=409,
            content={"detail": "Resource already exists (duplicate key)"},
        )

    if "foreign key" in orig_str or "violates foreign key" in orig_str:
        logger.warning(
            "FK constraint violation: %s %s", request.method, request.url.path
        )
        return JSONResponse(
            status_code=422,
            content={"detail": "Referenced resource does not exist"},
        )

    logger.error(
        "DB integrity error on %s %s: %s",
        request.method, request.url.path, exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=422,
        content={"detail": "Database constraint violation"},
    )


async def generic_error_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all for truly unexpected errors — never leaks stack traces to clients."""
    logger.exception(
        "Unhandled %s on %s %s",
        type(exc).__name__, request.method, request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
