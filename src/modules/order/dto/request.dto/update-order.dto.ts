import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export enum PharmacyOrderDecision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}
export enum PharmacyProgressStatus {
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
}
export class PharmacyOrderDecisionDto {
  @ApiProperty({
    enum: PharmacyOrderDecision,
    enumName: 'PharmacyOrderDecision',
    example: PharmacyOrderDecision.ACCEPT,
  })
  decision!: PharmacyOrderDecision;

  @ApiPropertyOptional({
    description: 'Required when decision is REJECT',
    nullable: true,
    example: null,
  })
  rejectionReason?: string | null;
}
export type PharmacyOrderDecisionDtoType = InstanceType<
  typeof PharmacyOrderDecisionDto
>;
export class UpdatePharmacyOrderStatusDto {
  @ApiProperty({
    enum: PharmacyProgressStatus,
    enumName: 'PharmacyProgressStatus',
    example: PharmacyProgressStatus.PREPARING,
  })
  status!: PharmacyProgressStatus;
}
export type UpdatePharmacyOrderStatusDtoType = InstanceType<
  typeof UpdatePharmacyOrderStatusDto
>;
