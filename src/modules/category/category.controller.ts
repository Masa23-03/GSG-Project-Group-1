import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOperation } from '@nestjs/swagger';
import { IsPublic } from 'src/decorators/isPublic.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all categories' })
  @Get('admin')
  findAllAdmin() {
    return this.categoryService.findAll();
  }
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get category details' })
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
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
  findAll() {
    return this.categoryService.findAll();
  }
}
