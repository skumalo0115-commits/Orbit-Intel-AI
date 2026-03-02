from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import get_settings


settings = get_settings()


def _normalize_database_url(database_url: str) -> str:
    """Normalize provider URLs for SQLAlchemy + psycopg (v3)."""
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    if database_url.startswith("postgresql://") and "+" not in database_url.split("://", 1)[0]:
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    return database_url


engine = create_engine(_normalize_database_url(settings.database_url), future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
