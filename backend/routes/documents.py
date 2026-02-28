import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.ai.extraction import TextExtractor
from backend.database.config import get_settings
from backend.database.session import get_db
from backend.models.document import Document
from backend.models.user import User
from backend.schemas.document import DocumentDetailResponse, DocumentResponse
from backend.services.dependencies import get_current_user

router = APIRouter(tags=["documents"])
settings = get_settings()


@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed = {".pdf", ".docx", ".txt", ".csv", ".png", ".jpg", ".jpeg"}
    extension = Path(file.filename).suffix.lower()
    if extension not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    target_path = upload_dir / f"{current_user.id}_{file.filename}"

    with target_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = TextExtractor.extract(str(target_path))
    document = Document(user_id=current_user.id, filename=file.filename, file_path=str(target_path), text=text)
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/documents", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()


@router.get("/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc
