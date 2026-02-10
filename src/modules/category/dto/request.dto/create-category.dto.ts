import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Painkillers',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional category description',
    example: 'Medicines used to relieve pain',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Public URL for category image',
    example: 'https://cdn.example.com/categories/painkillers.png',
    nullable: true,
  })
  categoryImageUrl?: string | null;
}
export type createCategoryDtoType = InstanceType<typeof CreateCategoryDto>;
