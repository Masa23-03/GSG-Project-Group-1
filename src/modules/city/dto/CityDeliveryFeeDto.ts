import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class UpsertCityDeliveryFeeDto {
  @ApiProperty({
    example: 20,
    minimum: 0,
    description: 'Standard delivery fee amount',
  })
  standardFeeAmount!: string;

  @ApiPropertyOptional({ example: 10, minimum: 0, nullable: true })
  expressFeeAmount?: string | null;

  @ApiPropertyOptional({
    enum: Currency,
    example: Currency.ILS,
    default: Currency.ILS,
  })
  currency?: Currency;
}
export type UpsertCityDeliveryFeeDtoType = InstanceType<
  typeof UpsertCityDeliveryFeeDto
>;
