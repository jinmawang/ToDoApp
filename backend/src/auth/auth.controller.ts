/**
 * 认证控制器
 *
 * 【控制器的作用】
 * 控制器（Controller）是 NestJS 的分层架构中的第一层，负责：
 * 1. 接收 HTTP 请求（GET、POST、PATCH 等）
 * 2. 调用服务层处理业务逻辑
 * 3. 返回 HTTP 响应
 *
 * 【设计模式：MVC 架构】
 * - Model（模型）：实体类（User、Todo 等）
 * - View（视图）：JSON 响应（NestJS 自动序列化）
 * - Controller（控制器）：本文件，处理路由和请求
 *
 * 【后端开发思维：关注点分离】
 * Controller 只负责：
 * - 路由定义（@Post、@Get 等）
 * - 参数提取（@Body、@Param、@Query）
 * - 调用 Service 层
 * - 返回响应
 *
 * Controller 不负责：
 * - 业务逻辑（交给 Service）
 * - 数据库操作（交给 Repository）
 * - 数据验证（交给 DTO 和 class-validator）
 *
 * 【路由设计】
 * @Controller('auth') 表示所有路由都以 /auth 为前缀
 * - POST /auth/register - 用户注册
 * - POST /auth/login - 用户登录
 * - GET /auth/profile - 获取用户资料（需要认证）
 * - PATCH /auth/profile - 更新用户资料（需要认证）
 */
import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { User } from '../user/entities/user.entity';

/**
 * AuthController - 认证控制器
 *
 * 【依赖注入模式】
 * constructor(private readonly authService: AuthService)
 * - NestJS 会自动创建 AuthService 实例并注入
 * - private readonly：私有属性，只读，只能通过构造函数赋值
 * - 这是 TypeScript 的语法糖，等价于：
 *   private authService: AuthService;
 *   constructor(authService: AuthService) {
 *     this.authService = authService;
 *   }
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register - 用户注册
   *
   * 【路由装饰器】
   * @Public() - 自定义装饰器，标记此路由为公开访问（不需要 JWT 认证）
   * @Post('register') - 处理 POST /auth/register 请求
   *
   * 【参数装饰器】
   * @Body() registerDto: RegisterDto
   * - @Body() 从请求体中提取 JSON 数据
   * - registerDto 会自动进行数据验证（通过 class-validator）
   * - 如果验证失败，NestJS 自动返回 400 Bad Request
   *
   * 【数据流】
   * 1. 前端发送 POST /auth/register，请求体：{ username, email, password }
   * 2. NestJS 自动验证数据（DTO 中的 @IsEmail、@MinLength 等）
   * 3. 验证通过后，调用 authService.register(registerDto)
   * 4. Service 层处理业务逻辑（检查重复、加密密码、保存到数据库）
   * 5. 返回用户信息（不包含密码）
   *
   * 【为什么返回不包含密码？】
   * 安全考虑：即使密码已加密，也不应该返回给前端
   */
  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login - 用户登录
   *
   * 【登录流程】
   * 1. 前端发送邮箱和密码
   * 2. 后端验证邮箱和密码
   * 3. 如果正确，生成 JWT token
   * 4. 返回用户信息和 token
   * 5. 前端保存 token，后续请求在请求头中携带
   *
   * 【JWT Token 的作用】
   * - 无状态认证：服务器不需要存储 session
   * - 跨域支持：可以在不同域名下使用
   * - 包含用户信息：token 中编码了用户 ID、邮箱等
   *
   * 【安全提示】
   * - 登录失败时，不明确说明是邮箱错误还是密码错误
   * - 防止暴力破解（攻击者无法知道哪个字段错误）
   */
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile - 获取当前用户资料
   *
   * 【认证保护】
   * @UseGuards(JwtAuthGuard) - 使用 JWT 认证守卫
   * - 只有携带有效 JWT token 的请求才能访问
   * - 如果 token 无效或过期，自动返回 401 Unauthorized
   *
   * 【自定义装饰器】
   * @CurrentUser() user: User
   * - 自定义参数装饰器，从 request.user 中提取当前用户
   * - JwtAuthGuard 验证 token 后，会将用户信息附加到 request.user
   * - 这样就不需要手动从 request 中提取用户信息
   *
   * 【设计优势】
   * - 代码简洁：不需要写 request.user
   * - 类型安全：TypeScript 知道 user 的类型是 User
   * - 可复用：其他控制器也可以使用 @CurrentUser()
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  /**
   * PATCH /auth/profile - 更新当前用户资料
   *
   * 【HTTP 方法选择】
   * PATCH vs PUT：
   * - PATCH：部分更新（只更新提供的字段）
   * - PUT：完整替换（需要提供所有字段）
   * 这里使用 PATCH，因为用户可能只想更新头像或用户名
   *
   * 【Partial<User> 类型】
   * TypeScript 工具类型，使所有字段变为可选
   * - User: { id: number, username: string, email: string, ... }
   * - Partial<User>: { id?: number, username?: string, email?: string, ... }
   *
   * 【安全考虑】
   * - 只能更新自己的资料（通过 @CurrentUser() 获取当前用户）
   * - 不能修改其他用户的资料
   * - 如果更新用户名或邮箱，需要检查是否重复
   */
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() updateData: Partial<User>) {
    return this.authService.updateProfile(user.id, updateData);
  }
}
