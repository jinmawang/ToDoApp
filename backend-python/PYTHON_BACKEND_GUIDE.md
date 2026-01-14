# Python 后端项目文件说明（前端开发者视角）

## 📁 项目结构总览

```
backend-python/
├── main.py                    # 🚪 入口文件（类似 Vue 的 main.ts）
├── requirements.txt           # 📦 依赖列表（类似 package.json）
├── app/                       # 📂 应用主目录（类似 src/）
│   ├── __init__.py           # Python 包标识文件
│   ├── database/             # 💾 数据库配置（类似数据库连接配置）
│   │   ├── __init__.py
│   │   └── config.py        # 数据库连接配置
│   ├── models/               # 🗄️ 数据模型（类似 TypeScript 的 Entity）
│   │   ├── todo.py          # Todo 数据模型
│   │   ├── user.py          # 用户数据模型
│   │   ├── category.py      # 分类数据模型
│   │   └── subtask.py       # 子任务数据模型
│   ├── schemas/              # 📋 数据验证（类似 DTO）
│   │   ├── todo.py          # Todo 的请求/响应格式
│   │   └── category.py      # Category 的请求/响应格式
│   └── routers/              # 🛣️ 路由（类似 Vue Router）
│       ├── todos.py         # Todo 相关的 API 路由
│       └── categories.py     # Category 相关的 API 路由
```

---

## 🔑 核心文件详解

### 1. `main.py` - 应用入口（类似 Vue 的 main.ts）

**作用**：启动应用，配置全局设置

**类比前端**：
- 就像 Vue 的 `main.ts`，是应用的入口点
- 配置 CORS（跨域），让前端可以访问
- 注册路由（类似 Vue Router）

**关键代码解释**：

```python
# 创建 FastAPI 应用（类似 new Vue()）
app = FastAPI(
    title="Todo API",
    description="A modern Todo application built with FastAPI",
    version="1.0.0"
)

# 配置 CORS（允许前端跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],   # 允许所有请求头
)

# 注册路由（类似 router.addRoute()）
app.include_router(todos_router)      # Todo 相关路由
app.include_router(categories_router) # Category 相关路由
```

**前端对应**：
```typescript
// Vue Router 配置
const router = createRouter({
  routes: [
    { path: '/todos', component: TodoView },
    { path: '/categories', component: CategoryView }
  ]
})
```

---

### 2. `app/database/config.py` - 数据库配置

**作用**：连接 MySQL 数据库

**类比前端**：
- 就像前端的 API 配置文件（axios 的 baseURL 配置）
- 管理数据库连接，类似管理 HTTP 客户端

**关键代码解释**：

```python
# 数据库连接地址（类似 axios 的 baseURL）
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/todo_db"
# 格式：mysql+pymysql://用户名:密码@主机:端口/数据库名

# 创建数据库引擎（类似创建 axios 实例）
engine = create_engine(DATABASE_URL)

# 创建数据库会话工厂（类似创建 API 请求函数）
SessionLocal = sessionmaker(bind=engine)

# 获取数据库会话（每次请求时调用，类似 axios.get()）
def get_db():
    db = SessionLocal()
    try:
        yield db  # 返回数据库连接
    finally:
        db.close()  # 请求结束后关闭连接
```

**前端对应**：
```typescript
// axios 配置
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})
```

---

### 3. `app/models/todo.py` - 数据模型（类似 TypeScript Entity）

**作用**：定义数据库表结构

**类比前端**：
- 就像 TypeScript 的 `interface` 或 `type`
- 定义 Todo 在数据库中的结构

**关键代码解释**：

```python
class Todo(Base):
    __tablename__ = "todos"  # 数据库表名

    # 字段定义（类似 TypeScript interface）
    id = Column(Integer, primary_key=True)  # 主键，自增
    title = Column(String(255), nullable=False)  # 标题，必填
    description = Column(Text, nullable=True)  # 描述，可选
    isCompleted = Column(Boolean, default=False)  # 完成状态，默认 false
    priority = Column(Enum(Priority), default=Priority.medium)  # 优先级
    userId = Column(Integer, ForeignKey("users.id"))  # 外键，关联用户
    createdAt = Column(DateTime, server_default=func.now())  # 创建时间

    # 关联关系（类似 Vue 的 computed 属性）
    user = relationship("User", back_populates="todos")  # 关联用户
    category = relationship("Category", back_populates="todos")  # 关联分类
    subtasks = relationship("SubTask", back_populates="todo")  # 关联子任务
```

