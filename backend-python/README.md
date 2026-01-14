# FastAPI Todo Backend

这是用 Python + FastAPI 重写的 Todo 后端服务。

## 技术栈

- **FastAPI**: 现代化的 Python Web 框架
- **SQLAlchemy**: ORM (对象关系映射)
- **PyMySQL**: MySQL 数据库驱动
- **Pydantic**: 数据验证和序列化
- **Uvicorn**: ASGI 服务器

## 项目结构

```
backend-python/
├── app/
│   ├── models/         # SQLAlchemy 数据库模型
│   │   ├── user.py
│   │   ├── todo.py
│   │   ├── category.py
│   │   └── subtask.py
│   ├── schemas/        # Pydantic 数据验证模型
│   │   ├── todo.py
│   │   └── category.py
│   ├── routers/        # API 路由
│   │   ├── todos.py
│   │   └── categories.py
│   └── database/       # 数据库配置
│       └── config.py
├── main.py             # 应用入口
├── requirements.txt    # Python 依赖
└── .env               # 环境变量

```

## 安装依赖

```bash
cd backend-python
pip install -r requirements.txt
```

## 配置数据库

编辑 `.env` 文件：

```env
DATABASE_URL=mysql+pymysql://用户名:密码@localhost:3306/todo_db
```

## 运行服务

```bash
# 开发模式（支持热重载）
uvicorn main:app --reload --host 0.0.0.0 --port 3001

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 3001
```

服务将在 `http://localhost:3001` 启动

## API 文档

启动服务后，访问以下地址查看交互式 API 文档：

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

## 主要 API 端点

### Todos (任务)

- `POST /todos` - 创建任务
- `GET /todos` - 获取任务列表（支持搜索和过滤）
- `GET /todos/statistics` - 获取统计数据
- `GET /todos/{id}` - 获取单个任务
- `PATCH /todos/{id}` - 更新任务
- `PATCH /todos/{id}/toggle` - 切换完成状态
- `DELETE /todos/{id}` - 删除任务
- `DELETE /todos/batch` - 批量删除任务
- `PATCH /todos/batch/update` - 批量更新任务

### SubTasks (子任务)

- `POST /todos/{todo_id}/subtasks` - 创建子任务
- `PATCH /todos/subtasks/{id}/toggle` - 切换子任务完成状态
- `DELETE /todos/subtasks/{id}` - 删除子任务

### Categories (分类)

- `POST /categories` - 创建分类
- `GET /categories` - 获取分类列表
- `GET /categories/{id}` - 获取单个分类
- `PATCH /categories/{id}` - 更新分类
- `DELETE /categories/{id}` - 删除分类

## 与 NestJS 版本的对比

| 特性 | NestJS (backend) | FastAPI (backend-python) |
|------|------------------|--------------------------|
| 端口 | 3000 | 3001 |
| 语言 | TypeScript | Python |
| ORM | TypeORM | SQLAlchemy |
| 验证 | class-validator | Pydantic |
| 文档 | 需要手动配置 | 自动生成 |
| 数据库 | 共享同一个 MySQL 数据库 | 共享同一个 MySQL 数据库 |

两个后端使用相同的数据库，可以同时运行！
