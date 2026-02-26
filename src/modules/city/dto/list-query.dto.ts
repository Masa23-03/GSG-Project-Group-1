import { ApiPropertyOptional } from '@nestjs/swagger';

export class CityListQueryDto {
  @ApiPropertyOptional({ enum: ['deliveryFee'] })
  include?: 'deliveryFee';
}
