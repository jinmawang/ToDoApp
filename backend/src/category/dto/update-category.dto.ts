/**
 * 更新分类数据传输对象
 *
 * 【设计模式】
 * 使用 PartialType 继承 CreateCategoryDto
 * - 所有字段变为可选
 * - 支持部分更新
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * UpdateCategoryDto - 更新分类 DTO
 *
 * 【可更新字段】
 * - name?: string - 分类名称
 * - color?: string - 分类颜色
 * - icon?: string - 分类图标
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
