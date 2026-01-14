/**
 * JWT 认证策略
 *
 * 作用：验证 JWT token 的有效性，并提取用户信息
 *
 * 工作流程：
 * 1. 用户登录成功后，后端返回一个 JWT token
 * 2. 后续请求都会在请求头中携带这个 token（Authorization: Bearer <token>）
 * 3. JwtStrategy 自动从请求头中提取 token
 * 4. 验证 token 的签名和有效期
 * 5. 解析 token 中的用户信息（用户 ID）
 * 6. 从数据库中查询完整的用户信息
 * 7. 将用户信息附加到请求对象上，供后续使用
 *
 * 使用场景：
 * - 保护需要登录才能访问的路由
 * - 在控制器中通过 @Req() request 或装饰器获取当前用户
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // 注入 User 仓库，用于查询用户信息
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // 注入配置服务，用于获取 JWT 密钥
    private configService: ConfigService,
  ) {
    // 调用父类构造函数，配置 JWT 策略
    super({
      // 从请求头的 Authorization 字段中提取 token
      // 格式：Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 不忽略过期的 token（token 过期则返回 401）
      ignoreExpiration: false,

      // 用于验证 token 签名的密钥（必须与登录时使用的密钥一致）
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  /**
   * 验证方法 - Passport 自动调用
   *
   * @param payload JWT token 解码后的载荷数据
   *   - sub: 用户 ID (subject 的缩写)
   *   - email: 用户邮箱
   *   - username: 用户名
   * @returns 用户对象（会被附加到 request.user 上）
   * @throws UnauthorizedException 如果用户不存在
   */
  async validate(payload: JwtPayload): Promise<User> {
    // 从 payload 中解构出用户 ID
    const { sub: id } = payload;

    // 从数据库中查询用户信息
    // select: 只选择需要的字段，不返回敏感信息（如密码）
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'avatar', 'createdAt'],
    });

    // 如果用户不存在，抛出未授权异常
    // 这可能发生在：
    // 1. 用户已被删除
    // 2. token 被篡改
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回用户对象
    // NestJS 会自动将这个用户对象附加到 request.user
    // 在控制器中可以通过 @Req() request 或 @CurrentUser() 装饰器获取
    return user;
  }
}
