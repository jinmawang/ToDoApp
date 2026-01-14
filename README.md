# Todo 待办事项管理系统

一个功能完善的全栈待办事项管理应用，采用前后端分离架构，支持三种后端技术栈实现。

## 项目简介

这是一个综合性的待办事项管理系统，支持多层级任务、进度追踪、分类管理等功能。项目提供了三种后端技术栈实现（NestJS、FastAPI、Spring Boot），方便学习和比较不同框架的实现方式。

## 技术栈

### 后端实现

#### NestJS (backend/)
- **框架**: NestJS 11.0.1
- **数据库**: MySQL 8.x + TypeORM 0.3.28
- **认证**: JWT + Passport.js
- **密码加密**: bcrypt
- **验证**: class-validator + class-transformer
- **测试**: Jest + Supertest

#### FastAPI (backend-python/)
- **框架**: FastAPI
- **数据库**: MySQL 8.x + SQLAlchemy
- **认证**: JWT (python-jose)
- **密码加密**: bcrypt (passlib)
- **验证**: Pydantic
- **API 文档**: 自动生成 Swagger UI

#### Spring Boot (backend-java/)
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.x + Spring Data JPA
- **认证**: Spring Security + JWT (JJWT)
- **密码加密**: BCrypt
- **验证**: Jakarta Validation
- **API 文档**: SpringDoc OpenAPI

### 前端
- **框架**: Vue 3.5.25
- **构建工具**: Vite 7.2.4
- **状态管理**: Pinia 3.0.4
- **路由**: Vue Router 4.6.3
- **HTTP 客户端**: Axios 1.13.2
- **图表**: Chart.js 4.5.1 + vue-chartjs 5.3.3
- **日期处理**: date-fns 4.1.0

## 核心功能

### 用户认证系统 ✅
- 用户注册和登录
- JWT Token 认证
- 密码加密存储
- 用户信息管理
- Todo 和 Category 的用户所有权隔离

### Todo 管理
- 完整的 CRUD 操作
- 优先级设置（低、中、高）
- 进度追踪（0-100%）
- 截止日期和提醒功能
- 父子任务层级关系
- 子任务支持
- 搜索和筛选（按优先级、分类、完成状态、截止日期）

### 分类管理
- 彩色分类标签
- 图标支持
- Todo 分类组织

## 项目结构

```
.
├── backend/              # NestJS 后端
│   ├── src/
│   │   ├── main.ts       # 应用入口
│   │   ├── app.module.ts # 根模块
│   │   ├── auth/         # 认证模块
│   │   ├── user/         # 用户模块
│   │   ├── todo/         # 待办事项模块
│   │   └── category/     # 分类模块
│   └── package.json
├── backend-python/       # FastAPI 后端
│   ├── app/
│   │   ├── main.py       # 应用入口
│   │   ├── core/         # 安全和依赖
│   │   ├── models/       # SQLAlchemy 模型
│   │   ├── schemas/      # Pydantic schemas
│   │   └── routers/      # API 路由
│   └── requirements.txt  # Python 依赖
├── backend-java/         # Spring Boot 后端
│   ├── src/main/java/com/todo/app/
│   │   ├── TodoBackendApplication.java
│   │   ├── security/     # JWT 和安全配置
│   │   ├── entity/       # JPA 实体
│   │   ├── dto/          # 数据传输对象
│   │   ├── service/      # 业务逻辑
│   │   └── controller/   # REST 控制器
│   └── pom.xml           # Maven 配置
├── frontend/             # Vue 3 前端
│   ├── src/
│   │   ├── main.ts       # 应用入口
│   │   ├── App.vue       # 根组件
│   │   ├── views/        # 页面组件
│   │   ├── components/   # 可复用组件
│   │   ├── stores/       # Pinia 状态管理
│   │   └── router/       # 路由配置
│   └── package.json
└── README.md
```

## 快速开始

### 环境要求
- Node.js: ^20.19.0 || >=22.12.0
- Python: 3.9+ (FastAPI)
- Java: 17+ (Spring Boot)
- MySQL: 8.x
- npm 或 yarn

### 数据库配置

1. 创建 MySQL 数据库：
```sql
CREATE DATABASE todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置数据库连接（根据选择的后端修改相应配置文件）：

**NestJS** ([backend/src/app.module.ts](backend/src/app.module.ts)):
```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '', // 修改为你的密码
  database: 'todo_db',
  entities: [Todo, SubTask, User, Category],
  synchronize: true,
})
```

**FastAPI** (backend-python/app/database/config.py):
```python
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/todo_db"
```

**Spring Boot** (backend-java/src/main/resources/application.yml):
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/todo_db
    username: root
    password: your_password
```

### NestJS 后端启动

```bash
cd backend

# 安装依赖
npm install

# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod

# 运行测试
npm run test
npm run test:e2e
npm run test:cov
```

后端服务默认运行在 `http://localhost:3000`

### FastAPI 后端启动

