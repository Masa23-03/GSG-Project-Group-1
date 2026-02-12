import { ApiProperty } from '@nestjs/swagger';

export enum DeliveryDecision {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}
export class DriverDeliveryDecisionDto {
  @ApiProperty({
    enum: DeliveryDecision,
    example: DeliveryDecision.ACCEPT,
    description: 'Driver decision for the delivery.',
  })
  decision!: DeliveryDecision;
}
export type driverDeliveryDecisionDtoType = InstanceType<
  typeof DriverDeliveryDecisionDto
>;
