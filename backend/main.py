from pathlib import Path
import json
import os
import sys
import types


if "backend" not in sys.modules:
    backend_package = types.ModuleType("backend")
    backend_package.__path__ = [str(Path(__file__).resolve().parent)]
    sys.modules["backend"] = backend_package

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError

from backend.database.config import Settings
from backend.database.session import Base, engine, ensure_user_schema
from backend.models import analysis, document, user  # noqa: F401
from backend.routes.analysis import router as analysis_router
from backend.routes.auth import router as auth_router
from backend.routes.documents import router as documents_router

app = FastAPI(title="NebulaGlass AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    # Using "*" with allow_credentials=True can break CORS behavior on some platforms.
    # Disable credentials to ensure OPTIONS preflight is answered correctly.
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_startup_error = ""

try:
    Base.metadata.create_all(bind=engine)
    ensure_user_schema()
except Exception as exc:  # noqa: BLE001
    database_startup_error = f"{type(exc).__name__}: {exc}"
    print(f"[startup] Database initialization failed: {database_startup_error}")


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_request: Request, exc: SQLAlchemyError):
    print(f"[database] Request failed: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=503,
        content={"detail": "Database is not reachable. Check DATABASE_URL on the backend."},
    )

for api_prefix in ("", "/api"):
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(documents_router, prefix=api_prefix)
    app.include_router(analysis_router, prefix=api_prefix)

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="frontend-assets")


@app.get("/")
def healthcheck():
    # Always return JSON if frontend dist is not available (avoid 500s).
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"status": "ok", "service": "NebulaGlass AI", "frontend_dist_found": frontend_dist.exists()}


@app.get("/env-check")
def env_check():
    settings = Settings()

    required = {
        "SECRET_KEY": bool(os.getenv("SECRET_KEY", "").strip()) and settings.secret_key != "change-me-in-production",
        "DATABASE_URL": bool(os.getenv("DATABASE_URL", "").strip()) and not database_startup_error,
    }
    optional = {
        "OPENROUTER_API_KEY": bool((os.getenv("OPENROUTER_API_KEY", "").strip() or settings.openrouter_api_key).strip()),
        "OPENAI_API_KEY": bool((os.getenv("OPENAI_API_KEY", "").strip() or settings.openai_api_key).strip()),
        "OPENROUTER_MODEL": bool((os.getenv("OPENROUTER_MODEL", "").strip() or settings.openrouter_model).strip()),
        "OPENAI_MODEL": bool((os.getenv("OPENAI_MODEL", "").strip() or settings.openai_model).strip()),
        "SMTP_HOST": bool((os.getenv("SMTP_HOST", "").strip() or settings.smtp_host).strip()),
        "SMTP_USERNAME": bool((os.getenv("SMTP_USERNAME", "").strip() or settings.smtp_username).strip()),
        "SMTP_PASSWORD": bool((os.getenv("SMTP_PASSWORD", "").strip() or settings.smtp_password).strip()),
        "SMTP_SENDER_EMAIL": bool((os.getenv("SMTP_SENDER_EMAIL", "").strip() or settings.smtp_sender_email).strip()),
        "SMTP_USE_SSL": bool(str(os.getenv("SMTP_USE_SSL", "")).strip() or settings.smtp_use_ssl),
        "FRONTEND_APP_URL": bool((os.getenv("FRONTEND_APP_URL", "").strip() or settings.frontend_app_url).strip()),
        "FIREBASE_CREDENTIALS_JSON": bool((os.getenv("FIREBASE_CREDENTIALS_JSON", "").strip() or settings.firebase_credentials_json).strip()),
        "FIREBASE_CREDENTIALS_PATH": bool((os.getenv("FIREBASE_CREDENTIALS_PATH", "").strip() or settings.firebase_credentials_path).strip()),
        "BLOB_READ_WRITE_TOKEN": bool((os.getenv("BLOB_READ_WRITE_TOKEN", "").strip() or settings.blob_read_write_token).strip()),
        "DATABASE_STARTUP_OK": not database_startup_error,
    }

    return {
        "ready": all(required.values()),
        "required": required,
        "optional": optional,
        "database_startup_error": database_startup_error or None,
    }


@app.get("/runtime-config.js")
def runtime_config():
    config = {
        "VITE_API_URL": os.getenv("VITE_API_URL", "").strip(),
        "VITE_FIREBASE_API_KEY": os.getenv("VITE_FIREBASE_API_KEY", "").strip(),
        "VITE_FIREBASE_AUTH_DOMAIN": os.getenv("VITE_FIREBASE_AUTH_DOMAIN", "").strip(),
        "VITE_FIREBASE_PROJECT_ID": os.getenv("VITE_FIREBASE_PROJECT_ID", "").strip(),
        "VITE_FIREBASE_STORAGE_BUCKET": os.getenv("VITE_FIREBASE_STORAGE_BUCKET", "").strip(),
        "VITE_FIREBASE_MESSAGING_SENDER_ID": os.getenv("VITE_FIREBASE_MESSAGING_SENDER_ID", "").strip(),
        "VITE_FIREBASE_APP_ID": os.getenv("VITE_FIREBASE_APP_ID", "").strip(),
    }
    payload = f"window.__ORBIT_RUNTIME_CONFIG__ = {json.dumps(config)};"
    return Response(content=payload, media_type="application/javascript")


@app.options("/api/auth/{rest:path}")
@app.options("/auth/{rest:path}")
async def preflight_auth(rest: str):
    # Explicitly answer auth preflight to avoid any routing layer returning 405.
    return Response(status_code=204)


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    if full_path.startswith((
        "auth",
        "api/auth",
        "upload",
        "documents",
        "analyze",
        "analysis",
        "ask-question",
    )):
        return {"detail": "Not Found"}

    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"detail": "Not Found"}
