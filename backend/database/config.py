from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
ENV_FILES = (str(ROOT_DIR / ".env"), str(BACKEND_DIR / ".env"))


class Settings(BaseSettings):
    app_name: str = "NebulaGlass AI"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "sqlite:///./nebulaglass.db"
    upload_dir: str = "backend/uploads"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(env_file=ENV_FILES, env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
