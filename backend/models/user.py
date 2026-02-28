from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from backend.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
