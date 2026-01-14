# Todo Backend - FastAPI (Python) 版本说明

## 📖 技术栈介绍

### FastAPI 框架
- **语言**: Python 3.9+
- **框架**: FastAPI
- **ORM**: SQLAlchemy
- **数据库**: MySQL (PyMySQL 驱动)
- **数据验证**: Pydantic
- **ASGI 服务器**: Uvicorn
- **端口**: 3001

### FastAPI 优势
- ⚡ **高性能**: 可与 NodeJS 和 Go 相媲美的性能
- 📝 **自动文档**: 自动生成交互式 API 文档 (Swagger UI)
- 🔒 **类型安全**: 基于 Python 类型提示的完整类型检查
- 🎯 **现代化**: 完全支持 async/await 异步编程
- 🚀 **快速开发**: ���洁的语法，快速开发 REST API
- 📊 **数据验证**: Pydantic 提供强大的数据验证和序列化

## 🗂️ 项目结构

```
backend-python/
├── app/
│   ├── models/            # SQLAlchemy 数据库模型
│   │   ├── user.py       # 用户模型
│   │   ├── todo.py       # 任务模型
│   │   ├── category.py   # 分类模型
│   │   └── subtask.py    # 子任务模型
│   ├── schemas/          # Pydantic 数据验证模型
│   │   ├── todo.py       # 任务相关 Schema
│   │   └── category.py   # 分类相关 Schema
│   ├── routers/          # API 路由
│   │   ├── todos.py      # 任务路由
│   │   └── categories.py # 分类路由
│   └── database/         # 数据库配置
│       └── config.py     # 数据库连接和会话
├── main.py               # 应用入口
├── requirements.txt      # Python 依赖
└── .env                 # 环境变量
```

## 🔌 API 端点说明

### 基础端点
- `GET /` - 欢迎信息
- `GET /health` - 健康检查
- `GET /docs` - Swagger UI 交互式文档
- `GET /redoc` - ReDoc 文档

### 任务管理 (Todo)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/todos` | 创建任务（支持同时创建子任务） |
| GET | `/todos` | 获取所有任务（支持搜索和过滤） |
| GET | `/todos/statistics` | 获取统计数据 |
| GET | `/todos/:id` | 获取单个任务详情 |
| PATCH | `/todos/:id` | 更新任务 |
| PATCH | `/todos/:id/toggle` | 切换任务完成状态 |
| DELETE | `/todos/:id` | 删除任务 |
| DELETE | `/todos/batch` | 批量删除任务 |
| PATCH | `/todos/batch/update` | 批量更新任务状态 |

### 子任务管理 (SubTask)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/todos/:todoId/subtasks` | 为任务创建子任务 |
| PATCH | `/todos/subtasks/:id/toggle` | 切换子任务完成状态 |
| DELETE | `/todos/subtasks/:id` | 删除子任务 |

### 分类管理 (Category)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/categories` | 创建分类 |
| GET | `/categories` | 获取所有分类 |
| GET | `/categories/:id` | 获取单个分类 |
| PATCH | `/categories/:id` | 更新分类 |
| DELETE | `/categories/:id` | 删除分类 |

## 🎯 核心功能实现

### 1. 任务 CRUD 操作
```python
# 创建任务
@router.post("", response_model=TodoResponse)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(**todo.dict(), userId=1)
    db.add(db_todo)
    db.commit()
    return db_todo
```

### 2. 子任务管理
```python
# 自动计算进度
def calculate_progress(db: Session, todo_id: int):
    subtasks = db.query(SubTask).filter(SubTask.todoId == todo_id).all()
    if not subtasks:
        return 0
    completed = sum(1 for st in subtasks if st.isCompleted)
    return round((completed / len(subtasks)) * 100)
```

### 3. 搜索与过滤
```python
# 多条件查询
query = db.query(Todo).filter(Todo.userId == 1)

if search:
    query = query.filter(
        (Todo.title.like(f"%{search}%")) |
        (Todo.description.like(f"%{search}%"))
    )

if priority:
    query = query.filter(Todo.priority == priority)

todos = query.order_by(Todo.createdAt.desc()).all()
```

### 4. 统计功能
```python
@router.get("/statistics", response_model=Statistics)
def get_statistics(db: Session = Depends(get_db)):
    todos = db.query(Todo).filter(Todo.userId == 1).all()

    return Statistics(
        total=len(todos),
        completed=sum(1 for t in todos if t.isCompleted),
        pending=sum(1 for t in todos if not t.isCompleted),
        completion_rate=round((completed / total * 100)) if total > 0 else 0,
        priority_stats={...},
        overdue_count=...
    )
```

