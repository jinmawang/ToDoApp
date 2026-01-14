/**
 * 应用入口文件
 * 这是 NestJS 应用的启动入口，负责：
 * 1. 创建 NestJS 应用实例
 * 2. 配置跨域（CORS）
 * 3. 启动 HTTP 服务器监听指定端口
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * 启动应用
 * 异步函数，用于初始化并启动 NestJS 应用
 */
async function bootstrap() {
  // 创建 NestJS 应用实例，使用 AppModule 作为根模块
  const app = await NestFactory.create(AppModule);

  // 启用跨域资源共享（CORS），允许前端应用访问 API
  app.enableCors();

  // 启动 HTTP 服务器
  // 监听环境变量 PORT 指定的端口，如果未设置则默认使用 3000 端口
  await app.listen(process.env.PORT ?? 3000);
}

// 调用启动函数，启动应用
void bootstrap();
