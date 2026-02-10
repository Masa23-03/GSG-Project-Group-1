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
