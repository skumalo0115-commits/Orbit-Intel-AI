from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.document import Document
from backend.models.user import User
from backend.schemas.document import DocumentDetailResponse, DocumentResponse
from backend.services.dependencies import get_current_user
from backend.services.storage import blob_storage_enabled, delete_upload, save_upload

router = APIRouter(tags=["documents"])

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed = {".pdf", ".docx", ".doc", ".txt", ".csv", ".rtf", ".png", ".jpg", ".jpeg"}
    file_name = file.filename or "document"
    extension = file_name[file_name.rfind(".") :].lower() if "." in file_name else ""
    if extension not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    file_bytes = file.file.read()

    if blob_storage_enabled() and len(file_bytes) > 4_400_000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="This file is too large for Vercel server uploads. Keep uploads under 4.4 MB or switch to client uploads.",
        )

    stored_path = save_upload(
        file_name=file_name,
        file_bytes=file_bytes,
        user_id=current_user.id,
        content_type=file.content_type,
    )

    # Keep upload fast and reliable: defer heavy text extraction to analysis time.
    document = Document(user_id=current_user.id, filename=file_name, file_path=stored_path, text="")
    db.add(document)
    db.commit()
    db.refresh(document)
    return {"id": document.id, "filename": document.filename, "upload_date": document.upload_date, "is_analyzed": False}


@router.get("/documents", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "upload_date": doc.upload_date,
            "is_analyzed": bool(doc.analysis),
        }
        for doc in docs
    ]


@router.get("/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return {"id": doc.id, "filename": doc.filename, "upload_date": doc.upload_date, "text": doc.text, "is_analyzed": bool(doc.analysis)}


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    delete_upload(doc.file_path)

    db.delete(doc)
    db.commit()
