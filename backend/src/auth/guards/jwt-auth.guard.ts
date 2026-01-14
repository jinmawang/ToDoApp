/**
 * JWT 认证守卫
 *
 * 【守卫（Guard）的作用】
 * 守卫是 NestJS 的中间件，在路由处理器执行前运行，用于：
 * 1. 权限控制：检查用户是否有权限访问
 * 2. 认证验证：验证用户是否已登录
 * 3. 请求拦截：在请求到达控制器前进行拦截
 *
 * 【设计模式：装饰器模式 + 责任链模式】
 * - 装饰器模式：@UseGuards(JwtAuthGuard) 装饰路由
 * - 责任链模式：多个守卫可以串联执行
 *
 * 【执行顺序】
 * 请求 → 中间件 → 守卫 → 拦截器 → 管道 → 控制器 → 服务 → 响应
 *
 * 【后端开发思维：横切关注点】
 * 认证是横切关注点（Cross-Cutting Concern）：
 * - 多个路由都需要认证
 * - 不应该在每个控制器中重复写认证逻辑
 * - 通过守卫统一处理，实现关注点分离
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard - JWT 认证守卫
 *
 * 【继承关系】
 * extends AuthGuard('jwt')
 * - AuthGuard 是 Passport 的守卫基类
 * - 'jwt' 是策略名称，对应 JwtStrategy
 * - 继承后自动获得 JWT 验证能力
 *
 * 【工作原理】
 * 1. 从请求头提取 token（Authorization: Bearer <token>）
 * 2. 验证 token 的签名和有效期
 * 3. 解析 token 中的用户信息
 * 4. 调用 JwtStrategy.validate() 获取完整用户信息
 * 5. 将用户信息附加到 request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 【依赖注入】
   * constructor(private reflector: Reflector)
   * - Reflector：反射器，用于读取装饰器的元数据
   * - 可以检查路由或控制器上是否有 @Public() 装饰器
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate - 判断是否可以激活路由
   *
   * 【方法作用】
   * 在路由执行前调用，返回 true 则允许访问，false 则拒绝
   *
   * 【执行流程】
   * 1. 检查路由或控制器是否有 @Public() 装饰器
   * 2. 如果有 @Public()，跳过认证，直接返回 true
   * 3. 如果没有 @Public()，调用父类的 canActivate() 进行 JWT 验证
   *
   * 【为什么需要 @Public()？】
   * 默认情况下，所有路由都需要认证
   * 但登录、注册等路由不应该需要认证
   * 使用 @Public() 装饰器标记公开路由
   *
   * 【ExecutionContext】
   * 执行上下文，包含请求信息
   * - context.getHandler()：获取路由处理器（方法）
   * - context.getClass()：获取控制器类
   * - 可以在这两个地方查找装饰器元数据
   *
   * 【反射器的作用】
   * this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [...])
   * - 查找 IS_PUBLIC_KEY 元数据
   * - 先在方法上查找，再在类上查找
   * - 如果找到，返回 true（表示是公开路由）
   */
  canActivate(context: ExecutionContext) {
    // 检查是否有 @Public() 装饰器
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 先检查方法（路由处理器）
      context.getClass(), // 再检查类（控制器）
    ]);

    // 如果是公开路由，跳过认证
    if (isPublic) {
      return true;
    }

    // 否则，执行父类的 JWT 认证逻辑
    return super.canActivate(context);
  }
}
