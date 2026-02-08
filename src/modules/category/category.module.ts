import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.public.controller';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
