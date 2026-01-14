/**
 * 当前用户装饰器
 *
 * 【自定义装饰器的作用】
 * 装饰器是 TypeScript 和 NestJS 的强大特性，用于：
 * 1. 简化代码：避免重复写 request.user
 * 2. 类型安全：TypeScript 知道返回类型是 User
 * 3. 可复用：多个控制器都可以使用
 *
 * 【设计模式：装饰器模式】
 * 装饰器模式允许在不修改原有代码的情况下扩展功能
 * - @CurrentUser() 装饰器提取用户信息
 * - 比手动写 request.user 更简洁、更安全
 *
 * 【使用示例】
 * // 不使用装饰器（繁琐）
 * @Get('profile')
 * getProfile(@Req() request: Request) {
 *   const user = request.user as User;
 *   return this.service.getProfile(user.id);
 * }
 *
 * // 使用装饰器（简洁）
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return this.service.getProfile(user.id);
 * }
 *
 * 【后端开发思维：代码复用】
 * 将常用的操作封装成装饰器：
 * - @CurrentUser() - 获取当前用户
 * - @Public() - 标记公开路由
 * - @Roles('admin') - 角色权限检查（可以扩展）
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

/**
 * CurrentUser - 当前用户参数装饰器
 *
 * 【createParamDecorator】
 * NestJS 提供的函数，用于创建自定义参数装饰器
 * - 第一个参数：工厂函数，返回要注入的值
 * - 工厂函数接收两个参数：
 *   - data: 装饰器传入的参数（可选）
 *   - ctx: 执行上下文
 *
 * 【使用方式】
 * 1. 获取整个用户对象：
 *    @CurrentUser() user: User
 *
 * 2. 只获取用户 ID：
 *    @CurrentUser('id') userId: number
 *
 * 3. 只获取用户名：
 *    @CurrentUser('username') username: string
 *
 * 【工作原理】
 * 1. JwtAuthGuard 验证 token 后，将用户信息附加到 request.user
 * 2. @CurrentUser() 装饰器从 request.user 中提取用户信息
 * 3. NestJS 自动将提取的值注入到参数中
 *
 * 【类型安全】
 * - 返回类型是 User | any
 * - 如果传入 data 参数，返回对应的字段值
 * - TypeScript 会根据使用方式推断类型
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    // 从执行上下文中获取 HTTP 请求对象
    const request = ctx.switchToHttp().getRequest();
    
    // 从请求对象中获取用户信息（由 JwtAuthGuard 附加）
    const user = request.user as User;

    // 如果传入了字段名，只返回该字段的值
    // 否则返回整个用户对象
    return data ? user?.[data] : user;
  },
);