**前端对应**：
```typescript
// TypeScript interface
interface Todo {
  id: number
  title: string
  description?: string
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high'
  userId: number
  createdAt: Date
}
```

---

### 4. `app/schemas/todo.py` - 数据验证（类似 DTO）

**作用**：定义 API 请求和响应的数据格式

**类比前端**：
- 就像 TypeScript 的类型定义
- 验证前端传来的数据是否符合要求

**关键代码解释**：

```python
# 创建 Todo 的请求格式（类似 CreateTodoDto）
class TodoCreate(BaseModel):
    title: str  # 必填
    description: Optional[str] = ""  # 可选，默认空字符串
    priority: Priority = Priority.medium  # 可选，默认中等
    categoryId: Optional[int] = None  # 可选

# 更新 Todo 的请求格式（类似 UpdateTodoDto）
class TodoUpdate(BaseModel):
    title: Optional[str] = None  # 所有字段都是可选的
    isCompleted: Optional[bool] = None
    priority: Optional[Priority] = None

# Todo 的响应格式（返回给前端的数据结构）
class TodoResponse(BaseModel):
    id: int
    title: str
    isCompleted: bool
    createdAt: datetime
    category: Optional[CategoryResponse] = None  # 关联的分类
    subtasks: List[SubTaskResponse] = []  # 关联的子任务
```

**前端对应**：
```typescript
// TypeScript 类型定义
interface CreateTodoDto {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
}

interface Todo {
  id: number
  title: string
  isCompleted: boolean
  createdAt: string
  category?: Category
  subtasks: SubTask[]
}
```

---

### 5. `app/routers/todos.py` - API 路由（类似 Controller）

**作用**：处理 HTTP 请求，实现 CRUD 操作

**类比前端**：
- 就像 Vue 的 API 调用函数（在 store 或 service 中）
- 接收前端请求，操作数据库，返回数据

**关键代码解释**：

```python
# 创建路由（类似 Vue Router 的 router）
router = APIRouter(prefix="/todos", tags=["todos"])

# GET /todos - 获取所有 Todo（类似 axios.get('/todos')）
@router.get("", response_model=List[TodoResponse])
def get_todos(
    search: Optional[str] = None,  # 查询参数：搜索关键词
    priority: Optional[str] = None,  # 查询参数：优先级过滤
    db: Session = Depends(get_db)  # 注入数据库连接
):
    query = db.query(Todo)  # 查询 Todo 表
    
    # 如果有搜索关键词，过滤标题和描述
    if search:
        query = query.filter(
            (Todo.title.like(f"%{search}%")) |
            (Todo.description.like(f"%{search}%"))
        )
    
    todos = query.order_by(Todo.createdAt.desc()).all()  # 按创建时间倒序
    return todos  # 返回给前端

# POST /todos - 创建 Todo（类似 axios.post('/todos', data)）
@router.post("", response_model=TodoResponse)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    # 创建 Todo 对象
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        priority=todo.priority,
        userId=1  # 临时默认用户ID
    )
    db.add(db_todo)  # 添加到数据库
    db.commit()  # 提交保存
    db.refresh(db_todo)  # 刷新获取最新数据
    return db_todo  # 返回给前端

# PATCH /todos/{id} - 更新 Todo（类似 axios.patch(`/todos/${id}`, data)）
@router.patch("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo_update: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()  # 查找 Todo
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")  # 404 错误
    
    # 更新字段
    update_data = todo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.commit()  # 保存
    return todo  # 返回更新后的数据

# DELETE /todos/{id} - 删除 Todo（类似 axios.delete(`/todos/${id}`)）
@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(todo)  # 删除
    db.commit()  # 保存
    return {"message": "Task deleted successfully"}
```

