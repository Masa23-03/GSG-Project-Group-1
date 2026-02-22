import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';
import { AdminBaseListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';

//Admin: get all drivers query
export class AdminDriverListQueryDto extends AdminBaseListQueryDto {
  @ApiProperty({ enum: AvailabilityStatus })
  availabilityStatus?: AvailabilityStatus;
}
export type AdminDriverListQueryDtoT = InstanceType<
  typeof AdminDriverListQueryDto
>;
