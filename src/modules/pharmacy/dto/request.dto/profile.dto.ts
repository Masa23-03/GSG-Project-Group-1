import { ApiProperty } from '@nestjs/swagger';
import { UpdateMyUserBaseDto } from 'src/modules/user/dto/request.dto/profile.dto';
import { WorkingHoursDto } from '../response.dto/profile.dto';
import { PharmacyLocationDto } from '../response.dto/admin-pharmacy.response.dto';

export class UpdateMyPharmacyProfileDto extends UpdateMyUserBaseDto {
  @ApiProperty({ required: false, nullable: true })
  pharmacyName?: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: PharmacyLocationDto,
  })
  address?: PharmacyLocationDto | null;

  @ApiProperty({ required: false, nullable: true, type: WorkingHoursDto })
  workingHours?: WorkingHoursDto | null;
}

export type UpdateMyPharmacyProfileDtoType = InstanceType<
  typeof UpdateMyPharmacyProfileDto
>;
