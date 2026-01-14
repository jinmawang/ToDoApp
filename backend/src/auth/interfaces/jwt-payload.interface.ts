/**
 * JWT Payload 接口
 *
 * 【JWT Token 的结构】
 * JWT 由三部分组成，用点（.）分隔：
 * 1. Header（头部）：算法和类型
 * 2. Payload（载荷）：存储的数据（本接口定义的内容）
 * 3. Signature（签名）：用于验证 token 的完整性
 *
 * 【示例 Token】
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoi...signature
 * └───────── Header ─────────┘ └─────── Payload ───────┘ └─ Signature ─┘
 *
 * 【Payload 的作用】
 * Payload 是 token 中存储的数据，包含：
 * - sub（subject）：用户 ID，JWT 标准字段
 * - email：用户邮箱
 * - username：用户名
 *
 * 【为什么需要这些字段？】
 * - sub：用于从数据库查询用户信息
 * - email、username：可以用于显示，减少数据库查询
 *
 * 【安全提示】
 * - Payload 是 Base64 编码的，不是加密的
 * - 任何人都可以解码查看内容
 * - 不要存储敏感信息（如密码）
 * - 不要存储过多数据（token 会变大）
 *
 * 【后端开发思维：接口定义】
 * 使用 TypeScript 接口定义数据结构：
 * - 提供类型检查
 * - 作为文档说明
 * - 便于重构和维护
 */
export interface JwtPayload {
  /**
   * sub - Subject（主题）
   *
   * 【JWT 标准字段】
   * sub 是 JWT 规范中定义的标准字段，表示 token 的主题（通常是用户 ID）
   *
   * 【为什么用 sub 而不是 userId？】
   * - 遵循 JWT 标准（RFC 7519）
   * - 与其他系统兼容
   * - 语义清晰（subject = 主题 = 用户）
   *
   * 【类型说明】
   * number：用户 ID 是数字类型（自增主键）
   */
  sub: number;

  /**
   * email - 用户邮箱
   *
   * 【作用】
   * - 可以用于显示（如："欢迎，user@example.com"）
   * - 可以用于日志记录
   * - 减少数据库查询（不需要查用户表就能知道邮箱）
   *
   * 【权衡】
   * 优点：减少数据库查询
   * 缺点：如果用户修改邮箱，需要重新登录（token 中的邮箱会过期）
   */
  email: string;

  /**
   * username - 用户名
   *
   * 【作用】
   * - 可以用于显示（如："欢迎，张三"）
   * - 可以用于日志记录
   * - 减少数据库查询
   *
   * 【权衡】
   * 同上，如果用户修改用户名，需要重新登录
   */
  username: string;
}
