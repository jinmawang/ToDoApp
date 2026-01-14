/**
 * Category 控制器
 *
 * 【分类的作用】
 * 分类用于组织和管理 Todo：
 * - 用户可以创建自定义分类（如"工作"、"学习"、"生活"）
 * - Todo 可以关联到分类
 * - 便于按分类筛选和查看 Todo
 *
 * 【RESTful API 设计】
 * - POST /categories - 创建分类
 * - GET /categories - 获取所有分类
 * - GET /categories/:id - 获取单个分类（包含该分类下的所有 Todo）
 * - PATCH /categories/:id - 更新分类
 * - DELETE /categories/:id - 删除分类
 *
 * 【后端开发思维：资源管理】
 * 分类是独立的资源，有自己的 CRUD 操作：
 * - 可以独立创建、查询、更新、删除
 * - 与 Todo 是多对一关系（多个 Todo 属于一个分类）
 * - 删除分类时，关联的 Todo 的 categoryId 会设为 NULL（不删除 Todo）
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * CategoryController - 分类控制器
 *
 * 【类级别守卫】
 * 所有路由都需要 JWT 认证
 */
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * POST /categories - 创建分类
   *
   * 【分类字段】
   * - name: 分类名称（必填）
   * - color: 分类颜色（可选，默认蓝色）
   * - icon: 分类图标（可选）
   */
  @Post()
  create(@CurrentUser() user: User, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(user.id, createCategoryDto);
  }

  /**
   * GET /categories - 获取当前用户的所有分类
   *
   * 【返回内容】
   * 返回用户创建的所有分类列表
   * - 按创建时间倒序排列
   * - 不包含该分类下的 Todo（需要单独查询）
   */
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.categoryService.findAll(user.id);
  }

  /**
   * GET /categories/:id - 获取单个分类详情
   *
   * 【返回内容】
   * 返回分类信息及其关联的所有 Todo
   * - 分类基本信息（name、color、icon）
   * - 该分类下的所有 Todo（通过 relations 加载）
   */
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.categoryService.findOne(user.id, +id);
  }

  /**
   * PATCH /categories/:id - 更新分类
   *
   * 【可更新字段】
   * - name: 分类名称
   * - color: 分类颜色
   * - icon: 分类图标
   */
  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(user.id, +id, updateCategoryDto);
  }

  /**
   * DELETE /categories/:id - 删除分类
   *
   * 【删除行为】
   * - 删除分类本身
   * - 关联的 Todo 的 categoryId 会设为 NULL（不删除 Todo）
   * - 这是通过实体关系配置的（onDelete: 'SET NULL'）
   */
  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.categoryService.remove(user.id, +id);
  }
}
