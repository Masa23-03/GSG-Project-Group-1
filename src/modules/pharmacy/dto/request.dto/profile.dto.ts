import { ApiProperty } from '@nestjs/swagger';
import { UpdateMyUserBaseDto } from 'src/modules/user/dto/request.dto/profile.dto';
import { WorkingHoursDto } from '../response.dto/profile.dto';
import { PharmacyLocationDto } from '../response.dto/admin-pharmacy.response.dto';

export class UpdateMyPharmacyProfileDto extends UpdateMyUserBaseDto {
  @ApiProperty({ required: false })
  pharmacyName?: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: PharmacyLocationDto,
  })
  @ApiProperty({ required: false })
  address?: string | null;

  @ApiProperty({ required: false })
  latitude?: number | null;
  @ApiProperty({ required: false })
  longitude?: number | null;

  @ApiProperty({ required: false, nullable: true, type: WorkingHoursDto })
  workingHours?: WorkingHoursDto | null;
}

export type UpdateMyPharmacyProfileDtoType = InstanceType<
  typeof UpdateMyPharmacyProfileDto
>;
