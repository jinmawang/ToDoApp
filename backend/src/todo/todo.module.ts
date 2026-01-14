/**
 * Todo 模块
 *
 * 【模块配置】
 * 注册 Todo 相关的控制器、服务、实体
 *
 * 【模块职责】
 * - 导入 TypeORM 实体（Todo、SubTask）
 * - 注册控制器（TodoController）
 * - 注册服务（TodoService）
 * - 导出服务（供其他模块使用）
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { Todo } from './entities/todo.entity';
import { SubTask } from './entities/subtask.entity';

/**
 * TodoModule - Todo 功能模块
 *
 * 【模块配置说明】
 * - imports: 导入 TypeORM 实体，使 Service 可以注入 Repository
 * - controllers: 注册控制器，处理 HTTP 请求
 * - providers: 注册服务，提供业务逻辑
 * - exports: 导出服务，其他模块可以使用 TodoService
 */
@Module({
  // 注册实体，使 TodoService 可以注入 TodoRepository 和 SubTaskRepository
  imports: [TypeOrmModule.forFeature([Todo, SubTask])],
  // 注册控制器
  controllers: [TodoController],
  // 注册服务
  providers: [TodoService],
  // 导出服务，供其他模块使用（如 AppModule）
  exports: [TodoService],
})
export class TodoModule {}
