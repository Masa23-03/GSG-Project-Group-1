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
import { ApiOperation } from '@nestjs/swagger';
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

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all categories' })
  @Get('admin')
  findAllAdmin(@Query(new ZodValidationPipe(PaginationQuerySchema)) query: PaginationQueryDto) {
    return this.categoryService.findAll(query);
  }
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get category details' })
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Create category' })
  @Post('admin')
  async create(
    @Body(new ZodValidationPipe(createCategorySchema))
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Admin: Update category' })
  @Roles(UserRole.ADMIN)
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
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @IsPublic()
  @ApiOperation({ summary: 'List all categories' })
  @Get()
  findAll(@Query(new ZodValidationPipe(PaginationQuerySchema)) query: PaginationQueryDto) {
    return this.categoryService.findAll(query);
  }
}
