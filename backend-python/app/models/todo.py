from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.config import Base
import enum

class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    isCompleted = Column(Boolean, default=False)
    priority = Column(Enum(Priority), default=Priority.medium)
    dueDate = Column(DateTime, nullable=True)
    hasReminder = Column(Boolean, default=False)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    categoryId = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    parentId = Column(Integer, ForeignKey("todos.id", ondelete="CASCADE"), nullable=True)
    progress = Column(Integer, default=0)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="todos")
    category = relationship("Category", back_populates="todos")
    subtasks = relationship("SubTask", back_populates="todo", cascade="all, delete-orphan")
    parent = relationship("Todo", remote_side=[id], backref="children")
