# TypeORM vs Prisma 详细对比

## 一、核心概念

### TypeORM

- **类型**：传统 ORM（Object-Relational Mapping）
- **工作方式**：在运行时通过装饰器和反射（Reflection）将 TypeScript 类映射到数据库表
- **数据库同步**：可以在运行时自动同步数据库结构（`synchronize: true`）

### Prisma

- **类型**：现代 ORM + 查询构建器
- **工作方式**：使用**代码生成**（Code Generation）和**Schema 文件**定义数据库结构
- **数据库同步**：通过 **Prisma Migrate** 管理数据库迁移，更安全可控

---

## 二、核心差异对比

### 1. 定义数据模型的方式

#### TypeORM：使用装饰器（Decorators）

```typescript
// todo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  isCompleted: boolean;
}
```

**特点**：

- ✅ 直接在 TypeScript 类中定义
- ✅ 使用装饰器标记（`@Entity`, `@Column`）
- ⚠️ 需要开启 TypeScript 的装饰器支持

#### Prisma：使用 Schema 文件

```prisma
// schema.prisma
model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**特点**：

- ✅ 独立的 Schema 文件（`.prisma`），更清晰
- ✅ 语法简洁，类似 GraphQL
- ✅ 通过 `prisma generate` 自动生成 TypeScript 类型

---

### 2. 查询方式

#### TypeORM：Repository 模式 + QueryBuilder

```typescript
// 方式 1：Repository（简单查询）
const todos = await todoRepository.find({
  where: { isCompleted: false },
  order: { createdAt: 'DESC' },
});

// 方式 2：QueryBuilder（复杂查询）
const todos = await todoRepository
  .createQueryBuilder('todo')
  .where('todo.isCompleted = :completed', { completed: false })
  .orderBy('todo.createdAt', 'DESC')
  .getMany();
```

**特点**：

- ✅ 两种方式可选（Repository 简单，QueryBuilder 灵活）
- ⚠️ 复杂查询需要学习 QueryBuilder 语法

#### Prisma：统一的 Client API

```typescript
// Prisma Client（统一 API）
const todos = await prisma.todo.findMany({
  where: { isCompleted: false },
  orderBy: { createdAt: 'desc' },
});

// 复杂查询也很简洁
const todos = await prisma.todo.findMany({
  where: {
    OR: [{ title: { contains: 'Learn' } }, { isCompleted: false }],
  },
  include: { user: true }, // 关联查询
});
```

**特点**：

- ✅ API 统一，学习成本低
- ✅ 类型提示非常完善（IDE 自动补全）
- ✅ 查询语法更直观

---

### 3. 类型安全

#### TypeORM

```typescript
// 类型安全，但需要手动定义 Entity
const todo = await todoRepository.findOne({ where: { id: 1 } });
// todo 的类型是 Todo | null（需要手动定义）
```

**特点**：

- ✅ 有类型支持
- ⚠️ 需要手动维护 Entity 类型
- ⚠️ 复杂查询的类型推断不够完善

#### Prisma

```typescript
// 类型完全自动生成，非常精确
const todo = await prisma.todo.findUnique({ where: { id: 1 } });
// todo 的类型自动推断为 Todo | null

// 关联查询的类型也会自动推断
const todoWithUser = await prisma.todo.findUnique({
  where: { id: 1 },
  include: { user: true },
});
// todoWithUser.user 的类型自动推断，IDE 完美提示
```

**特点**：

- ✅ **类型安全最强**：所有类型从 Schema 自动生成
- ✅ IDE 自动补全非常完善
- ✅ 编译时就能发现字段拼写错误

---

### 4. 数据库迁移（Migration）

#### TypeORM

```typescript
// 方式 1：自动同步（仅开发环境）
synchronize: true  // 自动根据 Entity 创建/更新表

// 方式 2：手动迁移（生产环境）
// 需要安装 typeorm CLI，手动生成迁移文件
npm install -g typeorm
typeorm migration:generate -n AddUserTable
```

**特点**：

- ⚠️ `synchronize: true` 在生产环境有风险（可能丢失数据）
- ✅ 支持手动迁移，但需要额外配置

#### Prisma

```bash
# Prisma Migrate（推荐方式）
prisma migrate dev --name add_user_table
# 自动生成迁移文件，并应用到数据库

# 生产环境
prisma migrate deploy
```

**特点**：

- ✅ **迁移管理更规范**：每次变更都生成迁移文件
- ✅ 迁移历史可追踪（`_prisma_migrations` 表）
- ✅ 支持回滚和版本管理

---

### 5. 性能对比

#### TypeORM

- ⚠️ **反射开销**：运行时使用装饰器和反射，性能略慢
- ✅ 支持原生 SQL：复杂查询可以直接写 SQL
- ✅ QueryBuilder 可以优化查询

#### Prisma

- ✅ **查询引擎优化**：底层使用 Rust 编写，性能优秀
- ✅ **连接池管理**：自动管理数据库连接池
- ⚠️ 复杂查询可能不如手写 SQL 灵活

**实际测试**（简单查询）：

- Prisma 通常比 TypeORM 快 10-20%
- 但对于大多数业务场景，差异不明显

---

### 6. 学习曲线

#### TypeORM

- ⚠️ **学习成本较高**：
  - 需要理解装饰器、反射
  - Repository 和 QueryBuilder 两种模式
  - 关系映射（`@ManyToOne`, `@OneToMany`）需要理解
- ✅ 文档丰富，社区大

#### Prisma

- ✅ **学习成本较低**：
  - Schema 语法直观（类似 GraphQL）
  - API 统一，不需要学习多种模式
  - 类型自动生成，减少错误
- ✅ 官方文档优秀，上手快

---

### 7. 生态系统

#### TypeORM

- ✅ **成熟稳定**：2016 年发布，使用广泛
- ✅ **功能全面**：支持几乎所有数据库特性
- ✅ **社区大**：GitHub 30k+ stars，问题容易找到答案
- ✅ **NestJS 集成**：NestJS 官方推荐，集成简单

#### Prisma

- ✅ **现代工具链**：2019 年发布，设计更现代
- ✅ **工具完善**：Prisma Studio（可视化数据库管理）、Prisma Migrate
- ✅ **增长快速**：GitHub 35k+ stars，社区活跃
- ⚠️ **NestJS 集成**：需要手动集成（但也不复杂）

---

## 三、实际代码对比

### 场景：查询未完成的 Todo，并关联用户信息

#### TypeORM 实现

```typescript
// 1. 定义 Entity
@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.todos)
  user: User;
}

