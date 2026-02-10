import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';

export class UpdateDriverAvailabilityDto {
  @ApiProperty({
    enum: AvailabilityStatus,
    example: AvailabilityStatus.ONLINE,
    required: true,
    description: 'Driver online/offline status for receiving deliveries.',
  })
  availabilityStatus!: AvailabilityStatus;
}
export type UpdateDriverAvailabilityDtoType = InstanceType<
  typeof UpdateDriverAvailabilityDto
>;
export class UpdateDriverAvailabilityResponseDto {
  @ApiProperty({ example: 12, description: 'Driver ID.' })
  driverId!: number;

  @ApiProperty({
    enum: AvailabilityStatus,
    example: AvailabilityStatus.ONLINE,
    description: 'Current availability status after update.',
  })
  availabilityStatus!: AvailabilityStatus;

  @ApiProperty({
    example: '2026-02-10T09:12:33.123Z',
    description: 'ISO timestamp of the last update.',
  })
  updatedAt!: string;
}
