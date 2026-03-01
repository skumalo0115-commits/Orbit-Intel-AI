from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.database.session import Base, engine
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


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    if full_path.startswith(("auth", "upload", "documents", "analyze", "analysis", "ask-question")):
        return {"detail": "Not Found"}

    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"detail": "Not Found"}
