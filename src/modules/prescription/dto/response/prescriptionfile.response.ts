import { ApiProperty } from '@nestjs/swagger';

export class PrescriptionFileDto {
  @ApiProperty({ example: 101 })
  id!: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../file.jpg' })
  url!: string;

  @ApiProperty({ example: '2026-02-03T10:15:30.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: 1, description: 'Ordering index (1..N).' })
  sortOrder!: number;
}
