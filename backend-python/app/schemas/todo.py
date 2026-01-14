from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.todo import Priority

# SubTask Schema
class SubTaskBase(BaseModel):
    title: str

class SubTaskCreate(SubTaskBase):
    pass

class SubTaskResponse(SubTaskBase):
    id: int
    isCompleted: bool
    todoId: int
    createdAt: datetime

    class Config:
        from_attributes = True

# Category Schema
class CategoryBase(BaseModel):
    name: str
    color: str = "#3B82F6"
    icon: str = ""

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Todo Schema
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Priority = Priority.medium
    dueDate: Optional[datetime] = None
    categoryId: Optional[int] = None

class TodoCreate(TodoBase):
    subtasks: Optional[List[SubTaskCreate]] = []

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    isCompleted: Optional[bool] = None
    priority: Optional[Priority] = None
    dueDate: Optional[datetime] = None
    categoryId: Optional[int] = None
    progress: Optional[int] = None

class TodoResponse(TodoBase):
    id: int
    isCompleted: bool
    userId: int
    progress: int
    createdAt: datetime
    updatedAt: datetime
    category: Optional[CategoryResponse] = None
    subtasks: List[SubTaskResponse] = []

    class Config:
        from_attributes = True

# Statistics Schema
class Statistics(BaseModel):
    total: int
    completed: int
    pending: int
    completionRate: int
    priorityStats: dict
    overdueCount: int
