/**
 * Todo 实体类
 *
 * 【什么是实体类？】
 * 实体类（Entity）是 TypeORM 的核心概念，用于将数据库表映射为 TypeScript 类。
 *
 * 【为什么要用实体类？】
 * - 面向对象操作：可以用对象的方式来操作数据库，不需要写 SQL
 * - 类型安全：TypeScript 会提供类型检查和自动补全
 * - 关系映射：定义表与表之间的关系（一对多、多对一等）
 *
 * 【对应关系】
 * - 实体类（Todo）→ 数据库表（todos）
 * - 类属性（title）→ 表字段（title）
 * - 对象实例 → 表中的一行数据
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { SubTask } from './subtask.entity';

/**
 * 优先级枚举
 *
 * 【什么是枚举？】
 * 枚举（Enum）是一种特殊的数据类型，包含一组预定义的常量值。
 * 使用枚举可以避免硬编码字符串，提高代码可读性和类型安全。
 *
 * 【好处】
 * - 只能使用预定义的值，避免拼写错误
 * - IDE 会提供自动补全
 * - 重构时可以全局修改
 */
export enum Priority {
  LOW = 'low', // 低优先级
  MEDIUM = 'medium', // 中优先级（默认）
  HIGH = 'high', // 高优先级
}

/**
 * @Entity('todos') - 声明这是一个实体类，映射到数据库的 todos 表
 * 如果不指定表名，TypeORM 会使用类名作为表名（这里会变成 'todo' 表）
 */
@Entity('todos')
export class Todo {
  /**
   * @PrimaryGeneratedColumn() - 主键列，自动生成
   *
   * 【什么是主键？】
   * 主键是表中唯一标识每一行的字段。
   * - 每个表必须有主键
   * - 主键值必须唯一
   * - 主键通常自增（1, 2, 3...）
   *
   * 【设计思路】
   * 使用 number 类型的自增 ID 作为主键：
   * - 简单、高效
   * - 数据库自动管理，不需要手动生成
   * - 占用空间小
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column() - 普通列
   *
   * 【字段设计】
   * title 字段存储任务的标题
   * - 非空（nullable: false，默认值）
   * - 字符串类型（默认生成 varchar 类型）
   * - 长度由数据库默认决定（通常是 255）
   */
  @Column()
  title: string;

  /**
   * description - 任务描述
   *
   * 【为什么用 text 类型？】
   * text 类型可以存储较长的文本内容
   * - varchar 有最大长度限制（通常是 65535 字节）
   * - text 可以存储更大的内容（最多 65535 字节）
   * - nullable: true 表示可以为空（任务描述是可选的）
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * isCompleted - 是否完成
   *
   * 【为什么用布尔类型？】
   * boolean 类型只有两个值：true 或 false
   * - 适合表示"是/否"的状态
   * - 数据库中存储为 TINYINT(1)，占用空间小
   * - default: false 表示默认未完成
   */
  @Column({ default: false })
  isCompleted: boolean;

  /**
   * priority - 优先级
   *
   * 【为什么要用枚举类型？】
   * enum 类型确保只能存储预定义的值
   * - 防止插入无效的优先级值
   * - 数据库层面强制约束
   * - 提高数据一致性
   *
   * 【默认值设计】
   * 默认为 MEDIUM（中等），符合大多数情况
   */
  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  /**
   * dueDate - 截止日期
   *
   * 【为什么用 date 类型？】
   * date 类型只存储日期（不包含时间）
   * - 格式：YYYY-MM-DD（如 2025-01-15）
   * - 如果需要时间，可以用 datetime 类型
   * - nullable: true 表示截止日期是可选的
   */
  @Column({ type: 'date', nullable: true })
  dueDate: string;

  /**
   * hasReminder - 是否设置提醒
   *
   * 【功能预留】
   * 这个字段标记用户是否设置了提醒
   * - 可以配合定时任务使用
   * - 到期时发送通知
   */
  @Column({ default: false })
  hasReminder: boolean;

