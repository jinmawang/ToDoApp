/**
 * 更新 Todo 数据传输对象
 *
 * 【PartialType 的作用】
 * PartialType 是 NestJS 提供的工具类型，用于：
 * - 将 CreateTodoDto 的所有字段变为可选
 * - 避免重复定义字段
 * - 保持 DTO 的一致性
 *
 * 【设计模式：DRY 原则】
 * Don't Repeat Yourself（不要重复自己）：
 * - CreateTodoDto 定义了所有字段
 * - UpdateTodoDto 继承并使其可选
 * - 更新时只需要提供要修改的字段
 *
 * 【与 CreateTodoDto 的区别】
 * - CreateTodoDto：所有字段都有默认值或必填
 * - UpdateTodoDto：所有字段都是可选的（部分更新）
 *
 * 【使用场景】
 * 前端发送部分字段进行更新：
 * - PATCH /todos/1 { "title": "新标题" } - 只更新标题
 * - PATCH /todos/1 { "isCompleted": true } - 只更新完成状态
 * - PATCH /todos/1 { "title": "新标题", "priority": "high" } - 更新多个字段
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';

/**
 * UpdateTodoDto - 更新 Todo DTO
 *
 * 【继承关系】
 * extends PartialType(CreateTodoDto)
 * - 继承 CreateTodoDto 的所有字段
 * - 但所有字段都变为可选（Partial）
 *
 * 【额外字段】
 * isCompleted?: boolean
 * - 添加完成状态字段
 * - 用于切换任务完成状态
 * - 可选字段（可以只更新其他字段）
 *
 * 【类型转换示例】
 * CreateTodoDto:
 * {
 *   title: string;           // 必填
 *   description?: string;    // 可选
 *   priority?: Priority;     // 可选
 * }
 *
 * UpdateTodoDto (PartialType 后):
 * {
 *   title?: string;          // 变为可选
 *   description?: string;    // 保持可选
 *   priority?: Priority;     // 保持可选
 *   isCompleted?: boolean;   // 新增字段
 * }
 */
export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  /**
   * isCompleted - 完成状态
   *
   * 【为什么单独定义？】
   * - CreateTodoDto 中可能没有这个字段（新建时默认为 false）
   * - 更新时需要能够切换完成状态
   * - 单独定义更清晰
   */
  isCompleted?: boolean;
}