**前端对应**：
```typescript
// Pinia Store 中的方法
export const useTodoStore = defineStore('todo', () => {
  async function fetchTodos() {
    const response = await axios.get('/todos')
    todos.value = response.data
  }

  async function addTodo(title: string) {
    const response = await axios.post('/todos', { title })
    todos.value.push(response.data)
  }

  async function toggleTodo(todo: Todo) {
    await axios.patch(`/todos/${todo.id}`, {
      isCompleted: !todo.isCompleted
    })
  }

  async function deleteTodo(id: number) {
    await axios.delete(`/todos/${id}`)
    todos.value = todos.value.filter(t => t.id !== id)
  }
})
```

---

## 🔄 数据流向对比

### 前端视角（Vue + Pinia）

```
用户操作
  ↓
Vue 组件调用
  ↓
Pinia Store（useTodoStore）
  ↓
axios 发送 HTTP 请求
  ↓
后端 API（Python FastAPI）
```

### 后端视角（Python FastAPI）

```
HTTP 请求到达
  ↓
Router（todos.py）接收请求
  ↓
Schema（todo.py）验证数据格式
  ↓
Model（todo.py）操作数据库
  ↓
Database（config.py）执行 SQL
  ↓
返回 JSON 响应给前端
```

---

## 📊 文件对应关系表

| Python 后端 | 前端对应 | 作用 |
|------------|---------|------|
| `main.py` | `main.ts` | 应用入口，全局配置 |
| `app/routers/todos.py` | `stores/todo.ts` | 处理 API 请求 |
| `app/models/todo.py` | `types/todo.ts` | 数据模型定义 |
| `app/schemas/todo.py` | `dto/create-todo.dto.ts` | 请求/响应格式 |
| `app/database/config.py` | `api/axios.ts` | 数据库/HTTP 连接配置 |
| `requirements.txt` | `package.json` | 依赖管理 |

---

## 🎯 关键概念对比

### 1. 装饰器（Decorator）

**Python**：
```python
@router.get("/todos")  # @ 符号是装饰器
def get_todos():
    return todos
```

**前端类比**：
- 类似 Vue 的 `@Component` 装饰器（如果使用 Class API）
- 或者类似 TypeScript 的装饰器

### 2. 依赖注入（Dependency Injection）

**Python**：
```python
def get_todos(db: Session = Depends(get_db)):  # Depends 注入数据库连接
    return db.query(Todo).all()
```

**前端类比**：
- 类似 Vue 的 `provide/inject`
- 或者类似 Pinia 的依赖注入

### 3. ORM（对象关系映射）

**Python（SQLAlchemy）**：
```python
db.query(Todo).filter(Todo.id == 1).first()  # 用对象方式查询数据库
```

**前端类比**：
- 类似 TypeORM 的 Repository
- 用对象方法代替手写 SQL

---

## 🚀 如何运行 Python 后端

### 1. 安装依赖

```bash
cd backend-python
pip install -r requirements.txt
```

**类比**：`npm install`

### 2. 启动服务

```bash
python main.py
# 或
uvicorn main:app --reload
```

**类比**：`npm run dev`

### 3. 访问 API

- API 地址：`http://localhost:8000`
- API 文档：`http://localhost:8000/docs`（FastAPI 自动生成）

---

## 💡 总结

### 核心理解

1. **`main.py`** = 应用入口，配置全局设置
2. **`routers/`** = API 路由，处理 HTTP 请求（类似 Controller）
3. **`models/`** = 数据模型，定义数据库表结构（类似 Entity）
4. **`schemas/`** = 数据验证，定义请求/响应格式（类似 DTO）
5. **`database/`** = 数据库配置，管理数据库连接

### 与前端的关系

- **前端发送请求** → `routers/todos.py` 接收
- **验证数据格式** → `schemas/todo.py` 验证
- **操作数据库** → `models/todo.py` 操作
- **返回数据** → 前端接收并显示

### 学习建议

作为前端开发者，您可以：
1. 重点关注 `routers/` 目录，了解 API 接口
2. 查看 `schemas/` 目录，了解数据格式
3. 对比前端的 API 调用，理解数据流向

希望这个说明能帮助您理解 Python 后端！🎉

