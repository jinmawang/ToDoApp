/**
 * 注册数据传输对象（DTO）
 *
 * 【DTO vs Entity】
 * DTO 和 Entity 的区别：
 * - DTO：用于数据传输和验证（RegisterDto）
 * - Entity：用于数据库映射（User）
 *
 * 【为什么需要 DTO？】
 * 1. 验证输入：确保数据格式正确
 * 2. 隐藏敏感字段：DTO 不包含 password（加密后的）
 * 3. 字段映射：DTO 字段可能与 Entity 字段不同
 * 4. 版本控制：API 版本更新时，DTO 可以保持不变
 *
 * 【后端开发思维：数据验证层次】
 * 多层验证确保数据安全：
 * 1. 前端验证：提升用户体验（即时反馈）
 * 2. DTO 验证：确保数据格式正确（class-validator）
 * 3. 业务验证：确保业务规则正确（Service 层）
 * 4. 数据库约束：最后一道防线（唯一索引、非空约束等）
 */
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * RegisterDto - 注册数据传输对象
 *
 * 【字段说明】
 * - username: 用户名（唯一标识）
 * - email: 邮箱地址（用于登录，必须唯一）
 * - password: 密码（明文，后端会加密存储）
 *
 * 【验证规则】
 * - username: 不能为空
 * - email: 必须是有效的邮箱格式
 * - password: 不能为空，且长度至少 6 位
 *
 * 【安全考虑】
 * - 密码最小长度：6 位（可以根据需求调整）
 * - 建议添加：大小写字母、数字、特殊字符的验证
 * - 密码强度验证可以在前端或后端进行
 */
export class RegisterDto {
  /**
   * username - 用户名
   *
   * @IsNotEmpty({ message: '用户名不能为空' })
   * - 验证用户名不能为空
   * - 注意：这里不验证唯一性（唯一性在 Service 层验证）
   * - DTO 只负责格式验证，业务规则在 Service 层
   *
   * 【为什么不在 DTO 中验证唯一性？】
   * - DTO 验证是同步的、快速的（不涉及数据库查询）
   * - 唯一性验证需要查询数据库（异步操作）
   * - 应该在 Service 层进行数据库相关的验证
   */
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  /**
   * email - 邮箱地址
   *
   * @IsEmail({}, { message: '邮箱格式不正确' })
   * - 验证邮箱格式
   * - 唯一性验证在 Service 层进行
   *
   * 【邮箱的作用】
   * - 用于登录（替代用户名）
   * - 用于找回密码（发送重置链接）
   * - 用于接收通知邮件
   */
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  /**
   * password - 用户密码
   *
   * @IsNotEmpty({ message: '密码不能为空' })
   * @MinLength(6, { message: '密码长度不能少于6位' })
   * - 验证密码不能为空
   * - 验证密码长度至少 6 位
   *
   * 【密码安全建议】
   * 可以添加更多验证规则：
   * - @Matches(/[A-Z]/, { message: '密码必须包含大写字母' })
   * - @Matches(/[a-z]/, { message: '密码必须包含小写字母' })
   * - @Matches(/[0-9]/, { message: '密码必须包含数字' })
   * - @Matches(/[!@#$%^&*]/, { message: '密码必须包含特殊字符' })
   *
   * 【密码存储】
   * - 前端传来的密码是明文
   * - 后端使用 bcrypt 加密后存储
   * - 永远不存储明文密码
   */
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;
}
