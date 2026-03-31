from pathlib import Path
import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from backend.database.config import Settings
from backend.database.session import Base, engine, ensure_user_schema
from backend.models import analysis, document, user  # noqa: F401
from backend.routes.analysis import router as analysis_router
from backend.routes.auth import router as auth_router
from backend.routes.documents import router as documents_router

app = FastAPI(title="NebulaGlass AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
ensure_user_schema()

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(analysis_router)

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="frontend-assets")


@app.get("/")
def healthcheck():
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"status": "ok", "service": "NebulaGlass AI"}


@app.get("/env-check")
def env_check():
    settings = Settings()

    required = {
        "SECRET_KEY": bool((os.getenv("SECRET_KEY", "").strip() or settings.secret_key).strip()),
        "DATABASE_URL": bool((os.getenv("DATABASE_URL", "").strip() or settings.database_url).strip()),
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
    }

    return {
        "ready": all(required.values()),
        "required": required,
        "optional": optional,
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


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    if full_path.startswith(("auth", "upload", "documents", "analyze", "analysis", "ask-question")):
        return {"detail": "Not Found"}

    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"detail": "Not Found"}
