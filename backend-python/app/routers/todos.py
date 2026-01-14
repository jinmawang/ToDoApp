from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
from app.database.config import get_db
from app.models import Todo, SubTask, Category, Priority
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse, SubTaskCreate, SubTaskResponse, Statistics

router = APIRouter(prefix="/todos", tags=["todos"])

def calculate_progress(db: Session, todo_id: int):
    """计算任务进度"""
    subtasks = db.query(SubTask).filter(SubTask.todoId == todo_id).all()
    if not subtasks:
        return 0
    completed = sum(1 for st in subtasks if st.isCompleted)
    return round((completed / len(subtasks)) * 100)

@router.post("", response_model=TodoResponse)
def create_todo(
    todo: TodoCreate,
    db: Session = Depends(get_db)
):
    """创建任务"""
    # 创建主任务
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        priority=todo.priority,
        dueDate=todo.dueDate,
        categoryId=todo.categoryId,
        userId=1  # 临时硬编码用户ID
    )
    db.add(db_todo)
    db.flush()  # 获取 ID

    # 创建子任务
    if todo.subtasks:
        for subtask_data in todo.subtasks:
            db_subtask = SubTask(
                title=subtask_data.title,
                todoId=db_todo.id
            )
            db.add(db_subtask)

        # 更新进度
        db_todo.progress = calculate_progress(db, db_todo.id)

    db.commit()
    db.refresh(db_todo)

    # 重新查询以获取关联数据
    db_todo = db.query(Todo).filter(Todo.id == db_todo.id).first()
    return db_todo

@router.get("", response_model=List[TodoResponse])
def get_todos(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    categoryId: Optional[int] = None,
    isCompleted: Optional[bool] = None,
    dueDate: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取任务列表（支持搜索和过滤）"""
    query = db.query(Todo).filter(Todo.userId == 1)  # 临时硬编码用户ID

    # 搜索
    if search:
        query = query.filter(
            (Todo.title.like(f"%{search}%")) |
            (Todo.description.like(f"%{search}%"))
        )

    # 优先级过滤
    if priority:
        query = query.filter(Todo.priority == priority)

    # 分类过滤
    if categoryId is not None:
        query = query.filter(Todo.categoryId == categoryId)

    # 完成状态过滤
    if isCompleted is not None:
        query = query.filter(Todo.isCompleted == isCompleted)

    # 截止日期过滤
    if dueDate:
        query = query.filter(Todo.dueDate == dueDate)

    todos = query.order_by(Todo.createdAt.desc()).all()
    return todos

@router.get("/statistics", response_model=Statistics)
def get_statistics(
    db: Session = Depends(get_db)
):
    """获取统计数据"""
    todos = db.query(Todo).filter(Todo.userId == 1).all()  # 临时硬编码用户ID

    total = len(todos)
    completed = sum(1 for t in todos if t.isCompleted)
    pending = total - completed
    completion_rate = round((completed / total * 100)) if total > 0 else 0

    # 优先级统计
    priority_stats = {
        "high": sum(1 for t in todos if t.priority == Priority.high),
        "medium": sum(1 for t in todos if t.priority == Priority.medium),
        "low": sum(1 for t in todos if t.priority == Priority.low)
    }

    # 逾期统计
    from datetime import date
    today = date.today()
    overdue_count = sum(
        1 for t in todos
        if t.dueDate and not t.isCompleted
        and (t.dueDate.date() if isinstance(t.dueDate, datetime) else t.dueDate) < today
    )

    return Statistics(
        total=total,
        completed=completed,
        pending=pending,
        completionRate=completion_rate,
        priorityStats=priority_stats,
        overdueCount=overdue_count
    )

@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    db: Session = Depends(get_db)
):
    """获取单个任务"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.userId == 1).first()  # 临时硬编码用户ID
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")
    return todo

@router.patch("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    db: Session = Depends(get_db)
):
    """更新任务"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.userId == 1).first()  # 临时硬编码用户ID
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = todo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)
    return todo

@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(
    todo_id: int,
    db: Session = Depends(get_db)
):
    """切换任务完成状态"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.userId == 1).first()  # 临时硬编码用户ID
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")

    todo.isCompleted = not todo.isCompleted
    db.commit()
    db.refresh(todo)
    return todo

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db)
):
    """删除任务"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.userId == 1).first()  # 临时硬编码用户ID
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(todo)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.delete("/batch", status_code=204)
def batch_delete_todos(
    ids: List[int],
    db: Session = Depends(get_db)
):
    """批量删除任务"""
    db.query(Todo).filter(Todo.id.in_(ids), Todo.userId == 1).delete(synchronize_session=False)  # 临时硬编码用户ID
    db.commit()
    return

@router.patch("/batch/update", response_model=List[TodoResponse])
def batch_update_todos(
    ids: List[int],
    isCompleted: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """批量更新任务"""
    todos = db.query(Todo).filter(Todo.id.in_(ids), Todo.userId == 1).all()  # 临时硬编码用户ID

    if isCompleted is not None:
        for todo in todos:
            todo.isCompleted = isCompleted

    db.commit()
    return todos

# 子任务路由
@router.post("/{todo_id}/subtasks", response_model=SubTaskResponse)
def create_subtask(
    todo_id: int,
    subtask: SubTaskCreate,
    db: Session = Depends(get_db)
):
    """创建子任务"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.userId == 1).first()  # 临时硬编码用户ID
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")

    db_subtask = SubTask(
        title=subtask.title,
        todoId=todo_id
    )
    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)

    # 更新主任务进度
    todo.progress = calculate_progress(db, todo_id)
    db.commit()

    return db_subtask

@router.patch("/subtasks/{subtask_id}/toggle", response_model=SubTaskResponse)
def toggle_subtask(
    subtask_id: int,
    db: Session = Depends(get_db)
):
    """切换子任务完成状态"""
    # 获取子任务并验证权限
    subtask = db.query(SubTask).join(Todo).filter(
        SubTask.id == subtask_id,
        Todo.userId == 1  # 临时硬编码用户ID
    ).first()

    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    subtask.isCompleted = not subtask.isCompleted
    db.commit()
    db.refresh(subtask)

    # 更新主任务进度
    subtask.todo.progress = calculate_progress(db, subtask.todoId)
    db.commit()

    return subtask

@router.delete("/subtasks/{subtask_id}")
def delete_subtask(
    subtask_id: int,
    db: Session = Depends(get_db)
):
    """删除子任务"""
    # 获取子任务并验证权限
    subtask = db.query(SubTask).join(Todo).filter(
        SubTask.id == subtask_id,
        Todo.userId == 1  # 临时硬编码用户ID
    ).first()

    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    todo_id = subtask.todoId
    db.delete(subtask)
    db.commit()

    # 更新主任务进度
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if todo:
        todo.progress = calculate_progress(db, todo_id)
        db.commit()

    return {"message": "Subtask deleted successfully"}
