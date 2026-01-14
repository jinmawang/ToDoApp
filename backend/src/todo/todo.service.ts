/**
 * Todo 服务
 *
 * 【服务层的作用】
 * 服务（Service）是业务逻辑的核心，负责：
 * 1. 业务逻辑处理：创建、查询、更新、删除 Todo
 * 2. 数据验证：验证数据所有权、业务规则
 * 3. 数据库操作：通过 Repository 访问数据库
 * 4. 异常处理：抛出适当的异常（NotFoundException、ForbiddenException）
 *
 * 【设计模式：服务层模式】
 * 分层架构中的服务层：
 * - Controller：处理 HTTP 请求（薄层）
 * - Service：处理业务逻辑（厚层）
 * - Repository：处理数据访问（薄层）
 *
 * 【后端开发思维：业务逻辑集中】
 * 所有业务逻辑都在 Service 层：
 * - 便于测试（可以单独测试业务逻辑）
 * - 便于复用（多个 Controller 可以调用同一个 Service）
 * - 便于维护（业务逻辑集中，修改方便）
 *
 * 【数据安全：多租户隔离】
 * 所有方法都接收 userId 参数：
 * - 确保用户只能操作自己的数据
 * - 在查询时添加 userId 条件
 * - 在更新/删除前验证数据所有权
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { SubTask } from './entities/subtask.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateSubTaskDto } from './dto/create-subtask.dto';
import { UpdateSubTaskDto } from './dto/update-subtask.dto';

/**
 * TodoService - Todo 业务服务
 *
 * 【依赖注入】
 * @InjectRepository(Todo) - 注入 Todo 仓库
 * @InjectRepository(SubTask) - 注入 SubTask 仓库
 * - Repository 是 TypeORM 的数据访问层
 * - 提供 CRUD 方法和查询构建器
 * - 自动处理数据库连接和事务
 */
