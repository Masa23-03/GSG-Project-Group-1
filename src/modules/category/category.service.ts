import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/response.dto/category-response.dto';
import { ApiSuccessResponse } from 'src/types/unifiedType.types';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: DatabaseService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
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

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
