import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export enum PharmacyOrderDecision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class PharmacyOrderDecisionDto {
  @ApiProperty({ enum: PharmacyOrderDecision })
  decision!: PharmacyOrderDecision;

  @ApiPropertyOptional({
    description: 'Required when decision is REJECT',
    nullable: true,
  })
  rejectionReason?: string | null;
}
