/**
 * 创建子任务数据传输对象
 *
 * 【注意】
 * 这个 DTO 用于直接创建子任务（通过 POST /todos/:todoId/subtasks）
 * 与 create-todo.dto.ts 中的 CreateSubTaskDto 不同：
 * - 这个包含 todoId（从路径参数获取）
 * - 那个不包含 todoId（在创建 Todo 时自动关联）
 *
 * 【字段说明】
 * - title: 子任务标题（必填）
 * - todoId: 所属 Todo 的 ID（必填）
 */
import { IsString, IsNumber } from 'class-validator';

/**
 * CreateSubTaskDto - 创建子任务 DTO
 *
 * 【使用场景】
 * 通过独立接口创建子任务：
 * POST /todos/123/subtasks
 * {
 *   "title": "子任务标题"
 * }
 * - todoId 从路径参数获取，不需要在请求体中提供
 * - Controller 会自动合并 todoId
 */
export class CreateSubTaskDto {
  /**
   * title - 子任务标题
   */
  @IsString()
  title: string;

  /**
   * todoId - 所属 Todo 的 ID
   *
   * 【注意】
   * 虽然这个字段在 DTO 中定义，但通常从路径参数获取
   * Controller 会从 @Param('todoId') 获取并合并到 DTO
   */
  @IsNumber()
  todoId: number;
}
