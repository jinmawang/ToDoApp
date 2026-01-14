/**
 * 认证服务
 *
 * 作用：处理用户注册、登录、Token 生成等认证相关功能
 *
 * 主要功能：
 * 1. register - 用户注册
 * 2. login - 用户登录并生成 JWT token
 * 3. validateUser - 验证用户（供 JWT 策略使用）
 * 4. getProfile - 获取用户信息
 * 5. updateProfile - 更新用户信息
 */

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    // 注入 User 仓库，用于数据库操作
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // 注入 JWT 服务，用于生成和验证 token
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   *
   * 流程：
   * 1. 检查用户名是否已存在
   * 2. 检查邮箱是否已存在
   * 3. 使用 bcrypt 加密密码（加盐轮次为 10）
   * 4. 创建用户并保存到数据库
   * 5. 返回用户信息（不包含密码）
   *
   * @param registerDto 注册数据传输对象
   * @returns 用户信息（不含密码）
   */
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // 检查用户名是否已存在
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 加密密码
    // bcrypt 是一种单向哈希算法，安全性高
    // 10 是加盐轮次（cost factor），越高越安全但越慢
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // 返回用户信息（不包含密码）
    // 使用解构赋值排除密码字段
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * 用户登录
   *
   * 流程：
   * 1. 根据邮箱查找用户
   * 2. 使用 bcrypt 对比密码
   * 3. 生成 JWT token（包含用户 ID、邮箱、用户名）
   * 4. 返回用户信息和 token
   *
   * @param loginDto 登录数据传输对象
   * @returns 用户信息和访问令牌
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 根据邮箱查找用户
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // 用户不存在
    // 注意：不明确说明是用户不存在还是密码错误，防止暴力破解
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    // bcrypt.compare 会自动处理加盐和哈希比较
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 创建 JWT payload（载荷）
    // payload 是 token 中存储的数据
    const payload: JwtPayload = {
      sub: user.id,          // subject：用户 ID
      email: user.email,
      username: user.username,
    };

    // 生成 JWT token
    // token 有效期在 JwtModule 中配置（默认 7 天）
    const accessToken = await this.jwtService.signAsync(payload);

    // 返回用户信息和 token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  /**
   * 验证用户（供 JWT 策略使用）
   *
   * @param userId 用户 ID
   * @returns 用户对象或 null
   */
  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'avatar', 'createdAt'],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  /**
   * 获取用户资料
   *
   * @param userId 用户 ID
   * @returns 用户信息及其关联的 todos 和 categories
   */
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'avatar', 'createdAt'],
      // 加载关联数据
      relations: ['todos', 'categories'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户资料
   *
   * @param userId 用户 ID
   * @param updateData 要更新的数据（部分字段）
   * @returns 更新后的用户信息
   */
  async updateProfile(userId: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 如果要更新用户名，检查是否重复
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateData.username },
      });
      if (existingUsername) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果要更新邮箱，检查是否重复
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingEmail) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 如果要更新密码，需要加密
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // 更新用户数据
    Object.assign(user, updateData);
    const savedUser = await this.userRepository.save(user);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
