from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.config import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    color = Column(String(255), default="#3B82F6")
    icon = Column(String(255), default="")
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="categories")
    todos = relationship("Todo", back_populates="category")
