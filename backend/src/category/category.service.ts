/**
 * Category 服务
 *
 * 【服务职责】
 * 处理分类相关的业务逻辑：
 * - 创建、查询、更新、删除分类
 * - 验证数据所有权（用户只能操作自己的分类）
 * - 处理分类与 Todo 的关联关系
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * CategoryService - 分类业务服务
 */
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * 创建分类
   *
   * 【流程】
   * 1. 创建分类实体（关联当前用户）
   * 2. 保存到数据库
   * 3. 返回创建的分类
   */
  async create(userId: number, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      userId, // 关联当前用户
    });
    return await this.categoryRepository.save(category);
  }

  /**
   * 查询所有分类
   *
   * 【排序】
   * order: { createdAt: 'DESC' }
   * - 按创建时间倒序排列
   * - 最新创建的在前
   */
  async findAll(userId: number): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { userId }, // 只查询当前用户的分类
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询单个分类
   *
   * 【关联数据】
   * relations: ['todos']
   * - 加载该分类下的所有 Todo
   * - 便于前端显示分类及其 Todo 列表
   */
  async findOne(userId: number, id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId }, // 安全验证：确保是当前用户的分类
      relations: ['todos'], // 加载关联的 Todo
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  /**
   * 更新分类
   *
   * 【更新流程】
   * 1. 先查询分类（验证存在和所有权）
   * 2. 更新分类数据
   * 3. 重新查询并返回（确保返回最新数据）
   *
   * 【为什么重新查询？】
   * 确保返回的数据包含：
   * - 更新后的字段值
   * - 关联数据（todos）
   * - 自动时间戳（updatedAt）
   */
  async update(userId: number, id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // 先验证分类是否存在且属于当前用户
    const category = await this.findOne(userId, id);

    // 更新分类数据
    await this.categoryRepository.update(id, updateCategoryDto);
    
    // 重新查询并返回（确保返回最新数据）
    return this.findOne(userId, id);
  }

  /**
   * 删除分类
   *
   * 【删除行为】
   * 1. 验证分类是否存在且属于当前用户
   * 2. 删除分类
   * 3. 关联的 Todo 的 categoryId 会自动设为 NULL（通过实体关系配置）
   *
   * 【级联行为】
   * 通过 Category 实体的 onDelete: 'SET NULL' 配置
   * - 删除分类时，不删除关联的 Todo
   * - 只将 Todo 的 categoryId 设为 NULL
   * - 保持数据完整性
   */
  async remove(userId: number, id: number): Promise<void> {
    // 先验证分类是否存在且属于当前用户
    const category = await this.findOne(userId, id);
    
    // 删除分类
    await this.categoryRepository.delete(id);
  }
}
