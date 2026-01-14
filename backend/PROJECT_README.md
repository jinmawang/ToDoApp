# NestJS 后端工程说明文档

## 1. 项目概览

这是一个基于 **NestJS** 框架构建的轻量级 RESTful API 服务，主要用于提供 Todo List（待办事项）的增删改查（CRUD）功能。
项目遵循 NestJS 官方推荐的模块化架构，具有高内聚、低耦合的特点，易于扩展和维护。

*   **技术栈**：Node.js, NestJS, TypeScript
*   **当前版本**：1.0.0
*   **服务端口**：默认 `3000`

---

## 2. 目录结构详解

项目结构清晰地分离了配置、业务逻辑和测试代码：

```
backend/
├── src/
│   ├── app.controller.ts    # 根控制器 (保留了基本的健康检查)
│   ├── app.module.ts        # [核心] 根模块，聚合所有子模块
│   ├── app.service.ts       # 根服务
│   ├── main.ts              # [入口] 应用程序启动文件
│   └── todo/                # [业务模块] Todo 功能模块
│       ├── dto/             # 数据传输对象 (Data Transfer Object)
│       │   ├── create-todo.dto.ts  # 创建 Todo 的参数校验
│       │   └── update-todo.dto.ts  # 更新 Todo 的参数校验
│       ├── entities/        # 实体定义 (类型/数据库模型)
│       │   └── todo.entity.ts
│       ├── todo.controller.ts  # 路由控制器 (处理 HTTP 请求)
│       ├── todo.module.ts      # Todo 模块定义
│       └── todo.service.ts     # 业务逻辑服务 (处理数据)
├── test/                    # 端到端 (E2E) 测试
├── nest-cli.json            # Nest CLI 配置文件
├── tsconfig.json            # TypeScript 配置文件
└── package.json             # 项目依赖与脚本
```

---

## 3. 核心模块说明 (TodoModule)

这是项目中主要的业务模块，实现了完整的 CRUD 流程。

### 3.1 实体 (Entity)
文件：`src/todo/entities/todo.entity.ts`
定义了 Todo 的数据模型。目前是内存对象，如果接入数据库（如 TypeORM），这里会变成数据库表模型。
```typescript
export class Todo {
  id: number;
  title: string;
  isCompleted: boolean;
}
```

### 3.2 DTO (数据传输对象)
文件：`src/todo/dto/`
DTO 用于定义**前端传给后端的数据结构**。
*   `CreateTodoDto`: 仅要求 `title`，因为 `id` 和 `isCompleted` 由后端生成。
*   `UpdateTodoDto`: 使用了 `@nestjs/mapped-types` 的 `PartialType`，意味着创建时的字段在更新时都是可选的。

### 3.3 控制器 (Controller)
文件：`src/todo/todo.controller.ts`
负责接收 HTTP 请求，并调用 Service 处理。
*   **路径前缀**：`/todos`
*   **接口清单**：
    *   `POST /todos`: 创建 Todo
    *   `GET /todos`: 获取所有 Todo
    *   `GET /todos/:id`: 获取单个 Todo
    *   `PATCH /todos/:id`: 更新 Todo (部分更新)
    *   `DELETE /todos/:id`: 删除 Todo

### 3.4 服务 (Service)
文件：`src/todo/todo.service.ts`
包含所有业务逻辑。
*   **数据存储**：目前使用一个私有的内存数组 `private todos: Todo[]` 模拟数据库。**注意：每次重启服务，数据会被重置。**
*   **逻辑实现**：实现了 `create`, `findAll`, `findOne`, `update`, `remove` 等标准方法。包含基本的错误处理（如 `NotFoundException`）。

---

## 4. 关键配置与入口

### 4.1 `main.ts` (入口文件)
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // [重要] 开启跨域允许，否则前端无法调用
  await app.listen(process.env.PORT ?? 3000);
}
```
*   **CORS**：已配置 `app.enableCors()`，允许前端（如 Vue 项目）跨域访问 API。

### 4.2 `app.module.ts` (根模块)
```typescript
@Module({
  imports: [TodoModule], // 导入 Todo 业务模块
  // ...
})
export class AppModule {}
```
这里是 NestJS 的依赖注入容器根节点，所有子模块必须在这里注册才能生效。

---

## 5. 如何扩展与改进

当前项目是一个基础 MVP（最小可行性产品），后续可以从以下几个方向进行生产级改造：

1.  **持久化存储**：
    *   目前数据在内存中。可以引入 `TypeORM` 或 `Prisma`，连接 MySQL/PostgreSQL/MongoDB 数据库，将 `TodoService` 中的数组操作替换为数据库查询。
2.  **数据验证**：
    *   引入 `class-validator` 和 `class-transformer`。
    *   在 DTO 中添加装饰器（如 `@IsString()`, `@IsNotEmpty()`），在 `main.ts` 中开启全局验证管道 `app.useGlobalPipes(new ValidationPipe())`，防止非法数据录入。
3.  **统一响应格式**：
    *   目前直接返回数据。可以封装一个 `Interceptor`，将所有返回值统一包装为 `{ code: 200, data: ..., message: 'success' }` 格式。
4.  **接口文档**：
    *   引入 `@nestjs/swagger`，自动生成 Swagger UI 文档，方便前后端联调。

## 6. 常用命令

*   **启动开发环境**：
    ```bash
    npm run start:dev
    ```
    (支持热重载)

*   **构建生产代码**：
    ```bash
    npm run build
    ```

*   **快速生成新模块** (例如 User 模块)：
    ```bash
    nest g resource user
    ```
    (会自动创建 controller, service, module, dto, entity 等全套文件)

