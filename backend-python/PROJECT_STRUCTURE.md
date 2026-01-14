# Python FastAPI 后端项目结构说明

## 项目概述

这是一个使用 **FastAPI** 构建的 Todo REST API，采用现代化的异步框架和类型提示。

## 目录结构

```
backend-python/
├── app/
│   ├── __init__.py
│   ├── main.py                                  # 应用程序入口
│   │
│   ├── core/                                    # 核心配置
│   │   ├── __init__.py
│   │   ├── security.py                          # 安全模块（JWT、密码）
│   │   └── dependencies.py                      # 依赖注入（获取当前用户）
│   │
│   ├── database/                                # 数据库配置
│   │   ├── __init__.py
│   │   └── config.py                            # SQLAlchemy 配置
│   │
│   ├── models/                                  # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── user.py                              # 用户模型
│   │   ├── todo.py                              # Todo 模型
│   │   ├── category.py                          # 分类模型
│   │   └── subtask.py                           # 子任务模型
│   │
│   ├── schemas/                                 # Pydantic 模式（DTO）
│   │   ├── __init__.py
│   │   ├── auth.py                              # 认证相关模式
│   │   ├── todo.py                              # Todo 模式
│   │   └── category.py                          # 分类模式
│   │
│   ├── routers/                                 # 路由（控制器）
│   │   ├── __init__.py
│   │   ├── auth.py                              # 认证路由
│   │   ├── todos.py                             # Todo 路由
│   │   └── categories.py                        # 分类路由
│   │
│   └── utils/                                   # 工具函数（可选）
│       └── __init__.py
│
├── alembic/                                     # 数据库迁移工具
│   ├── versions/                                # 迁移版本文件
│   └── env.py                                   # Alembic 配置
│
├── tests/                                       # 测试文件
│   ├── __init__.py
│   ├── test_auth.py                             # 认证测试
│   ├── test_todos.py                            # Todo 测试
│   └── conftest.py                              # pytest 配置
│
├── .env                                         # 环境变量
├── requirements.txt                             # 项目依赖
├── alembic.ini                                  # Alembic 配置
└── README.md
```

## 核心概念详解

### 1. FastAPI 应用结构

FastAPI 是一个现代、快速的 Python Web 框架，基于类型提示。

**基本应用：**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Todo API",
    description="A modern Todo application",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router)
app.include_router(todos_router)
```

### 2. 路由和路径操作（Routers & Path Operations）

**路由定义：**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.todo import TodoCreate, TodoResponse
from app.models import Todo

router = APIRouter(prefix="/todos", tags=["Todos"])

@router.get("/", response_model=List[TodoResponse])
def get_all_todos(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """获取所有 Todo"""
    return todo_service.get_all(skip=skip, limit=limit)

@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user)
):
    """创建 Todo"""
    return todo_service.create(todo_data, current_user.id)

@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int):
    """获取单个 Todo"""
    todo = todo_service.get_by_id(todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return todo
```

**路径参数、查询参数和请求体：**

```python
@router.put("/{todo_id}")  # 路径参数
def update_todo(
    todo_id: int,                    # 路由参数（URL 中）
    todo_update: TodoUpdate,          # 请求体（JSON）
    priority: str | None = None,      # 查询参数（?priority=high）
    current_user: User = Depends(get_current_user)  # 依赖注入
):
    return todo_service.update(todo_id, todo_update)
```

### 3. Pydantic 模式（Schemas）

Pydantic 用于数据验证和序列化。

**Schema 定义：**

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# 基础 Schema
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    avatar: Optional[str] = None

