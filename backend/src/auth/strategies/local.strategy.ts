/**
 * 本地认证策略（用户名密码登录）
 *
 * 【策略模式（Strategy Pattern）】
 * Passport 使用策略模式支持多种认证方式：
 * - LocalStrategy：用户名密码登录
 * - JwtStrategy：JWT token 认证
 * - OAuthStrategy：第三方登录（Google、GitHub 等）
 *
 * 【为什么需要策略模式？】
 * - 不同的认证方式有不同的验证逻辑
 * - 通过策略模式，可以灵活切换认证方式
 * - 每个策略独立实现，互不干扰
 *
 * 【LocalStrategy 的作用】
 * 处理传统的用户名密码登录：
 * 1. 接收邮箱和密码
 * 2. 从数据库查找用户
 * 3. 验证密码
 * 4. 返回用户信息（用于生成 JWT token）
 *
 * 【后端开发思维：认证流程】
 * 登录流程：
 * 1. 前端发送邮箱和密码 → POST /auth/login
 * 2. AuthController 接收请求 → 调用 AuthService.login()
 * 3. AuthService 可以调用 LocalStrategy.validate() 验证用户
 * 4. 验证通过后，生成 JWT token
 * 5. 返回 token 和用户信息
 *
 * 注意：当前代码中，登录逻辑直接在 AuthService 中实现，
 * LocalStrategy 可以用于其他场景（如 Passport 的本地认证守卫）
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * LocalStrategy - 本地认证策略
 *
 * 【继承关系】
 * extends PassportStrategy(Strategy)
 * - PassportStrategy 是 NestJS 对 Passport 策略的封装
 * - Strategy 是 passport-local 提供的本地策略类
 * - 继承后需要实现 validate() 方法
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * 【依赖注入】
   * @InjectRepository(User) - 注入 User 仓库
   * - Repository 是 TypeORM 的数据访问层
   * - 用于执行数据库查询（findOne、save 等）
   */
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // 调用父类构造函数，配置策略
    super({
      // usernameField: 'email' - 使用邮箱作为用户名字段
      // Passport Local 策略默认使用 'username' 字段
      // 这里改为 'email'，因为我们的登录使用邮箱
      usernameField: 'email',
      passwordField: 'password', // 密码字段（默认就是 'password'）
    });
  }

  /**
   * validate - 验证用户（Passport 自动调用）
   *
   * 【方法签名】
   * async validate(email: string, password: string): Promise<User>
   * - Passport 会自动从请求体中提取 email 和 password
   * - 调用此方法进行验证
   * - 返回 User 对象（会被附加到 request.user）
   *
   * 【验证流程】
   * 1. 根据邮箱查找用户
   * 2. 如果用户不存在，抛出异常
   * 3. 使用 bcrypt 比较密码
   * 4. 如果密码错误，抛出异常
   * 5. 返回用户信息（不包含密码）
   *
   * 【安全考虑】
   * - 不明确说明是邮箱错误还是密码错误
   * - 防止暴力破解（攻击者无法知道哪个字段错误）
   * - 返回的用户对象不包含密码字段
   *
   * 【bcrypt.compare() 的工作原理】
   * bcrypt.compare(明文密码, 哈希值)
   * - 自动提取哈希值中的盐（salt）
   * - 使用相同的盐对明文密码进行哈希
   * - 比较两个哈希值是否相同
   * - 即使相同的密码，每次加密结果不同（因为盐不同）
   */
  async validate(email: string, password: string): Promise<User> {
    // 根据邮箱查找用户
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // 用户不存在
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    // bcrypt.compare 会自动处理加盐和哈希比较
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 返回用户信息（不包含密码）
    // 使用解构赋值排除密码字段
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