@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @InjectRepository(SubTask)
    private subTaskRepository: Repository<SubTask>,
  ) {}

  /**
   * 创建 Todo
   *
   * 【功能说明】
   * 创建新的 Todo，支持同时创建子任务
   *
   * 【数据流】
   * 1. 解构 DTO，分离子任务和 Todo 数据
   * 2. 创建 Todo 实体（关联当前用户）
  3. 保存 Todo 到数据库
   * 4. 如果有子任务，循环创建子任务
   * 5. 重新查询 Todo（包含关联数据）
   * 6. 返回完整的 Todo 对象
   *
   * 【解构赋值】
   * const { subtasks, ...todoData } = createTodoDto;
   * - 提取 subtasks 字段
   * - 剩余字段放入 todoData
   * - 用于分别处理 Todo 和子任务
   *
   * 【Repository.create() vs new Todo()】
   * this.todoRepository.create() - TypeORM 推荐方式
   * - 自动处理类型转换
   * - 自动处理关系映射
   * - 返回实体实例（未保存）
   *
   * 【为什么需要重新查询？】
   * 保存后重新查询，确保返回的数据包含：
   * - 自动生成的主键（id）
   * - 关联数据（subtasks、category）
   * - 自动时间戳（createdAt、updatedAt）
   */
  async create(userId: number, createTodoDto: CreateTodoDto): Promise<Todo> {
    // 解构：分离子任务和 Todo 数据
    const { subtasks, ...todoData } = createTodoDto;

    // 创建 Todo 实体（未保存）
    const todo = this.todoRepository.create({
      ...todoData,
      userId, // 关联当前用户
    });

    // 保存 Todo 到数据库
    const savedTodo = await this.todoRepository.save(todo);

    // 如果有子任务，创建子任务
    if (subtasks && subtasks.length > 0) {
      for (const subtaskDto of subtasks) {
        const subtask = this.subTaskRepository.create({
          title: subtaskDto.title,
          todoId: savedTodo.id, // 关联到刚创建的 Todo
        });
        await this.subTaskRepository.save(subtask);
      }

      // 重新获取 Todo，包含子任务关系
      // relations: ['subtasks', 'category'] - 加载关联数据
      const todoWithRelations = await this.todoRepository.findOne({
        where: { id: savedTodo.id, userId },
        relations: ['subtasks', 'category'],
      });

      if (!todoWithRelations) {
        throw new NotFoundException(`Todo with ID ${savedTodo.id} not found after creation`);
      }

      return todoWithRelations;
    }

    return savedTodo;
  }

  /**
   * 查询所有 Todo（支持筛选和搜索）
   *
   * 【查询构建器（Query Builder）】
   * TypeORM 提供两种查询方式：
   * 1. Repository.find() - 简单查询（适合简单条件）
   * 2. QueryBuilder - 复杂查询（适合动态条件、联表查询）
   *
   * 【为什么使用 QueryBuilder？】
   * - 支持动态条件（根据参数决定是否添加条件）
   * - 支持联表查询（leftJoinAndSelect）
   * - 支持复杂 SQL（LIKE、IN、子查询等）
   * - 性能更好（可以精确控制 SQL）
   *
   * 【leftJoinAndSelect 的作用】
   * .leftJoinAndSelect('todo.category', 'category')
   * - 左连接 category 表
   * - 同时加载关联数据到结果中
   * - 避免 N+1 查询问题
   *
   * 【参数化查询】
   * .where('todo.userId = :userId', { userId })
   * - 使用参数化查询，防止 SQL 注入
   * - :userId 是占位符
   * - { userId } 是参数值
   *
   * 【LIKE 查询】
   * { search: `%${search}%` }
   * - % 是通配符（匹配任意字符）
   * - %search% 表示包含 search 的字符串
   * - 例如：搜索 "test" 会匹配 "testing"、"contest" 等
   *
   * 【动态条件构建】
   * 根据参数决定是否添加查询条件：
   * - 如果 search 存在，添加搜索条件
   * - 如果 priority 存在，添加优先级过滤
   * - 等等...
   * 这种方式比写多个 if-else 更清晰
   */
  async findAll(
    userId: number,
    search?: string,
    priority?: string,
    categoryId?: number,
    isCompleted?: boolean,
    dueDate?: string,
  ): Promise<Todo[]> {
    // 创建查询构建器
    // 'todo' 是主表的别名
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      // 左连接 category 表，加载分类信息
      .leftJoinAndSelect('todo.category', 'category')
      // 左连接 subtasks 表，加载子任务
      .leftJoinAndSelect('todo.subtasks', 'subtasks')
      // 基础条件：只查询当前用户的 Todo
      .where('todo.userId = :userId', { userId });

    // 搜索功能：在标题或描述中搜索
    if (search) {
      queryBuilder.andWhere(
        '(todo.title LIKE :search OR todo.description LIKE :search)',
        { search: `%${search}%` }, // % 是 SQL 通配符
      );
    }

    // 按优先级过滤
    if (priority) {
      queryBuilder.andWhere('todo.priority = :priority', { priority });
    }

    // 按分类过滤
    if (categoryId) {
      queryBuilder.andWhere('todo.categoryId = :categoryId', { categoryId });
    }

    // 按完成状态过滤
    if (isCompleted !== undefined) {
      queryBuilder.andWhere('todo.isCompleted = :isCompleted', { isCompleted });
    }

    // 按截止日期过滤
    if (dueDate) {
      queryBuilder.andWhere('todo.dueDate = :dueDate', { dueDate });
    }

    // 按创建时间倒序排列（最新的在前）
    return await queryBuilder.orderBy('todo.createdAt', 'DESC').getMany();
  }

  /**
   * 查询单个 Todo
   *
   * 【安全验证】
   * where: { id, userId }
   * - 同时匹配 id 和 userId
   * - 确保用户只能查询自己的 Todo
   * - 如果 Todo 不属于当前用户，返回 null（然后抛出异常）
   *
   * 【relations 的作用】
   * relations: ['category', 'subtasks', 'parent']
   * - 加载关联数据（避免 N+1 查询问题）
   * - category：Todo 的分类
   * - subtasks：Todo 的子任务
   * - parent：Todo 的父任务（如果是子任务）
   *
   * 【异常处理】
   * 如果 Todo 不存在或不属于当前用户：
   * - 抛出 NotFoundException
   * - NestJS 自动转换为 404 响应
   * - 前端可以显示"未找到"提示
   */
  async findOne(userId: number, id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId }, // 同时匹配 id 和 userId（安全验证）
      relations: ['category', 'subtasks', 'parent'], // 加载关联数据
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  async update(userId: number, id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(userId, id);

    await this.todoRepository.update(id, updateTodoDto);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    const todo = await this.findOne(userId, id);
    await this.todoRepository.delete(id);
  }

  /**
   * 获取 Todo 统计信息
   *
   * 【统计内容】
   * - total：总数
   * - completed：已完成数
   * - pending：待完成数
   * - completionRate：完成率（百分比）
   * - priorityStats：各优先级的数量
   * - overdueCount：逾期任务数
   *
   * 【性能考虑】
   * 当前实现：先查询所有 Todo，再在内存中计算
   * - 优点：代码简单
   * - 缺点：如果 Todo 数量很大，性能较差
   *
   * 【优化方案（可选）】
   * 可以使用数据库聚合函数：
   * - COUNT() - 统计总数
   * - SUM() - 统计完成数
   * - GROUP BY - 按优先级分组统计
   * 这样可以减少数据传输和内存占用
   *
   * 【逾期判断】
   * new Date(t.dueDate) < new Date() && !t.isCompleted
   * - 截止日期小于当前日期
   * - 且未完成
   * - 满足这两个条件才算逾期
   */
  async getStatistics(userId: number) {
    // 查询当前用户的所有 Todo
    const todos = await this.todoRepository.find({
      where: { userId },
    });

    // 基础统计
    const total = todos.length;
    const completed = todos.filter((t) => t.isCompleted).length;
    const pending = total - completed;

    // 优先级统计
    const priorityStats = {
      high: todos.filter((t) => t.priority === 'high').length,
      medium: todos.filter((t) => t.priority === 'medium').length,
      low: todos.filter((t) => t.priority === 'low').length,
    };

    // 逾期任务统计
    // 截止日期已过 且 未完成
    const overdueCount = todos.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted,
    ).length;

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityStats,
      overdueCount,
    };
  }

  async batchDelete(userId: number, ids: number[]): Promise<void> {
    // 只删除属于当前用户的 todo
    const result = await this.todoRepository
      .createQueryBuilder()
      .delete()
      .from(Todo)
      .where('id IN (:...ids)', { ids })
      .andWhere('userId = :userId', { userId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('没有找到可删除的 todo');
    }
  }

  async batchUpdate(userId: number, ids: number[], updates: UpdateTodoDto): Promise<void> {
    // 只更新属于当前用户的 todo
    const result = await this.todoRepository
      .createQueryBuilder()
      .update(Todo)
      .set(updates)
      .where('id IN (:...ids)', { ids })
      .andWhere('userId = :userId', { userId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('没有找到可更新的 todo');
    }
  }

  async toggleComplete(userId: number, id: number): Promise<Todo> {
    const todo = await this.findOne(userId, id);
    todo.isCompleted = !todo.isCompleted;
    return await this.todoRepository.save(todo);
  }

  // SubTask相关方法
  async createSubTask(userId: number, createSubTaskDto: CreateSubTaskDto): Promise<SubTask> {
    // 先检查 todo 是否属于当前用户
    const todo = await this.todoRepository.findOne({
      where: { id: createSubTaskDto.todoId, userId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${createSubTaskDto.todoId} not found`);
    }

    const subtask = this.subTaskRepository.create(createSubTaskDto);
    return await this.subTaskRepository.save(subtask);
  }

  async updateSubTask(userId: number, id: number, updateSubTaskDto: UpdateSubTaskDto): Promise<SubTask> {
    const subtask = await this.subTaskRepository.findOne({
      where: { id },
      relations: ['todo'],
    });

    if (!subtask) {
      throw new NotFoundException(`SubTask with ID ${id} not found`);
    }

    // 检查 todo 是否属于当前用户
    if (subtask.todo.userId !== userId) {
      throw new ForbiddenException('无权修改此子任务');
    }

    await this.subTaskRepository.update(id, updateSubTaskDto);
    const updated = await this.subTaskRepository.findOne({ where: { id } });

    if (!updated) {
      throw new NotFoundException(`SubTask with ID ${id} not found`);
    }

    // 更新父任务的进度
    await this.updateTodoProgress(subtask.todoId);

    return updated;
  }

  async deleteSubTask(userId: number, id: number): Promise<void> {
    const subtask = await this.subTaskRepository.findOne({
      where: { id },
      relations: ['todo'],
    });

    if (!subtask) {
      throw new NotFoundException(`SubTask with ID ${id} not found`);
    }

    // 检查 todo 是否属于当前用户
    if (subtask.todo.userId !== userId) {
      throw new ForbiddenException('无权删除此子任务');
    }

    const todoId = subtask.todoId;
    await this.subTaskRepository.delete(id);
    await this.updateTodoProgress(todoId);
  }

  async toggleSubTaskComplete(userId: number, id: number): Promise<SubTask> {
    const subtask = await this.subTaskRepository.findOne({
      where: { id },
      relations: ['todo'],
    });

    if (!subtask) {
      throw new NotFoundException(`SubTask with ID ${id} not found`);
    }

    // 检查 todo 是否属于当前用户
    if (subtask.todo.userId !== userId) {
      throw new ForbiddenException('无权修改此子任务');
    }

    subtask.isCompleted = !subtask.isCompleted;
    const updated = await this.subTaskRepository.save(subtask);
    await this.updateTodoProgress(subtask.todoId);
    return updated;
  }

  /**
   * 更新 Todo 进度（私有方法）
   *
   * 【私有方法】
   * private 关键字表示此方法只能在类内部调用
   * - 不对外暴露（Controller 不能直接调用）
   * - 用于内部逻辑复用
   * - 提高代码封装性
   *
   * 【进度计算】
   * 根据子任务的完成情况计算进度：
   * - 如果没有子任务，进度为 0
   * - 如果有子任务，进度 = (已完成数 / 总数) * 100
   * - 四舍五入到整数
   *
   * 【自动更新】
   * 在以下操作后自动调用：
   * - 更新子任务状态
   * - 切换子任务完成状态
   * - 删除子任务
   * 确保 Todo 的进度始终准确
   *
   * 【设计模式：观察者模式】
   * 子任务状态变化时，自动更新父任务进度
   * - 子任务是被观察者
   * - Todo 是观察者
   * - 状态变化触发更新
   */
  private async updateTodoProgress(todoId: number): Promise<void> {
    // 查询该 Todo 的所有子任务
    const subtasks = await this.subTaskRepository.find({ where: { todoId } });
    
    // 如果没有子任务，进度设为 0
    if (subtasks.length === 0) {
      await this.todoRepository.update(todoId, { progress: 0 });
      return;
    }
    
    // 计算已完成子任务的数量
    const completed = subtasks.filter((st) => st.isCompleted).length;
    
    // 计算进度百分比（四舍五入）
    const progress = Math.round((completed / subtasks.length) * 100);
    
    // 更新 Todo 的进度
    await this.todoRepository.update(todoId, { progress });
  }
}
