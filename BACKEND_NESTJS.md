# Todo Backend - NestJS (TypeScript) 版本说明

## 📖 技术栈介绍

### NestJS 框架
- **语言**: TypeScript
- **框架**: NestJS (Node.js 企业级框架)
- **ORM**: TypeORM
- **数据库**: MySQL
- **验证**: class-validator
- **端口**: 3000

### NestJS 优势
- ���️ **模块化架构**: 基于模块的依赖注入系统
- 📦 **TypeScript 原生支持**: 完整的类型安全
- 🔧 **装饰器驱动**: 使用装饰器简化开发
- 🎯 **可扩展性**: 易于维护和扩展的大型应用
- 🔄 **完整的 MVC**: Model-View-Controller 架构

## 🗂️ 项目结构

```
backend/
├── src/
│   ├── category/           # 分类模块
│   │   ├── dto/           # 数据传输对象
│   │   ├── entities/      # 实体模型
│   │   ├── category.controller.ts
│   │   ├── category.module.ts
│   │   └── category.service.ts
│   ├── todo/              # 任务模块
│   │   ├── dto/           # 数据传输对象
│   │   ├── entities/      # 实体模型
│   │   ├── todo.controller.ts
│   │   ├── todo.module.ts
│   │   ├── todo.service.ts
│   │   └── subtask.entity.ts
│   ├── user/              # 用户模块
│   │   ├── entities/      # 用户实体
│   │   └── user.module.ts
│   ├── app.module.ts      # 应用主模块
│   └── main.ts            # 应用入口
├── .env                   # 环境变量
├── package.json           # 依赖配置
└── tsconfig.json          # TypeScript 配置
```

## 🔌 API 端点说明

### 基础端点
- `GET /` - 欢迎信息
- `GET /health` - 健康检查

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
- ✅ 创建任务（标题、描述、优先级、截止日期、分类）
- ✅ 查询任务（支持搜索、多条件过滤）
- ✅ 更新任务（部分更新）
- ✅ 删除任务（单个和批量）

### 2. 子任务管理
- ✅ 为任务添加多个子任务
- ✅ 子任务完成状态切换
- ✅ 自动计算任务进度
- ✅ 级联删除（删除任务时同时删除子任务）

### 3. 分类系统
- ✅ 创建、编辑、删除分类
- ✅ 分类包含名称、颜色、图标
- ✅ 任务关联分类（多对一关系）

### 4. 统计功能
- ✅ 总任务数、已完成、待处理
- ✅ 完成率百分比
- ✅ 按优先级统计
- ✅ 逾期任务统计

### 5. 搜索与过滤
- ✅ 按标题和描述搜索
- ✅ 按优先级过滤
- ✅ 按分类过滤
- ✅ 按完成状态过滤
- ✅ 按截止日期过滤

## 🚀 启动命令

### 开发模式
```bash
cd backend
npm run start:dev
```

### 生产模式
```bash
cd backend
npm run build
npm run start:prod
```

## 📊 数据库表结构

### users 表
```sql
- id (主键)
- username (唯一)
- password
- email (唯一)
- avatar
- createdAt
```

### todos 表
```sql
- id (主键)
- title
- description (TEXT)
- isCompleted
- priority (枚举: LOW, MEDIUM, HIGH)
- dueDate
- hasReminder
- userId (外键 → users)
- categoryId (外键 → categories)
- parentId (自关联外键)
- progress
- createdAt
- updatedAt
```

### categories 表
```sql
- id (主键)
- name
- color
- icon
- userId (外键 → users)
- createdAt
```

### subtasks 表
```sql
- id (主键)
- title
- isCompleted
- todoId (外键 → todos)
- createdAt
```

## 🔍 代码示例

### 创建任务并添加子任务
```typescript
const todoData = {
  title: "完成项目报告",
  description: "需要在周五之前完成Q4季度报告",
  priority: Priority.HIGH,
  dueDate: "2026-01-10",
  categoryId: 1,
  subtasks: [
    { title: "收集数据" },
    { title: "制作图表" },
    { title: "撰写总结" }
  ]
};

await todoService.create(todoData);
```

### 搜索和过滤任务
```typescript
// 搜索包含"报告"的高优先级任务
const todos = await todoService.findAll({
  search: "报告",
  priority: "high"
});
```

## 🛠️ 依赖说明

```json
{
  "@nestjs/common": "核心功能",
  "@nestjs/core": "框架核心",
  "@nestjs/platform-express": "Express 适配器",
  "@nestjs/typeorm": "TypeORM 集成",
  "@nestjs/config": "配置管理",
  "typeorm": "ORM 框架",
  "mysql": "MySQL 驱动",
  "class-validator": "数据验证",
  "class-transformer": "对象转换",
  "reflect-metadata": "装饰器元数据"
}
```

## 📝 注意事项

1. **用户ID**: 当前使用硬编码的 `userId = 1`，后续需要集成认证系统
2. **级联删除**: 删除用户时会级联删除其所有任务和分类
3. **数据库同步**: 开发模式使用 `synchronize: true` 自动同步表结构
4. **端口占用**: 确保 3000 端口未被其他服务占用

## 🔗 相关文档

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [MySQL 文档](https://dev.mysql.com/doc/)

---

**版本**: 1.0.0
**最后更新**: 2026-01-09
