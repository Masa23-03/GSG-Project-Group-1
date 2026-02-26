import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class CityListItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Gaza' })
  name!: string;
}

export class CityDeliveryFeeResponseDto {
  @ApiProperty({ example: 20, minimum: 0 })
  standardFeeAmount!: number;

  @ApiProperty({ example: 10, minimum: 0, nullable: true })
  expressFeeAmount!: number | null;

  @ApiProperty({ enum: Currency, example: Currency.ILS })
  currency!: Currency;
}

export class CityWithFeeDto extends CityListItemDto {
  @ApiProperty({
    type: CityDeliveryFeeResponseDto,
    nullable: true,
    description: 'Delivery fee for the city',
  })
  cityDeliveryFee!: CityDeliveryFeeResponseDto | null;
}
