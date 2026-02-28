from sqlalchemy import Column, ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import relationship

from backend.database.session import Base


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    classification = Column(Text, nullable=True)
    entities = Column(JSON, nullable=True)
    embeddings = Column(JSON, nullable=True)
    insights = Column(JSON, nullable=True)

    document = relationship("Document", back_populates="analysis")
