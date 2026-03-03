from sqlalchemy import create_engine, inspect, text
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


def ensure_user_schema() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    if "username" in columns:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(255)"))

        existing_users = conn.execute(text("SELECT id, email FROM users WHERE username IS NULL")).fetchall()
        for user in existing_users:
            fallback_username = (user.email.split("@", 1)[0] or "user").strip().lower().replace(" ", "-")
            fallback_username = f"{fallback_username}-{user.id}"
            conn.execute(
                text("UPDATE users SET username = :username WHERE id = :user_id"),
                {"username": fallback_username, "user_id": user.id},
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
