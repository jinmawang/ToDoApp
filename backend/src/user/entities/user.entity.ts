/**
 * User 实体类 - 用户模型
 *
 * 【用户实体作用】
 * 表示应用中的用户，存储用户的基本信息和认证信息。
 *
 * 【安全设计重点】
 * 1. 密码字段：存储加密后的密码（bcrypt 哈希），不存储明文
 * 2. 唯一约束：username 和 email 必须唯一，防止重复注册
 * 3. 关系保护：用户删除时级联删除其关联的数据
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Todo } from '../../todo/entities/todo.entity';
import { Category } from '../../category/entities/category.entity';

/**
 * @Entity('users') - 声明这是实体类，映射到 users 表
 *
 * 【表命名规范】
 * - 使用复数形式（users 而不是 user）
 * - 这是数据库设计的惯例
 * - 表示表中存储多条用户记录
 */
@Entity('users')
export class User {
  /**
   * id - 用户唯一标识
   *
   * @PrimaryGeneratedColumn() - 主键，自动生成
   *
   * 【主键的作用】
   * - 唯一标识每个用户
   * - 其他表通过 userId 关联到用户
   * - 索引自动创建，提高查询性能
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * username - 用户名
   *
   * 【为什么 unique: true？】
   * unique: true 表示这个字段的值必须唯一
   * - 数据库层面强制约束（不能插入重复的用户名）
   * - 自动创建唯一索引，提高查询速度
   * - 用户登录时通过用户名查找用户
   *
   * 【使用场景】
   * - 用户登录（用户名 + 密码）
   * - 显示在界面上（如："欢迎，张三"）
   */
  @Column({ unique: true })
  username: string;

  /**
   * password - 密码（加密后存储）
   *
   * 【安全设计 - 永远不存储明文密码！】
   *
   * 【为什么不能存储明文？】
   * 1. 数据库泄露风险：如果数据库被黑客攻击，所有用户的密码会暴露
   * 2. 内部人员风险：DBA 可以看到所有用户的密码
   * 3. 法律合规要求：许多法规禁止存储明文密码
   *
   * 【如何安全存储密码？】
   * 使用 bcrypt 等单向哈希算法：
   * - 注册时：password = bcrypt.hash(用户输入的明文密码)
   * - 登录时：bcrypt.compare(用户输入的密码, 数据库中的哈希值)
   * - 特点：单向加密，无法解密，每次加密结果不同（因为随机盐）
   *
   * 【示例】
   * 明文密码：myPassword123
   * 存储到数据库：$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
   *
   * 【字段设计】
   * - 不加 unique：用户可以有相同的密码（这是允许的）
   * - 不加 nullable：密码是必填项
   * - 长度足够：存储 bcrypt 哈希值（60 字符）
   */
  @Column()
  password: string;

  /**
   * email - 邮箱地址
   *
   * 【为什么 unique: true？】
   * - 邮箱通常用于登录（用户名或邮箱登录）
   * - 防止一个邮箱注册多个账号
   * - 发送密码重置邮件时使用
   *
   * 【使用场景】
   * - 用户登录（email + password）
   * - 发送通知邮件
   * - 找回密码
   */
  @Column({ unique: true })
  email: string;

  /**
   * avatar - 头像 URL
   *
   * 【为什么有默认值？】
   * default: '' 表示如果用户没有上传头像，使用空字符串
   * - 头像是可选的，不是必填项
   * - 前端可以根据空字符串判断是否显示默认头像
   *
   * 【存储方式】
   * 通常存储头像图片的 URL（而不是图片本身）
   * - 例如："https://cdn.example.com/avatars/user123.jpg"
   * - 图片文件存储在云存储（如 AWS S3、阿里云 OSS）
   * - 数据库只存储 URL，减小数据库体积
   *
   * 【为什么不存图片二进制数据？】
   * - 图片通常较大（几KB到几MB）
   * - 会使数据库体积膨胀
   * - 查询性能下降
   * - 备份困难
   */
  @Column({ default: '' })
  avatar: string;

  /**
   * createdAt - 注册时间
   *
   * 【作用】
   * - 记录用户何时注册
   * - 统计用户增长趋势
   * - 计算用户注册天数
   *
   * 【自动填充】
   * @CreateDateColumn 会在插入数据时自动设置为当前时间
   * - 不需要手动设置
   * - 精确到毫秒
   * - 格式：2025-01-15 10:30:00.123
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * todos - 用户的所有 Todo（一对多关系）
   *
   * 【什么是一对多关系？】
   * 一个用户可以有多个 Todo
   * - User (1) ←→ (n) Todo
   * - 从用户的视角，可以访问他的所有 todos
   *
   * 【关系装饰器详解】
   * @OneToMany(() => Todo, (todo) => todo.user)
   * - 第一个参数 () => Todo：指向的实体类
   * - 第二个参数 (todo) => todo.user：Todo 实体中指向 User 的属性名
   *
   * 【如何使用？】
   * const user = await userRepository.findOne({ where: { id: 1 }, relations: ['todos'] });
   * console.log(user.todos);  // 输出该用户的所有 Todo 数组
   *
   * 【级联删除说明】
   * 注意：这里没有配置 onDelete: 'CASCADE'
   * - 删除用户时，不会自动删除 Todo
   * - 通常在 Todo 实体的 @ManyToOne 一侧配置级联
   * - 这样设计更灵活（可以保留 Todo，设置 userId 为 NULL）
   */
  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  /**
   * categories - 用户创建的所有分类（一对多关系）
   *
   * 【为什么需要分类？】
   * - 用户可以自定义分类来组织 Todo
   * - 每个用户有自己的分类集合
   * - 例如："工作"、"学习"、"生活"
   *
   * 【关系设计】
   * - 一个用户可以有多个分类
   * - 每个分类属于一个用户
   * - 删除用户时，通常也删除其分类
   *
   * 【使用示例】
   * const user = await userRepository.findOne({
   *   where: { id: 1 },
   *   relations: ['categories', 'todos']
   * });
   *
   * // 访问用户的分类
   * user.categories.forEach(category => {
   *   console.log(category.name);
   * });
   *
   * // 统计每个分类的 Todo 数量
   * user.categories.forEach(category => {
   *   const todoCount = user.todos.filter(t => t.categoryId === category.id).length;
   *   console.log(`${category.name}: ${todoCount} 个任务`);
   * });
   */
  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];
}

/**
 * 【前端 vs 后端 - 用户数据对比】
 *
 * 前端（TypeScript 接口）：
 * interface User {
 *   id: number;
 *   username: string;
 *   email: string;
 *   avatar?: string;  // 可选
 *   createdAt: string; // 字符串格式的日期
 * }
 *
 * 后端（TypeORM 实体）：
 * @Entity('users')
 * export class User {
 *   id: number;
 *   username: string;
 *   password: string;  // ⚠️ 后端有，前端没有（安全原因）
 *   email: string;
 *   avatar: string;     // 后端是必填（有默认值），前端是可选
 *   createdAt: Date;    // 后端是 Date 对象
 *   todos: Todo[];      // ⚠️ 后端有关系，前端通常不包含
 *   categories: Category[];  // ⚠️ 同上
 * }
 *
 * 【关键区别】
 * 1. 后端有 password 字段，前端返回用户信息时必须排除
 * 2. 后端有关系字段（todos, categories），前端通常不需要
 * 3. 前端的日期通常是字符串，后端是 Date 对象
 * 4. 后端的实体类映射到数据库表，前端的接口只是类型定义
 */
