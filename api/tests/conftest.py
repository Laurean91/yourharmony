"""
Test configuration and fixtures.

Architecture:
- Unit tests: mock repositories, no DB required
- Integration tests: real SQLite in-memory DB via SQLAlchemy

Why SQLite for integration tests?
  The shared production DB is managed by Prisma and should never be touched by tests.
  SQLite (aiosqlite) is zero-config, fast, and covers 95% of SQL correctness.
  For PostgreSQL-specific features (pg_advisory_xact_lock), unit tests mock them directly.

Setup:
    pip install aiosqlite
    (already included in dev dependencies via pytest extras)
"""

import os
from typing import AsyncGenerator
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Set test env before importing app modules
os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from api.database import AsyncSessionFactory  # noqa: E402
from api.dependencies import get_db  # noqa: E402
from api.main import app  # noqa: E402
from api.models.base import Base  # noqa: E402
from api.models.lesson import Lesson, LessonStudent  # noqa: E402
from api.models.post import Category, Post  # noqa: E402
from api.models.student import Student  # noqa: E402


# ── Test engine (in-memory SQLite per session) ────────────────────────────────

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

_test_engine = create_async_engine(TEST_DB_URL, echo=False)
_TestSessionFactory = async_sessionmaker(
    _test_engine, expire_on_commit=False, class_=AsyncSession
)


@pytest.fixture(scope="session", autouse=True)
async def create_tables():
    """Create all tables once per test session."""
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await _test_engine.dispose()


@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a test DB session that rolls back after each test."""
    async with _TestSessionFactory() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with DB session overridden."""
    app.dependency_overrides[get_db] = lambda: db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict:
    """Obtain valid JWT auth headers via the login endpoint."""
    resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "testpass"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── DB object factories ───────────────────────────────────────────────────────

@pytest.fixture
async def category(db: AsyncSession) -> Category:
    cat = Category(id=str(uuid4()), name="Tech", slug="tech")
    db.add(cat)
    await db.flush()
    return cat


@pytest.fixture
async def post(db: AsyncSession, category: Category) -> Post:
    p = Post(
        id=str(uuid4()),
        title="Hello World",
        slug="hello-world",
        content="Some content here.",
        isPublished=True,
        categoryId=category.id,
    )
    db.add(p)
    await db.flush()
    return p


@pytest.fixture
async def student(db: AsyncSession) -> Student:
    s = Student(
        id=str(uuid4()),
        name="Иван Иванов",
        age=10,
        phone="+79001234567",
        tag="Индивидуальное",
    )
    db.add(s)
    await db.flush()
    return s


@pytest.fixture
async def student2(db: AsyncSession) -> Student:
    s = Student(
        id=str(uuid4()),
        name="Мария Петрова",
        age=12,
        tag="Групповое",
    )
    db.add(s)
    await db.flush()
    return s


@pytest.fixture
async def lesson(db: AsyncSession) -> Lesson:
    from datetime import datetime, timezone
    l = Lesson(
        id=str(uuid4()),
        date=datetime(2026, 4, 1, 10, 0, tzinfo=timezone.utc),
        title="Урок фортепиано",
        tag="Индивидуальное",
        price=1500.0,
    )
    db.add(l)
    await db.flush()
    return l


@pytest.fixture
async def enrollment(db: AsyncSession, lesson: Lesson, student: Student) -> LessonStudent:
    ls = LessonStudent(lessonId=lesson.id, studentId=student.id, attended=False)
    db.add(ls)
    await db.flush()
    return ls
