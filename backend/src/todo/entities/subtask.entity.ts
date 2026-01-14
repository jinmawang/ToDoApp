/**
 * SubTask 实体类 - 子任务模型
 *
 * 【子任务的作用】
 * 子任务用于将大任务拆分成小任务：
 * - 提高任务管理的灵活性
 * - 便于跟踪任务进度
 * - 支持任务分解和细化
 *
 * 【关系设计】
 * SubTask (多) ←→ (一) Todo
 * - 多个子任务属于一个 Todo
 * - 一个 Todo 可以有多个子任务
 * - 删除 Todo 时，级联删除所有子任务
 *
 * 【与 Todo 的区别】
 * - Todo：主任务，有完整的字段（优先级、截止日期等）
 * - SubTask：子任务，字段较少（只有标题和完成状态）
 * - SubTask 的完成情况影响 Todo 的进度
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Todo } from './todo.entity';

/**
 * @Entity('subtasks') - 映射到 subtasks 表
 */
@Entity('subtasks')
export class SubTask {
  /**
   * id - 子任务唯一标识
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * title - 子任务标题
   *
   * 【字段设计】
   * - 必填字段（nullable: false，默认值）
   * - 字符串类型
   * - 通常较短（比 Todo 的描述更简洁）
   */
  @Column()
  title: string;

  /**
   * isCompleted - 是否完成
   *
   * 【默认值】
   * default: false - 新建时默认为未完成
   */
  @Column({ default: false })
  isCompleted: boolean;

  /**
   * todo - 关联的 Todo（多对一关系）
   *
   * 【关系说明】
   * @ManyToOne(() => Todo, (todo) => todo.subtasks)
   * - 多个 SubTask 属于一个 Todo
   * - 通过 todo.subtasks 可以访问所有子任务
   *
   * 【级联删除】
   * onDelete: 'CASCADE'
   * - 当 Todo 被删除时，自动删除所有子任务
   * - 保持数据一致性
   * - 避免孤立数据
   */
  @ManyToOne(() => Todo, (todo) => todo.subtasks, { onDelete: 'CASCADE' })
  todo: Todo;

  /**
   * todoId - Todo ID（外键）
   *
   * 【外键字段】
   * - 数据库表中实际存储的外键值
   * - 用于关联查询和索引
   */
  @Column()
  todoId: number;

  /**
   * createdAt - 创建时间
   *
   * 【自动时间戳】
   * @CreateDateColumn 自动设置创建时间
   * - 不需要手动设置
   * - 精确到毫秒
   */
  @CreateDateColumn()
  createdAt: Date;
}
