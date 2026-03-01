from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.ai.extraction import TextExtractor
from backend.ai.pipeline import ai_pipeline
from backend.database.session import get_db
from backend.models.analysis import Analysis
from backend.models.document import Document
from backend.models.user import User
from backend.schemas.document import AnalysisResponse
from backend.services.dependencies import get_current_user

router = APIRouter(tags=["analysis"])


class QuestionRequest(BaseModel):
    question: str


class AnalyzeRequest(BaseModel):
    skills: str | None = None
    interests: str | None = None
    profession: str | None = None
    target_job_title: str | None = None
    target_job_description: str | None = None


@router.post("/analyze/{document_id}", response_model=AnalysisResponse)
def analyze_document(
    document_id: int,
    payload: AnalyzeRequest | None = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    text_content = (doc.text or "").strip()
    if not text_content:
        try:
            text_content = TextExtractor.extract(doc.file_path)
            doc.text = text_content
            db.add(doc)
            db.commit()
            db.refresh(doc)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"We could not read this file for analysis. Please upload PDF, DOCX, DOC, TXT, CSV, RTF, PNG, or JPG/JPEG. ({exc})",
            ) from exc

    profile_context = {
        "skills": payload.skills or "",
        "interests": payload.interests or "",
        "profession": payload.profession or payload.interests or "",
        "target_job_title": payload.target_job_title or "",
        "target_job_description": payload.target_job_description or "",
    } if payload else {}
    try:
        result = ai_pipeline.analyze(text_content, profile_context=profile_context)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    record = db.query(Analysis).filter(Analysis.document_id == doc.id).first()
    if not record:
        record = Analysis(document_id=doc.id)
        db.add(record)

    record.summary = result["summary"]
    record.classification = result["classification"]
    record.entities = result["entities"]
    record.embeddings = result["embeddings"]
    record.insights = result["insights"]
    db.commit()
    return AnalysisResponse(document_id=doc.id, **result)


@router.get("/analysis/{document_id}", response_model=AnalysisResponse)
def get_analysis(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = (
        db.query(Analysis)
        .join(Document, Document.id == Analysis.document_id)
        .filter(Analysis.document_id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return AnalysisResponse(
        document_id=record.document_id,
        summary=record.summary,
        classification=record.classification,
        entities=record.entities,
        embeddings=record.embeddings,
        insights=record.insights,
    )


@router.post("/ask-question/{document_id}")
def ask_question(
    document_id: int,
    payload: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    text = doc.text or ""
    summary = " ".join(text.split()[:120])
    return {
        "question": payload.question,
        "answer": f"Contextual answer (baseline): {summary}",
    }
