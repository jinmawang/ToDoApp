/**
 * 认证模块
 *
 * 【模块的作用】
 * 模块（Module）是 NestJS 的组织单元，类似于前端的模块系统：
 * - 将相关的功能组织在一起（控制器、服务、实体等）
 * - 管理依赖关系（哪些模块需要导入，哪些服务需要导出）
 * - 实现依赖注入容器
 *
 * 【设计模式：模块化架构】
 * NestJS 采用模块化设计：
 * - 每个功能领域一个模块（AuthModule、TodoModule、CategoryModule）
 * - 模块之间通过 imports 和 exports 建立依赖关系
 * - 实现高内聚、低耦合
 *
 * 【后端开发思维：依赖管理】
 * 模块明确声明：
 * - imports：需要导入的其他模块（依赖）
 * - controllers：本模块提供的控制器
 * - providers：本模块提供的服务（可被注入）
 * - exports：导出的服务（其他模块可以使用）
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * AuthModule - 认证模块
 *
 * 【模块配置详解】
 */
@Module({
  imports: [
    // ConfigModule - 配置模块
    // 用于读取环境变量（.env 文件）
    // 例如：JWT_SECRET、JWT_EXPIRES_IN
    ConfigModule,

    // TypeOrmModule.forFeature([User])
    // 注册 User 实体，使 AuthService 可以注入 UserRepository
    // forFeature 是局部注册（只在当前模块可用）
    // 与 AppModule 中的 forRoot 不同（forRoot 是全局注册）
    TypeOrmModule.forFeature([User]),

    // PassportModule - Passport 认证模块
    // Passport 是一个 Node.js 认证中间件库
    // 支持多种认证策略（JWT、Local、OAuth 等）
    PassportModule,

    // JwtModule.registerAsync - 异步注册 JWT 模块
    // registerAsync 允许使用异步配置（从环境变量读取）
    // 使用 useFactory 模式：工厂函数返回配置对象
    JwtModule.registerAsync({
      imports: [ConfigModule], // 需要导入 ConfigModule 才能使用 ConfigService
      useFactory: async (configService: ConfigService) => ({
        // JWT 密钥：用于签名和验证 token
        // ⚠️ 生产环境必须使用强密钥，不要使用默认值
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: {
          // token 有效期：7 天
          // 格式：数字 + 单位（s=秒, m=分钟, h=小时, d=天）
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
      // inject：注入 ConfigService 到工厂函数
      inject: [ConfigService],
    }),
  ],
  // controllers：本模块提供的控制器
  controllers: [AuthController],

  // providers：本模块提供的服务
  // - AuthService：认证业务逻辑
  // - LocalStrategy：本地认证策略（用户名密码登录）
  // - JwtStrategy：JWT 认证策略（token 验证）
  providers: [AuthService, LocalStrategy, JwtStrategy],

  // exports：导出服务，供其他模块使用
  // 例如：TodoModule 可能需要 AuthService 来验证用户
  exports: [AuthService],
})
export class AuthModule {}
