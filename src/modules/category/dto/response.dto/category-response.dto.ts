import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique category identifier',
    example: 3,
  })
  id!: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Painkillers',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Public URL for category image',
    example: 'https://cdn.example.com/categories/painkillers.png',
    nullable: true,
  })
  categoryImageUrl?: string | null;
  @ApiPropertyOptional({
    description: 'Optional category description',
    example: 'Medicines used to relieve pain',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Category creation timestamp',
    example: '2026-02-09T12:30:45.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-02-10T08:15:12.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;
}
