from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.pool import NullPool

from .config import settings

# NullPool is safer for serverless/short-lived processes (Vercel, etc.)
# For a long-running server, replace NullPool with default pool:
#   pool_size=10, max_overflow=20, pool_pre_ping=True
engine = create_async_engine(
    settings.async_database_url,
    poolclass=NullPool,
    echo=False,
)

AsyncSessionFactory = async_sessionmaker(
    engine,
    expire_on_commit=False,  # prevents lazy-load errors in async context
    class_=AsyncSession,
)
