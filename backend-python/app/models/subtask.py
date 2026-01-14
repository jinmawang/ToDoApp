from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.config import Base

class SubTask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    isCompleted = Column(Boolean, default=False)
    todoId = Column(Integer, ForeignKey("todos.id", ondelete="CASCADE"), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    todo = relationship("Todo", back_populates="subtasks")
