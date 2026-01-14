/**
 * Category 实体类 - 分类模型
 *
 * 【分类的作用】
 * 分类用于组织和标记 Todo：
 * - 用户可以创建自定义分类（如"工作"、"学习"、"生活"）
 * - 每个分类有名称、颜色、图标
 * - Todo 可以关联到分类，便于筛选和管理
 *
 * 【关系设计】
 * - Category (多) ←→ (一) User：多个分类属于一个用户
 * - Category (一) ←→ (多) Todo：一个分类可以有多个 Todo
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Todo } from '../../todo/entities/todo.entity';

/**
 * @Entity('categories') - 映射到 categories 表
 */
@Entity('categories')
export class Category {
  /**
   * id - 分类唯一标识
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * name - 分类名称
   *
   * 【字段设计】
   * - 必填字段
   * - 用户自定义（如"工作"、"学习"）
   */
  @Column()
  name: string;

  /**
   * color - 分类颜色
   *
   * 【默认值】
   * default: '#3B82F6' - 默认蓝色（Tailwind CSS 的 blue-500）
   *
   * 【用途】
   * - 前端显示时使用该颜色
   * - 可以是十六进制颜色码（#3B82F6）
   * - 也可以是颜色名称（blue）
   */
  @Column({ default: '#3B82F6' })
  color: string;

  /**
   * icon - 分类图标
   *
   * 【默认值】
   * default: '' - 默认为空字符串
   *
   * 【用途】
   * - 存储图标名称或图标 URL
   * - 前端根据图标名称显示对应图标
   * - 例如："work"、"study"、"life"
   */
  @Column({ default: '' })
  icon: string;

  /**
   * user - 关联的用户（多对一关系）
   *
   * 【关系说明】
   * @ManyToOne(() => User, (user) => user.categories)
   * - 多个分类属于一个用户
   * - 通过 user.categories 可以访问用户的所有分类
   *
   * 【级联删除】
   * onDelete: 'CASCADE'
   * - 当用户被删除时，自动删除该用户的所有分类
   * - 保持数据一致性
   */
  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // 指定外键列名
  user: User;

  /**
   * userId - 用户 ID（外键）
   */
  @Column()
  userId: number;

  /**
   * todos - 该分类下的所有 Todo（一对多关系）
   *
   * 【关系说明】
   * @OneToMany(() => Todo, (todo) => todo.category)
   * - 一个分类可以有多个 Todo
   * - 通过 category.todos 可以访问该分类下的所有 Todo
   *
   * 【删除行为】
   * 注意：这里没有配置 onDelete
   * - 删除分类时，关联的 Todo 的 categoryId 会设为 NULL
   * - 这是在 Todo 实体中配置的（onDelete: 'SET NULL'）
   * - 这样设计可以保留 Todo，只是取消分类关联
   */
  @OneToMany(() => Todo, (todo) => todo.category)
  todos: Todo[];

  /**
   * createdAt - 创建时间
   */
  @CreateDateColumn()
  createdAt: Date;
}
