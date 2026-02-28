from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "NebulaGlass AI"}
