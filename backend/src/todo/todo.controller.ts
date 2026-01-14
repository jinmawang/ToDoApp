/**
 * Todo 控制器
 *
 * 【RESTful API 设计】
 * 遵循 REST 规范设计 API：
 * - GET /todos - 获取所有 Todo（列表）
 * - GET /todos/:id - 获取单个 Todo（详情）
 * - POST /todos - 创建 Todo
 * - PATCH /todos/:id - 更新 Todo（部分更新）
 * - DELETE /todos/:id - 删除 Todo
 *
 * 【资源嵌套】
 * 子任务（SubTask）作为 Todo 的子资源：
 * - POST /todos/:todoId/subtasks - 创建子任务
 * - PATCH /todos/subtasks/:id - 更新子任务
 * - DELETE /todos/subtasks/:id - 删除子任务
 *
 * 【后端开发思维：多租户数据隔离】
 * 所有操作都基于当前登录用户：
 * - 用户只能看到和操作自己的 Todo
 * - 通过 @CurrentUser() 获取当前用户
 * - Service 层验证数据所有权
 * - 防止用户访问或修改他人的数据
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateSubTaskDto } from './dto/create-subtask.dto';
import { UpdateSubTaskDto } from './dto/update-subtask.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * TodoController - Todo 控制器
 *
 * 【类级别守卫】
 * @UseGuards(JwtAuthGuard) 在类上使用
 * - 所有路由都需要 JWT 认证
 * - 不需要在每个方法上重复写 @UseGuards()
 * - 如果某个路由需要公开访问，可以在方法上使用 @Public()
 */
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * POST /todos - 创建 Todo
   *
   * 【参数说明】
   * @CurrentUser() user: User - 当前登录用户（自动注入）
   * @Body() createTodoDto: CreateTodoDto - 创建 Todo 的数据
   *
   * 【数据流】
   * 1. 前端发送 POST /todos，请求体包含 Todo 信息
   * 2. 自动验证 DTO（title、description 等字段）
   * 3. 调用 Service 创建 Todo，自动关联当前用户
   * 4. 返回创建的 Todo（包含生成的 ID）
   */
  @Post()
  create(@CurrentUser() user: User, @Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(user.id, createTodoDto);
  }

  /**
   * GET /todos - 获取所有 Todo（支持筛选和搜索）
   *
   * 【查询参数】
   * @Query('search') - 搜索关键词（标题或描述）
   * @Query('priority') - 优先级筛选（high/medium/low）
   * @Query('categoryId') - 分类筛选
   * @Query('isCompleted') - 完成状态筛选（true/false）
   * @Query('dueDate') - 截止日期筛选
   *
   * 【类型转换】
   * categoryId ? +categoryId : undefined
   * - +categoryId 将字符串转换为数字（一元加号运算符）
   * - 如果 categoryId 不存在，返回 undefined
   *
   * isCompleted !== undefined ? isCompleted === 'true' : undefined
   * - 查询参数是字符串（'true' 或 'false'）
   * - 转换为布尔值（true 或 false）
   * - 如果未提供，返回 undefined（不过滤）
   *
   * 【后端开发思维：查询参数设计】
   * - 使用可选参数，支持灵活筛选
   * - 参数类型转换（字符串 → 数字/布尔值）
   * - 默认返回所有数据（不传参数时）
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('priority') priority?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isCompleted') isCompleted?: string,
    @Query('dueDate') dueDate?: string,
  ) {
    return this.todoService.findAll(
      user.id,
      search,
      priority,
      categoryId ? +categoryId : undefined,
      isCompleted !== undefined ? isCompleted === 'true' : undefined,
      dueDate,
    );
  }

  /**
   * GET /todos/statistics - 获取 Todo 统计信息
   *
   * 【统计内容】
   * - 总数、已完成数、待完成数
   * - 完成率
   * - 各优先级的数量
   * - 逾期任务数
   *
   * 【使用场景】
   * - 仪表板显示统计数据
   * - 数据可视化（图表）
   * - 用户了解任务完成情况
   */
  @Get('statistics')
  getStatistics(@CurrentUser() user: User) {
    return this.todoService.getStatistics(user.id);
  }

  /**
   * GET /todos/:id - 获取单个 Todo 详情
   *
   * 【路由参数】
   * @Param('id') id: string - 从 URL 路径中提取 ID
   * - URL: /todos/123
   * - id = "123"（字符串类型）
   * - +id 转换为数字类型
   *
   * 【安全验证】
   * Service 层会验证：
   * - Todo 是否存在
   * - Todo 是否属于当前用户
   * - 如果验证失败，抛出异常
   */
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.findOne(user.id, +id);
  }

  /**
   * PATCH /todos/:id - 更新 Todo（部分更新）
   *
   * 【PATCH vs PUT】
   * - PATCH：部分更新（只更新提供的字段）
   * - PUT：完整替换（需要提供所有字段）
   * 这里使用 PATCH，更灵活
   *
   * 【更新流程】
   * 1. 验证 Todo 是否存在且属于当前用户
   * 2. 更新提供的字段
   * 3. 返回更新后的 Todo
   */
  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(user.id, +id, updateTodoDto);
  }

  /**
   * PATCH /todos/:id/toggle - 切换 Todo 完成状态
   *
   * 【设计优势】
   * 专门的切换接口，比通用更新接口更语义化：
   * - 明确表达意图（切换状态）
   * - 前端调用更简单
   * - 可以添加特殊逻辑（如完成时发送通知）
   */
  @Patch(':id/toggle')
  toggleComplete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.toggleComplete(user.id, +id);
  }

  /**
   * DELETE /todos/batch - 批量删除 Todo
   *
   * 【批量操作】
   * 支持一次删除多个 Todo：
   * - 提高用户体验（不需要逐个删除）
   * - 减少 HTTP 请求次数
   * - 提高性能
   *
   * 【请求体】
   * { "ids": [1, 2, 3] }
   * - 只删除属于当前用户的 Todo
   * - 如果某个 ID 不属于当前用户，会被忽略
   */
  @Delete('batch')
  batchDelete(@CurrentUser() user: User, @Body('ids') ids: number[]) {
    return this.todoService.batchDelete(user.id, ids);
  }

  /**
   * PATCH /todos/batch/update - 批量更新 Todo
   *
   * 【使用场景】
   * - 批量标记为完成
   * - 批量修改优先级
   * - 批量移动到分类
   *
   * 【请求体】
   * {
   *   "ids": [1, 2, 3],
   *   "priority": "high",
   *   "categoryId": 5
   * }
   */
  @Patch('batch/update')
  batchUpdate(@CurrentUser() user: User, @Body('ids') ids: number[], @Body() updates: UpdateTodoDto) {
    return this.todoService.batchUpdate(user.id, ids, updates);
  }

  /**
   * DELETE /todos/:id - 删除单个 Todo
   *
   * 【删除流程】
   * 1. 验证 Todo 是否存在且属于当前用户
   * 2. 删除 Todo（级联删除子任务）
   * 3. 返回成功响应
   */
  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.remove(user.id, +id);
  }

  // ========== SubTask 相关端点 ==========

  /**
   * POST /todos/:todoId/subtasks - 创建子任务
   *
   * 【资源嵌套】
   * 子任务作为 Todo 的子资源：
   * - URL 路径体现层级关系
   * - todoId 从路径参数获取
   * - 自动关联到对应的 Todo
   *
   * 【数据合并】
   * { ...createSubTaskDto, todoId: +todoId }
   * - 展开 createSubTaskDto 的所有属性
   * - 添加 todoId 字段（从路径参数获取）
   * - 确保子任务关联到正确的 Todo
   */
  @Post(':todoId/subtasks')
  createSubTask(
    @CurrentUser() user: User,
    @Param('todoId') todoId: string,
    @Body() createSubTaskDto: CreateSubTaskDto,
  ) {
    return this.todoService.createSubTask(user.id, { ...createSubTaskDto, todoId: +todoId });
  }

  /**
   * PATCH /todos/subtasks/:id - 更新子任务
   *
   * 【安全验证】
   * Service 层会验证：
   * - 子任务是否存在
   * - 子任务所属的 Todo 是否属于当前用户
   * - 防止用户修改他人的子任务
   */
  @Patch('subtasks/:id')
  updateSubTask(@CurrentUser() user: User, @Param('id') id: string, @Body() updateSubTaskDto: UpdateSubTaskDto) {
    return this.todoService.updateSubTask(user.id, +id, updateSubTaskDto);
  }

  /**
   * PATCH /todos/subtasks/:id/toggle - 切换子任务完成状态
   *
   * 【自动更新进度】
   * 切换子任务状态后，会自动更新父 Todo 的进度：
   * - 计算已完成子任务的比例
   * - 更新 Todo.progress 字段
   * - 如果所有子任务完成，可以自动标记 Todo 为完成
   */
  @Patch('subtasks/:id/toggle')
  toggleSubTaskComplete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.toggleSubTaskComplete(user.id, +id);
  }

  /**
   * DELETE /todos/subtasks/:id - 删除子任务
   *
   * 【级联更新】
   * 删除子任务后，会自动更新父 Todo 的进度
   */
  @Delete('subtasks/:id')
  deleteSubTask(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.deleteSubTask(user.id, +id);
  }
}
