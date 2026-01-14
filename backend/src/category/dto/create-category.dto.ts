/**
 * 创建分类数据传输对象
 *
 * 【字段说明】
 * - name: 分类名称（必填）
 * - color: 分类颜色（可选，默认蓝色）
 * - icon: 分类图标（可选，默认空）
 */
import { IsString, IsOptional } from 'class-validator';

/**
 * CreateCategoryDto - 创建分类 DTO
 */
export class CreateCategoryDto {
  /**
   * name - 分类名称
   *
   * 【必填字段】
   * - 用户自定义的分类名称
   * - 例如："工作"、"学习"、"生活"
   */
  @IsString()
  name: string;

  /**
   * color - 分类颜色
   *
   * 【可选字段】
   * - 如果未提供，使用默认值（#3B82F6）
   * - 格式：十六进制颜色码（#3B82F6）
   */
  @IsString()
  @IsOptional()
  color?: string;

  /**
   * icon - 分类图标
   *
   * 【可选字段】
   * - 如果未提供，使用默认值（空字符串）
   * - 可以是图标名称或图标 URL
   */
  @IsString()
  @IsOptional()
  icon?: string;
}
