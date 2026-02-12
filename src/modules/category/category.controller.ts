import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IsPublic } from 'src/decorators/isPublic.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateCategoryDto } from './dto/request.dto/update-category.dto';
import { CreateCategoryDto } from './dto/request.dto/create-category.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { PaginationQueryDto } from 'src/types/pagination.query';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import {
  createCategorySchema,
  updateCategorySchema,
} from './schema/category.schema';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: Create category' })
  @ApiBody({
    description: 'Create a new category',
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          example: 'Painkillers',
          minLength: 2,
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Medicines used to relieve pain',
        },
        categoryImageUrl: {
          type: 'string',
          nullable: true,
          example: 'https://cdn.example.com/categories/painkillers.png',
        },
      },
    },
  })
  @Post('admin')
  async create(
    @Body(new ZodValidationPipe(createCategorySchema))
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Admin: Update category' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @Roles(UserRole.ADMIN)
  @ApiBody({
    description: 'Update category fields',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Painkillers',
          minLength: 2,
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Updated description',
        },
        categoryImageUrl: {
          type: 'string',
          nullable: true,
          example: 'https://cdn.example.com/categories/new-image.png',
        },
      },
    },
  })
  @Patch('admin/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCategorySchema))
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @IsPublic()
  @ApiOperation({ summary: 'Get category details' })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @IsPublic()
  @ApiOperation({ summary: 'List all categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  findAll(
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQueryDto,
  ) {
    return this.categoryService.findAll(query);
  }
}
