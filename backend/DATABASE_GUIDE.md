# 数据库接入改造示例

## 当前问题

当前 `todo.service.ts` 使用内存数组存储数据，服务重启后数据丢失。

## 解决方案：接入 MySQL 数据库

### 1. 安装依赖

```bash
npm install @nestjs/typeorm typeorm mysql2
```

### 2. 修改 Entity（实体）

将 `todo.entity.ts` 改为数据库表模型：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('todos') // 对应数据库表名
export class Todo {
  @PrimaryGeneratedColumn() // 自增主键
  id: number;

  @Column() // 普通列
  title: string;

  @Column({ default: false }) // 带默认值
  isCompleted: boolean;
}
```

### 3. 修改 Service（服务层）

将数组操作改为数据库查询：

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>, // TypeORM 仓库
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(createTodoDto);
    return await this.todoRepository.save(todo); // 保存到数据库
  }

  async findAll(): Promise<Todo[]> {
    return await this.todoRepository.find(); // 从数据库查询所有
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.todoRepository.update(id, updateTodoDto); // 更新数据库
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.todoRepository.delete(id); // 从数据库删除
    if (result.affected === 0) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
  }
}
```

### 4. 配置数据库连接

在 `app.module.ts` 中配置：

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './todo/entities/todo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'your_password',
      database: 'todo_db',
      entities: [Todo],
      synchronize: true, // 开发环境自动同步表结构
    }),
    TodoModule,
  ],
})
export class AppModule {}
```

### 5. 在 TodoModule 中注册 Repository

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])], // 注册 Todo 实体
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
```

## 改造后的优势

✅ **数据持久化**：服务重启后数据仍在  
✅ **支持并发**：多个用户同时操作不会冲突  
✅ **查询能力**：可以使用 SQL 做复杂查询  
✅ **数据安全**：可以定期备份数据库

## 对比总结

| 特性       | 内存数组（当前） | 数据库（改造后） |
| ---------- | ---------------- | ---------------- |
| 存储位置   | RAM（运行内存）  | 磁盘（硬盘）     |
| 数据持久性 | ❌ 重启丢失      | ✅ 永久保存      |
| 并发安全   | ⚠️ 有限          | ✅ 完善          |
| 查询能力   | ⚠️ 简单          | ✅ 强大（SQL）   |
| 适用场景   | 开发/测试        | 生产环境         |