  /**
   * user - 关联的用户（多对一关系）
   *
   * 【什么是多对一关系？】
   * 多个 Todo 属于一个 User
   * - 一个用户可以有多个 Todo
   * - 一个 Todo 只能属于一个用户
   *
   * 【关系装饰器详解】
   * @ManyToOne(() => User, (user) => user.todos)
   * - 第一个参数：指向的实体类（User）
   * - 第二个参数：User 实体中对应的属性名（user.todos）
   *
   * 【onDelete: 'CASCADE' 的含义】
   * 级联删除：当用户被删除时，自动删除该用户的所有 Todo
   * - 保持数据一致性
   * - 避免孤立数据（没有用户的 Todo）
   */
  @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE' })
  user: User;

  /**
   * userId - 用户 ID（外键）
   *
   * 【为什么需要单独的外键字段？】
   * 虽然 user 属性已经定义了关系，但数据库表中需要实际的外键列
   * - user 属性：TypeORM 用于查询时加载关联数据
   * - userId 字段：数据库表中实际存储外键值的列
   *
   * 【外键的作用】
   * - 建立表与表之间的关联
   * - 数据库层面的约束（不能插入不存在的 userId）
   * - 提高查询性能（有索引）
   */
  @Column()
  userId: number;

  /**
   * category - 关联的分类（多对一关系）
   *
   * 【为什么 nullable: true？】
   * Todo 可以不分类
   * - 允许 Todo 没有分类
   * - 删除分类时，该字段设为 NULL（见下面的 onDelete）
   */
  @ManyToOne(() => Category, (category) => category.todos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' }) // 指定外键列名
  category: Category;

  /**
   * categoryId - 分类 ID（外键）
   *
   * 【为什么 nullable: true？】
   * Todo 可以不属于任何分类
   * - 允许该字段为 NULL
   */
  @Column({ nullable: true })
  categoryId: number;

  /**
   * parent - 父任务（多对一关系）
   *
   * 【什么是递归关系？】
   * Todo 可以引用另一个 Todo（父子任务）
   * - 用于大任务拆分成小任务
   * - 可以创建任务层级结构
   *
   * 【示例场景】
   * 父任务："完成项目报告"
   * 子任务：
   *   - "收集数据"（parentId = 父任务ID）
   *   - "分析数据"（parentId = 父任务ID）
   *   - "撰写报告"（parentId = 父任务ID）
   */
  @ManyToOne(() => Todo, (todo) => todo.subtasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: Todo;

  /**
   * parentId - 父任务 ID
   *
   * 【自引用外键】
   * 这个外键指向同一个表（todos 表）
   * - parentId 指向另一个 Todo 的 id
   * - 根任务的 parentId 为 NULL
   */
  @Column({ nullable: true })
  parentId: number;

  /**
   * subtasks - 子任务（一对多关系）
   *
   * 【一对多关系】
   * 一个 Todo 可以有多个 SubTask
   * - TypeORM 会自动根据这个关系加载子任务
   * - 可以通过 todo.subtasks 访问子任务数组
   *
   * 【与 parent 属性的关系】
   * - parent：这个 Todo 的父任务是谁（向上）
   * - subtasks：这个 Todo 有哪些子任务（向下）
   */
  @OneToMany(() => SubTask, (subtask) => subtask.todo)
  subtasks: SubTask[];

  /**
   * progress - 完成进度（0-100）
   *
   * 【进度计算】
   * 可以根据子任务的完成情况自动计算
   * - 0：未开始
   * - 50：进行中（一半子任务完成）
   * - 100：已完成
   */
  @Column({ default: 0 })
  progress: number;

  /**
   * createdAt - 创建时间
   *
   * 【自动时间戳】
   * @CreateDateColumn 会自动设置创建时间
   * - 插入数据时自动填充
   * - 不需要手动设置
   * - 精度到毫秒
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * updatedAt - 更新时间
   *
   * 【自动时间戳】
   * @UpdateDateColumn 会自动更新修改时间
   * - 每次更新记录时自动刷新
   * - 不需要手动维护
   * - 用于追踪记录的最后修改时间
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
