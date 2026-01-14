/**
 * 创建 Todo 数据传输对象
 *
 * 【DTO 设计】
 * 定义创建 Todo 时需要的数据结构：
 * - 必填字段：title（标题）
 * - 可选字段：description、priority、dueDate 等
 * - 嵌套对象：subtasks（子任务数组）
 *
 * 【数据验证】
 * 使用 class-validator 装饰器进行验证：
 * - @IsString() - 验证字符串类型
 * - @IsOptional() - 标记为可选字段
 * - @IsEnum() - 验证枚举值
 * - @ValidateNested() - 验证嵌套对象
 */
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Priority } from '../entities/todo.entity';
import { Type } from 'class-transformer';

/**
 * CreateSubTaskDto - 创建子任务 DTO
 *
 * 【嵌套 DTO】
 * 子任务作为 Todo 的一部分，使用嵌套 DTO：
 * - 简化数据结构
 * - 支持同时创建 Todo 和子任务
 * - 便于验证子任务数据
 */
export class CreateSubTaskDto {
  /**
   * title - 子任务标题
   *
   * @IsString() - 验证字符串类型
   * - 必填字段（没有 @IsOptional()）
   */
  @IsString()
  title: string;
}

/**
 * CreateTodoDto - 创建 Todo DTO
 *
 * 【字段说明】
 * - title: 必填，任务标题
 * - description: 可选，任务描述
 * - priority: 可选，优先级（枚举值）
 * - dueDate: 可选，截止日期
 * - categoryId: 可选，分类 ID
 * - parentId: 可选，父任务 ID（用于任务层级）
 * - subtasks: 可选，子任务数组
 */
export class CreateTodoDto {
  /**
   * title - 任务标题
   *
   * 【必填字段】
   * - 没有 @IsOptional()，表示必填
   * - 如果为空，验证会失败
   */
  @IsString()
  title: string;

  /**
   * description - 任务描述
   *
   * 【可选字段】
   * @IsOptional() - 标记为可选
   * - 如果未提供，值为 undefined
   * - 不会触发验证错误
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * priority - 优先级
   *
   * 【枚举验证】
   * @IsEnum(Priority) - 验证值必须是 Priority 枚举中的值
   * - 只能是 'low'、'medium'、'high' 之一
   * - 如果传入其他值，验证会失败
   */
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  /**
   * dueDate - 截止日期
   *
   * 【日期格式验证】
   * @IsDateString() - 验证日期字符串格式
   * - 格式：YYYY-MM-DD（如 "2025-01-15"）
   * - 如果格式不正确，验证会失败
   */
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  /**
   * categoryId - 分类 ID
   *
   * 【关联字段】
   * - 关联到 Category 实体
   * - 如果提供，Todo 会关联到该分类
   * - 如果不提供，Todo 没有分类
   */
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  /**
   * parentId - 父任务 ID
   *
   * 【任务层级】
   * - 用于创建子任务（任务可以嵌套）
   * - 如果提供，当前 Todo 会成为指定 Todo 的子任务
   * - 如果不提供，当前 Todo 是根任务
   */
  @IsNumber()
  @IsOptional()
  parentId?: number;

  /**
   * subtasks - 子任务数组
   *
   * 【嵌套验证】
   * @IsArray() - 验证是数组类型
   * @ValidateNested({ each: true }) - 验证数组中的每个元素
   * @Type(() => CreateSubTaskDto) - 类型转换（JSON → CreateSubTaskDto）
   *
   * 【为什么需要 @Type()？】
   * 前端发送的 JSON 数据是普通对象
   * class-transformer 需要将对象转换为 CreateSubTaskDto 实例
   * 这样才能触发 class-validator 的验证
   *
   * 【使用示例】
   * 前端发送：
   * {
   *   "title": "完成项目",
   *   "subtasks": [
   *     { "title": "设计" },
   *     { "title": "开发" }
   *   ]
   * }
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubTaskDto)
  subtasks?: CreateSubTaskDto[];
}