```bash
cd backend-python

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端服务默认运行在 `http://localhost:8000`

API 文档自动生成在 `http://localhost:8000/docs`

### Spring Boot 后端启动

```bash
cd backend-java

# 安装依赖
mvn clean install

# 运行应用
mvn spring-boot:run
```

后端服务默认运行在 `http://localhost:8080`

API 文档可访问 `http://localhost:8080/swagger-ui.html`

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

前端服务默认运行在 `http://localhost:5173`

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取当前用户信息（需要认证）
- `PATCH /api/auth/profile` - 更新用户信息（需要认证）

### Todo 接口（需要认证）
- `GET /api/todos` - 获取所有待办事项
- `GET /api/todos/:id` - 获取单个待办事项
- `POST /api/todos` - 创建待办事项
- `PATCH /api/todos/:id` - 更新待办事项
- `DELETE /api/todos/:id` - 删除待办事项
- `GET /api/todos/statistics` - 获取统计数据
- `PATCH /api/todos/:id/toggle` - 切换完成状态
- `DELETE /api/todos/batch` - 批量删除
- `PATCH /api/todos/batch/update` - 批量更新
- `POST /api/todos/:todoId/subtasks` - 创建子任务
- `PATCH /api/todos/subtasks/:id/toggle` - 切换子任务状态
- `DELETE /api/todos/subtasks/:id` - 删除子任务

### Category 接口（需要认证）
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取单个分类
- `POST /api/categories` - 创建分类
- `PATCH /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

## 认证机制

所有后端实现都采用 JWT Bearer Token 认证：

1. **注册/登录**: 使用 `/api/auth/register` 和 `/api/auth/login` 获取 JWT Token
2. **使用 Token**: 在请求头中添加 `Authorization: Bearer <token>`
3. **Token 有效期**: 默认 7 天（可在配置中修改）

### 请求示例

```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 使用 token 访问受保护的接口
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer <your-token-here>"
```

## 数据模型

### User（用户）
```typescript
{
  id: number
  username: string
  email: string
  password: string (hashed with bcrypt)
  avatar: string
  createdAt: Date
}
```

### Todo（待办事项）
```typescript
{
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  progress: number (0-100)
  dueDate: Date
  hasReminder: boolean
  userId: number
  categoryId: number
  parentId: number
  category: Category
  subtasks: SubTask[]
  createdAt: Date
  updatedAt: Date
}
```

### Category（分类）
```typescript
{
  id: number
  name: string
  color: string
  icon: string
  userId: number
  todos: Todo[]
  createdAt: Date
}
```

### SubTask（子任务）
```typescript
{
  id: number
  title: string
  isCompleted: boolean
  todoId: number
  createdAt: Date
}
```

## 开发命令

### NestJS 后端
```bash
npm run start        # 启动应用
npm run start:dev    # 监听模式启动
npm run start:debug  # 调试模式启动
npm run build        # 构建应用
npm run lint         # 代码检查
npm run format       # 代码格式化
```

### FastAPI 后端
```bash
uvicorn main:app --reload              # 启动开发服务器
uvicorn main:app --host 0.0.0.0 --port 8000  # 生产服务器
pytest                                 # 运行测试
```

### Spring Boot 后端
```bash
mvn spring-boot:run    # 启动应用
mvn clean package      # 构建应用
mvn test               # 运行测试
```

### 前端
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run type-check   # 类型检查
npm run lint         # 代码检查和修复
npm run format       # 代码格式化
```

## 项目特色

- ✅ **三种后端实现**: NestJS、FastAPI、Spring Boot 完整实现
- ✅ **完整的用户认证**: JWT 认证、密码加密、用户所有权隔离
- ✅ **模块化架构**: 易于扩展和维护
- ✅ **完整的类型支持**: TypeScript/Python/Java 强类型
- ✅ **RESTful API 设计**: 符合 REST 规范
- ✅ **数据库关系映射**: TypeORM/SQLAlchemy/JPA
- ✅ **响应式前端**: Vue 3 组合式 API
- ✅ **完善的测试**: 单元测试和集成测试

## 框架对比

| 特性 | NestJS | FastAPI | Spring Boot |
|------|--------|---------|-------------|
| 语言 | TypeScript | Python | Java |
| 依赖注入 | ✅ 内置 | ✅ 可选 | ✅ 内置 |
| 类型安全 | ✅ 强类型 | ✅ Pydantic | ✅ 强类型 |
| 自动 API 文档 | ❌ 需插件 | ✅ Swagger UI | ✅ SpringDoc |
| 学习曲线 | 中等 | 较低 | 较高 |
| 性能 | 高 | 高 | 中等 |
| 生态系统 | 丰富 | 丰富 | 非常丰富 |

## 学习资源

这个项目非常适合学习：
- 全栈开发流程
- 三种主流后端框架对比
- JWT 认证实现
- ORM 数据库操作
- RESTful API 设计
- 前后端分离架构
- 用户权限和数据隔离

## License

UNLICENSED
