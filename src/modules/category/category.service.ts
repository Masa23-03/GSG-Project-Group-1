import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateCategoryDto } from './dto/request.dto/create-category.dto';
import { UpdateCategoryDto } from './dto/request.dto/update-category.dto';
import { CategoryResponseDto } from './dto/response.dto/category-response.dto';
import { ApiSuccessResponse } from 'src/types/unifiedType.types';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    const createdCategory = await this.prisma.category.create({
      data: createCategoryDto,
    });
    return {
      success: true,
      data: createdCategory,
    };
  }

  async findAll(): Promise<ApiSuccessResponse<CategoryResponseDto[]>> {
    return {
      success: true,
      data: await this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
    };
  }

  async findOne(id: number): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return {
      success: true,
      data: category!,
    };
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
    return {
      success: true,
      data: updatedCategory,
    };
  }
}
