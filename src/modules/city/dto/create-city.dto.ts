import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class CreateCityDto {
  @ApiProperty({
    example: 'Gaza',
    minLength: 2,
    description: 'City name (unique)',
  })
  name!: string;
}
export type CreateCityDtoType = InstanceType<typeof CreateCityDto>;
