/**
 * 应用主控制器
 * 处理根路径的 HTTP 请求，提供基础的健康检查和问候接口
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController - 应用根控制器
 * 负责处理应用根路径（/）的请求
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * 获取问候信息，用于健康检查和基础 API 测试
   * @returns {string} 返回问候字符串
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
