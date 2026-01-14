# TypeORM 详解

## 什么是 TypeORM？

**TypeORM** 是一个 **ORM（Object-Relational Mapping，对象关系映射）** 框架，用于在 TypeScript/JavaScript 中操作数据库。

### 简单理解

- **不用 TypeORM**：需要手写 SQL 语句
- **使用 TypeORM**：用 TypeScript 对象和方法操作数据库

---

## 为什么需要 TypeORM？

### 问题：直接写 SQL 的痛点

假设我们要查询一个 Todo，**不用 TypeORM** 需要这样写：

```typescript
// 需要手动拼接 SQL，容易出错
const query = `SELECT * FROM todos WHERE id = ${id}`;
const result = await mysql.query(query);
```

**问题**：

- ❌ SQL 字符串容易写错（拼写、语法）
- ❌ 没有类型检查，容易传错参数
- ❌ SQL 注入风险（如果拼接不当）
- ❌ 不同数据库 SQL 语法不同，切换数据库需要改代码

### 解决方案：TypeORM 的优势

**使用 TypeORM** 后：

```typescript
// 类型安全，IDE 自动补全
const todo = await todoRepository.findOne({ where: { id: 1 } });
```

**优势**：

- ✅ **类型安全**：TypeScript 编译时检查，减少错误
- ✅ **代码简洁**：用对象和方法，不用写 SQL
- ✅ **自动防注入**：参数化查询，自动防止 SQL 注入
- ✅ **数据库无关**：切换数据库（MySQL → PostgreSQL）几乎不用改代码
- ✅ **自动同步**：可以自动根据 Entity 创建数据库表

---

## TypeORM 的核心概念

### 1. Entity（实体）- 数据库表的映射

**Entity = 数据库表 = TypeScript 类**

```typescript
// todo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('todos') // 对应数据库中的 `todos` 表
export class Todo {
  @PrimaryGeneratedColumn() // 主键，自增
  id: number;

  @Column() // 普通列
  title: string;

  @Column({ default: false })
  isCompleted: boolean;
}
```

**作用**：

- 定义数据库表结构
- TypeScript 类型定义
- 自动生成 SQL 建表语句

### 2. Repository（仓库）- 数据库操作的封装

**Repository = 数据库操作的封装 = 增删改查的工具**

```typescript
// TypeORM 自动提供的方法
todoRepository.save(todo)        // 保存（新增或更新）
todoRepository.find()            // 查询所有
todoRepository.findOne({...})    // 查询一个
todoRepository.delete(id)        // 删除
todoRepository.update(id, {...}) // 更新
```

**作用**：

- 封装了所有数据库操作
- 不需要手写 SQL
- 提供类型安全的 API

### 3. 装饰器（Decorators）- 元数据标记

TypeORM 使用装饰器来标记类的属性：

```typescript
@Entity()           // 标记这是一个数据库表
@PrimaryGeneratedColumn()  // 标记这是主键
@Column()           // 标记这是普通列
@ManyToOne()        // 标记这是多对一关系
@OneToMany()        // 标记这是一对多关系
```

---

## 实际对比：不用 TypeORM vs 使用 TypeORM

### 场景：查询所有未完成的 Todo

#### ❌ 不用 TypeORM（原生 SQL）

```typescript
import mysql from 'mysql2/promise';

async function findIncompleteTodos() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'todo_db',
  });

  // 手写 SQL，容易出错
  const [rows] = await connection.execute(
    'SELECT * FROM todos WHERE isCompleted = ?',
    [false],
  );

  await connection.end();
  return rows;
}
```

**问题**：

- 需要手动管理数据库连接
- SQL 字符串没有类型检查
- 返回的数据没有类型定义

#### ✅ 使用 TypeORM

```typescript
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';

async function findIncompleteTodos(todoRepository: Repository<Todo>) {
  // 类型安全，IDE 自动补全
  return await todoRepository.find({
    where: { isCompleted: false },
  });
}
```

**优势**：

- 代码简洁，一行搞定
- 类型安全，`find()` 返回 `Todo[]`
- 不需要管理连接（TypeORM 自动管理）

---

## TypeORM 在 NestJS 中的集成

### 1. 安装

```bash
npm install @nestjs/typeorm typeorm mysql2
```

### 2. 配置连接

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'todo_db',
      entities: [Todo], // 注册实体
      synchronize: true, // 自动同步表结构（仅开发环境）
    }),
  ],
})
export class AppModule {}
```

### 3. 在模块中注册 Repository

```typescript
// todo.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])], // 注册 Todo 的 Repository
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
```

### 4. 在 Service 中注入使用

```typescript
// todo.service.ts
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>, // 注入 Repository
  ) {}

  async findAll() {
    return await this.todoRepository.find(); // 使用 Repository
  }
}
```

---

## TypeORM 常用操作示例

### 查询操作

```typescript
// 查询所有
const todos = await todoRepository.find();

// 查询一个（按条件）
const todo = await todoRepository.findOne({
  where: { id: 1 },
});

// 复杂查询
const incompleteTodos = await todoRepository.find({
  where: { isCompleted: false },
  order: { createdAt: 'DESC' },
  take: 10, // 限制返回 10 条
});
```

### 新增操作

```typescript
// 方式 1：直接 save
const newTodo = todoRepository.create({ title: 'New Todo' });
await todoRepository.save(newTodo);

// 方式 2：一步到位
const newTodo = await todoRepository.save({ title: 'New Todo' });
```

### 更新操作

```typescript
// 方式 1：先查后改
const todo = await todoRepository.findOne({ where: { id: 1 } });
todo.isCompleted = true;
await todoRepository.save(todo);

// 方式 2：直接更新（推荐）
await todoRepository.update(1, { isCompleted: true });
```

### 删除操作

```typescript
// 方式 1：按 ID 删除
await todoRepository.delete(1);

// 方式 2：删除实体
const todo = await todoRepository.findOne({ where: { id: 1 } });
await todoRepository.remove(todo);
```

---

## 总结

### TypeORM 是什么？

- **ORM 框架**：将数据库表映射为 TypeScript 类
- **SQL 替代品**：用对象和方法代替手写 SQL
- **类型安全工具**：提供完整的 TypeScript 类型支持

### 为什么用 TypeORM？

- ✅ **代码更简洁**：不用写 SQL
- ✅ **类型安全**：编译时检查错误
- ✅ **易于维护**：代码更清晰，易于理解
- ✅ **跨数据库**：切换数据库几乎不用改代码

### 什么时候不用 TypeORM？

- 需要写**非常复杂的 SQL**（如报表统计）
- 对**性能要求极高**的场景（手写 SQL 可能更优）
- 项目**非常小**，只有几个简单查询

但对于大多数业务场景，**TypeORM 是首选**，因为它能大幅提升开发效率和代码质量。
