import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateCategoryDto } from './dto/request.dto/create-category.dto';
import { UpdateCategoryDto } from './dto/request.dto/update-category.dto';
import { CategoryResponseDto } from './dto/response.dto/category-response.dto';
import {
  ApiSuccessResponse,
  ApiPaginationSuccessResponse,
} from 'src/types/unifiedType.types';
import { PaginationQueryDto } from 'src/types/pagination.query';
import { removeFields } from 'src/utils/object.util';

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

  async findAll(
    query: PaginationQueryDto,
  ): Promise<ApiPaginationSuccessResponse<CategoryResponseDto>> {
    const pagination = await this.prisma.handleQueryPagination(query);

    const [total, categories] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.findMany({
        ...removeFields(pagination, ['page']),
        orderBy: { name: 'asc' },
      }),
    ]);
    return {
      success: true,
      data: categories,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
    return updatedCategory;
  }
}
