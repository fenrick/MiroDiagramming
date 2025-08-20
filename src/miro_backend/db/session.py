"""Database session management.

The module exposes a standard synchronous SQLAlchemy ``Session`` factory
configured for a local SQLite database.  ``Base`` is provided for declarative
models and is referenced by Alembic during migration generation.
"""

from collections.abc import Iterator

import logfire
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from ..core.config import settings

engine = create_engine(
    settings.database_url,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False},
)
"""Application-wide SQLAlchemy engine bound to the configured SQLite database."""


class Base(DeclarativeBase):
    """Base class for all ORM models."""


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
"""Factory for ``Session`` instances."""


@logfire.instrument("database session", allow_generator=True)
def get_session() -> Iterator[Session]:
    """Yield a database session and ensure it is closed.

    This helper is suitable for use as a FastAPI dependency.
    """

    session = SessionLocal()
    try:
        logfire.info("session opened")  # event: session creation
        yield session
    finally:
        session.close()
        logfire.info("session closed")  # event: session cleanup
