/**
 * 公开路由装饰器
 *
 * 【作用】
 * 标记路由为公开访问，跳过 JWT 认证
 *
 * 【使用场景】
 * 某些路由不需要认证就可以访问：
 * - POST /auth/register - 用户注册
 * - POST /auth/login - 用户登录
 * - GET /health - 健康检查
 *
 * 【工作原理】
 * 1. @Public() 装饰器在路由上设置元数据（metadata）
 * 2. JwtAuthGuard 通过反射器读取元数据
 * 3. 如果发现 @Public()，跳过认证检查
 *
 * 【设计模式：元数据编程】
 * 使用元数据（metadata）存储装饰器信息：
 * - SetMetadata('isPublic', true) 设置元数据
 * - Reflector 读取元数据
 * - 实现装饰器与守卫的通信
 *
 * 【后端开发思维：声明式编程】
 * 使用装饰器声明路由的访问权限：
 * - @Public() - 公开访问
 * - @UseGuards(JwtAuthGuard) - 需要认证（默认）
 * - @Roles('admin') - 需要管理员权限（可以扩展）
 *
 * 这种方式比命令式编程（在每个方法中写 if 判断）更清晰
 */
import { SetMetadata } from '@nestjs/common';

/**
 * IS_PUBLIC_KEY - 元数据键
 *
 * 【为什么需要常量？】
 * 使用常量而不是字符串字面量：
 * - 避免拼写错误（TypeScript 会检查）
 * - 便于重构（修改一处即可）
 * - 提高可维护性
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public - 公开路由装饰器
 *
 * 【SetMetadata】
 * NestJS 提供的函数，用于设置元数据
 * - 第一个参数：元数据的键（key）
 * - 第二个参数：元数据的值（value）
 *
 * 【使用方式】
 * @Public()
 * @Post('register')
 * register() { ... }
 *
 * 【装饰器链】
 * 可以同时使用多个装饰器：
 * @Public()           // 跳过认证
 * @UseGuards(RateLimitGuard)  // 但需要限流
 * @Post('register')
 * register() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
