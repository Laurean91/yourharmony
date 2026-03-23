"""
YourHarmony RESTful API
-----------------------
Standalone FastAPI service sharing the PostgreSQL database with the Next.js app.
Prisma manages the schema; this service only reads/writes.

Run:
    cd api
    uvicorn main:app --reload --port 8000

Docs:
    http://localhost:8000/docs       (Swagger UI)
    http://localhost:8000/redoc      (ReDoc)
"""

import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .middleware.error_handler import (
    generic_error_handler,
    http_exception_handler,
    integrity_error_handler,
    validation_error_handler,
)
from .routers import auth, blog, bookings, finance, schedule, students

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

app = FastAPI(
    title="YourHarmony API",
    version="1.0.0",
    description="RESTful API for blog, students and schedule management",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourharmony.ru",
        "https://yourharmony-english.ru",
        "https://www.yourharmony-english.ru",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers (specific → generic) ──────────────────────────────────
app.add_exception_handler(RequestValidationError, validation_error_handler)  # type: ignore[arg-type]
app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
app.add_exception_handler(IntegrityError, integrity_error_handler)  # type: ignore[arg-type]
app.add_exception_handler(Exception, generic_error_handler)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(blog.router)
app.include_router(bookings.router)
app.include_router(students.router)
app.include_router(schedule.router)
app.include_router(finance.router)


@app.get("/api/v1/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "service": "yourharmony-api"}
