import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus, VerificationStatus } from '@prisma/client';
import { AdminBaseListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';

//Admin: get all drivers query
export class AdminDriverListQueryDto extends AdminBaseListQueryDto {
  @ApiProperty({ enum: AvailabilityStatus })
  availability?: AvailabilityStatus;
}
export type AdminDriverListQueryDtoT = InstanceType<
  typeof AdminDriverListQueryDto
>;