## 🚀 启动命令

### 开发模式（支持热重载）
```bash
cd backend-python
PYTHONPATH=/Users/fengzhongjincao/Documents/hhCode/nestjs/backend-python \
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 3001
```

### 使用启动脚本
```bash
./start.sh
```

### 生产模式
```bash
cd backend-python
python3 -m uvicorn main:app --host 0.0.0.0 --port 3001 --workers 4
```

## 📊 数据库模型 (SQLAlchemy)

### Todo 模型
```python
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    isCompleted = Column(Boolean, default=False)
    priority = Column(Enum(Priority), default=Priority.medium)
    dueDate = Column(DateTime, nullable=True)
    userId = Column(Integer, ForeignKey("users.id"))
    categoryId = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="todos")
    subtasks = relationship("SubTask", back_populates="todo", cascade="all, delete-orphan")
```

### Category 模型
```python
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    color = Column(String(255), default="#3B82F6")
    icon = Column(String(255), default="")
    userId = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="categories")
    todos = relationship("Todo", back_populates="category")
```

### SubTask 模型
```python
class SubTask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    isCompleted = Column(Boolean, default=False)
    todoId = Column(Integer, ForeignKey("todos.id"))

    todo = relationship("Todo", back_populates="subtasks")
```

## 📝 Pydantic Schema 示例

### 创建任务 Schema
```python
class TodoCreate(BaseModel):
    title: str
    description: str = ""
    priority: Priority = Priority.medium
    dueDate: Optional[datetime] = None
    categoryId: Optional[int] = None
    subtasks: Optional[List[SubTaskCreate]] = []
```

### 响应 Schema
```python
class TodoResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: Priority
    isCompleted: bool
    progress: int
    category: Optional[CategoryResponse] = None
    subtasks: List[SubTaskResponse] = []

    class Config:
        from_attributes = True  # SQLAlchemy 模型支持
```

## 🛠️ 依赖说明

```
fastapi==0.104.1       # Web 框架
uvicorn[standard]==0.24.0  # ASGI 服务器
sqlalchemy==2.0.23     # ORM
pymysql==1.1.0         # MySQL 驱动
python-dotenv==1.0.0   # 环境变量
pydantic==2.5.0        # 数据验证
python-multipart==0.0.6 # 表单数据支持
```

## ✨ FastAPI 特性展示

### 1. 自动 API 文档
访问 `http://localhost:3001/docs` 查看 Swagger UI
- 🔍 交互式 API 测试
- 📝 自动生成请求/响应示例
- 🎯 参数验证说明

### 2. 类型提示优势
```python
# 完整的类型检查
def get_todos(
    search: Optional[str] = None,      # 可选搜索关键词
    priority: Optional[str] = None,    # 可选优先级过滤
    db: Session = Depends(get_db)       # 依赖注入
) -> List[TodoResponse]:               # 返回类型
    ...
```

### 3. 自动数据验证
```python
# Pydantic 自动验证请求体
class TodoCreate(BaseModel):
    title: str                          # 必填
    description: str = ""              # 默认值
    priority: Priority = Priority.medium  # 枚举验证
```

### 4. 依赖注入
```python
# 数据库会话依赖注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 自动使用
@router.post("")
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    ...
```

## 🔍 代码示例

### 查询过滤
```python
@router.get("")
def get_todos(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    categoryId: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Todo).filter(Todo.userId == 1)

    if search:
        query = query.filter(
            Todo.title.like(f"%{search}%")
        )

    todos = query.all()
    return todos
```

### 创建带子任务的任务
```python
todo_data = {
    "title": "完成项目报告",
    "description": "Q4季度报告",
    "priority": "high",
    "subtasks": [
        {"title": "收集数据"},
        {"title": "制作图表"}
    ]
}
```

## 📊 性能特性

- ⚡ **异步支持**: 可使用 `async/await` 提升性能
- 🔄 **连接池**: SQLAlchemy 自动管理数据库连接池
- 📈 **可扩展**: 支持水平扩展（多 worker 进程）

## 🔗 相关文档

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [Uvicorn 文档](https://www.uvicorn.org/)

## 💡 最佳实践

1. **使用类型提示**: 所有函数都使用完整的类型注解
2. **依赖注入**: 使用 `Depends` 管理数据库会话等依赖
3. **Pydantic 验证**: 所有输入输出都使用 Schema 验证
4. **异常处理**: 使用 `HTTPException` 返回标准错误
5. **API 文档**: 充分利用自动生成的 Swagger UI

---

**版本**: 1.0.0
**最后更新**: 2026-01-09
