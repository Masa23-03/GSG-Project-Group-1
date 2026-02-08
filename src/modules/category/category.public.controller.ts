import {
  Controller,
  Get,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @ApiOperation({ summary: 'List all categories' })
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }
  @ApiOperation({ summary: 'Get category details' })
   @Get(':id')
   findOne(@Param('id', ParseIntPipe) id: number) {
     return this.categoryService.findOne(id);
   }

}