// 2. 查询
const todos = await todoRepository.find({
  where: { isCompleted: false },
  relations: ['user'], // 关联查询
});
```

#### Prisma 实现

```prisma
// 1. 定义 Schema
model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  isCompleted Boolean  @default(false)
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
}

model User {
  id    Int     @id @default(autoincrement())
  todos Todo[]
}
```

```typescript
// 2. 查询（类型完全自动推断）
const todos = await prisma.todo.findMany({
  where: { isCompleted: false },
  include: { user: true }, // 关联查询
});
// todos[0].user 的类型自动推断，IDE 完美提示
```

**对比**：

- Prisma 的 Schema 更清晰，类型推断更完善
- TypeORM 需要手动定义关系，类型需要手动维护

---

## 四、选择建议

### 选择 TypeORM，如果你：

1. ✅ **使用 NestJS**：NestJS 官方推荐，集成最简单
2. ✅ **需要复杂 SQL**：QueryBuilder 和原生 SQL 支持更好
3. ✅ **团队熟悉传统 ORM**：有 Hibernate、Entity Framework 经验
4. ✅ **需要更多控制**：想完全控制 SQL 生成和执行

### 选择 Prisma，如果你：

1. ✅ **追求类型安全**：需要最强的 TypeScript 类型支持
2. ✅ **快速开发**：Schema 定义简单，API 统一，上手快
3. ✅ **团队新手多**：学习曲线平缓，减少错误
4. ✅ **需要可视化工具**：Prisma Studio 可以可视化管理数据
5. ✅ **现代项目**：新项目，没有历史包袱

---

## 五、在 NestJS 中的集成

### TypeORM（官方推荐）

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      // ... 配置
    }),
  ],
})
export class AppModule {}
```

**特点**：NestJS 官方支持，集成最简单

### Prisma（需要手动集成）

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

```typescript
// todo.service.ts
@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.todo.findMany();
  }
}
```

**特点**：需要手动创建 Service，但也不复杂

---

## 六、总结对比表

| 特性            | TypeORM                   | Prisma                    |
| --------------- | ------------------------- | ------------------------- |
| **定义方式**    | 装饰器（Decorators）      | Schema 文件               |
| **类型安全**    | ✅ 良好                   | ✅✅ 极强（自动生成）     |
| **学习曲线**    | ⚠️ 较陡                   | ✅ 平缓                   |
| **查询方式**    | Repository + QueryBuilder | 统一 Client API           |
| **迁移管理**    | ⚠️ 需要手动配置           | ✅ 完善（Prisma Migrate） |
| **性能**        | ✅ 良好                   | ✅✅ 优秀（Rust 引擎）    |
| **NestJS 集成** | ✅✅ 官方支持             | ✅ 需要手动集成           |
| **复杂 SQL**    | ✅✅ 支持原生 SQL         | ⚠️ 有限                   |
| **可视化工具**  | ❌ 无                     | ✅ Prisma Studio          |
| **社区规模**    | ✅✅ 大（30k+ stars）     | ✅✅ 大（35k+ stars）     |
| **适用场景**    | 传统项目、复杂查询        | 现代项目、快速开发        |

---

## 七、实际项目建议

### 小型项目 / 快速原型

**推荐 Prisma**：Schema 定义快，类型安全，减少错误

### 中大型项目 / 企业级

**两者都可以**：

- 如果团队熟悉 NestJS → **TypeORM**
- 如果追求类型安全和开发效率 → **Prisma**

### 需要复杂 SQL / 报表统计

**推荐 TypeORM**：QueryBuilder 和原生 SQL 支持更好

### 新项目 / 团队新手多

**推荐 Prisma**：学习成本低，类型安全，减少 Bug

---

## 八、迁移成本

### 从 TypeORM 迁移到 Prisma

- ⚠️ **成本较高**：需要重写 Entity 为 Schema，重写查询代码
- ✅ 但 Prisma 提供了迁移工具，可以逐步迁移

### 从 Prisma 迁移到 TypeORM

- ⚠️ **成本较高**：需要将 Schema 转换为 Entity，重写查询代码

**建议**：选择前仔细评估，避免后期迁移成本

---

## 结论

- **TypeORM**：成熟稳定，NestJS 官方推荐，适合传统项目和复杂查询
- **Prisma**：现代设计，类型安全最强，适合新项目和快速开发

**两者都是优秀的 ORM**，选择主要看项目需求和团队偏好。对于大多数项目，**两者都能很好地满足需求**。