# 创建 Schema
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# 响应 Schema
class UserResponse(UserBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True  # 支持从 ORM 模型创建

# 登录 Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Token Schema
class Token(BaseModel):
    accessToken: str
    user: UserResponse
```

**验证示例：**

```python
from pydantic import BaseModel, validator

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: str = Field(default="medium", regex="^(low|medium|high)$")
    dueDate: Optional[datetime] = None
    categoryId: Optional[int] = None

    @validator('dueDate')
    def validate_due_date(cls, v):
        if v and v < datetime.now():
            raise ValueError('截止日期不能早于当前时间')
        return v
```

### 4. SQLAlchemy 模型（Models）

使用 SQLAlchemy ORM 定义数据库模型。

**模型定义：**

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.config import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    avatar = Column(String(255), default="")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    todos = relationship("Todo", back_populates="user")
    categories = relationship("Category", back_populates="user")

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum('low', 'medium', 'high'), default='medium')
    isCompleted = Column(Boolean, default=False)
    progress = Column(Integer, default=0)
    dueDate = Column(DateTime(timezone=True), nullable=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    categoryId = Column(Integer, ForeignKey("categories.id"), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="todos")
    category = relationship("Category", back_populates="todos")
    subtasks = relationship("SubTask", back_populates="todo", cascade="all, delete-orphan")
```

**关系映射：**
- `relationship()`：定义 ORM 关系
- `ForeignKey()`：定义外键约束
- `back_populates`：双向关系的另一端
- `cascade`：级联操作（如删除 Todo 时同时删除 SubTask）

### 5. 数据库依赖（Dependencies）

使用依赖注入获取数据库会话和当前用户。

**获取数据库会话：**

```python
from sqlalchemy.orm import Session
from app.database.config import get_db

def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 使用
@router.post("/")
def create_todo(
    todo_data: TodoCreate,
    db: Session = Depends(get_db)  # 自动注入数据库会话
):
    todo = Todo(**todo_data.dict())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo
```

**获取当前用户：**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import User
from app.core.security import decode_access_token

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前认证用户"""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )

    return user

# 使用
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

### 6. 异常处理

```python
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "statusCode": exc.status_code
        },
    )

# 抛出异常
if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="用户不存在"
    )
```

### 7. 中间件

```python
from fastapi import Request
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """添加请求处理时间到响应头"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 8. 背景任务

```python
from fastapi import BackgroundTasks

def send_email(email: str, message: str):
    """发送邮件（后台任务）"""
    # 发送邮件逻辑
    pass

@router.post("/register")
def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = create_user(user_data, db)

    # 添加后台任务
    background_tasks.add_task(send_email, user.email, "欢迎注册！")

    return user
```

### 9. 文件上传

```python
from fastapi import File, UploadFile

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传文件"""
    contents = await file.read()

    # 保存文件
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(contents)

    return {"filename": file.filename}
```

### 10. WebSocket 支持

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 连接"""
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"收到消息: {data}")
```

### 11. 数据库迁移（Alembic）

**创建迁移：**

```bash
# 生成迁移文件
alembic revision --autogenerate -m "添加用户表"

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

**迁移文件示例：**

```python
# alembic/versions/001_add_users_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

def downgrade():
    op.drop_index('ix_users_username', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
```

### 12. 测试

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "password" not in data

def test_login_user():
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert "user" in data

@pytest.fixture
def test_user(db):
    """创建测试用户"""
    user = User(
        username="testuser",
        email="test@example.com",
        password="hashed_password"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_get_todos(test_user, client):
    """测试获取 Todo 列表"""
    # 先登录获取 token
    login_response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["accessToken"]

    # 使用 token 访问受保护的路由
    response = client.get(
        "/todos",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
```

## 学习建议

### 入门阶段（1-2 周）
1. 理解 FastAPI 的路由和路径操作
2. 掌握 Pydantic 模式和数据验证
3. 学习创建 REST API

### 进阶阶段（3-4 周）
1. 深入学习 SQLAlchemy ORM
2. 理解依赖注入系统
3. 掌握数据库迁移（Alembic）

### 实战阶段（5-6 周）
1. 实现完整的 CRUD 功能
2. 添加 JWT 认证
3. 编写单元测试和集成测试

### 扩展学习
1. 异步编程（async/await）
2. WebSocket 实时通信
3. 任务队列（Celery）
4. 微服务架构

## 推荐资源

- **官方文档**：https://fastapi.tiangolo.com
- **教程推荐**：
  - FastAPI 官方教程
  - TestCode.io FastAPI 教程
- **书籍**：
  - 《FastAPI Web 开发》
  - 《Python Web 开发实战》

## 依赖管理

**requirements.txt：**

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pymysql==1.1.0
cryptography==41.0.7
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic[email]==2.5.3
pydantic-settings==2.1.0
alembic==1.13.1
pytest==7.4.4
httpx==0.26.0
```

**安装依赖：**

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

**运行应用：**

```bash
# 开发环境（自动重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产环境
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
