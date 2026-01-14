/**
 * 更新子任务数据传输对象
 *
 * 【设计模式】
 * 与 UpdateTodoDto 类似，使用 PartialType 继承 CreateSubTaskDto
 * - 所有字段变为可选
 * - 支持部分更新
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubTaskDto } from './create-subtask.dto';

/**
 * UpdateSubTaskDto - 更新子任务 DTO
 *
 * 【字段说明】
 * - title?: string - 子任务标题（可选）
 * - todoId?: number - 所属 Todo ID（可选，通常不更新）
 * - isCompleted?: boolean - 完成状态（可选）
 */
export class UpdateSubTaskDto extends PartialType(CreateSubTaskDto) {
  /**
   * isCompleted - 完成状态
   *
   * 【用途】
   * 用于切换子任务的完成状态
   */
  isCompleted?: boolean;
}
