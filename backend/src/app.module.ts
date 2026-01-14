/**
 * 应用根模块
 * 这是 NestJS 应用的根模块，负责：
 * 1. 配置数据库连接（TypeORM + MySQL）
 * 2. 导入和注册所有功能模块（认证、待办事项、分类等）
 * 3. 注册应用级别的控制器和服务
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { Todo } from './todo/entities/todo.entity';
import { SubTask } from './todo/entities/subtask.entity';
import { User } from './user/entities/user.entity';
import { Category } from './category/entities/category.entity';

/**
 * AppModule - 应用根模块
 * 使用 @Module 装饰器定义模块的元数据：
 * - imports: 导入其他模块和数据库配置
 * - controllers: 注册控制器
 * - providers: 注册服务提供者
 */
@Module({
  imports: [
    // TypeORM 数据库配置
    // 连接 MySQL 数据库，配置实体类，启用自动同步（生产环境建议关闭）
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'todo_db',
      entities: [Todo, SubTask, User, Category], // 注册所有实体类
      synchronize: true, // 自动同步数据库结构（仅开发环境使用）
    }),
    // 导入功能模块
    AuthModule,      // 认证模块：处理用户登录、注册、JWT 等
    TodoModule,      // 待办事项模块：处理待办事项的 CRUD 操作
    CategoryModule,  // 分类模块：处理分类的 CRUD 操作
  ],
  controllers: [AppController], // 注册应用根控制器
  providers: [AppService],      // 注册应用服务
})
export class AppModule {}
