/**
 * 应用服务
 * 提供应用级别的业务逻辑服务，主要用于健康检查和基础功能
 */
import { Injectable } from '@nestjs/common';

/**
 * AppService - 应用服务类
 * 使用 @Injectable 装饰器标记为可注入的服务提供者
 * 可以被控制器或其他服务通过依赖注入使用
 */
@Injectable()
export class AppService {
  /**
   * 获取问候信息
   * 用于应用健康检查和基础 API 测试
   * @returns {string} 返回问候字符串 "Hello World!"
   */
  getHello(): string {
    return 'Hello World!';
  }
}
