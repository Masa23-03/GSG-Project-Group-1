import { ApiProperty } from '@nestjs/swagger';
import { UpdateMyUserBaseDto } from 'src/modules/user/dto/request.dto/profile.dto';

export class UpdateMyDriverDto extends UpdateMyUserBaseDto {
  @ApiProperty({ required: false })
  vehiclePlate?: string;

  @ApiProperty({ required: false })
  vehicleName?: string;
}

export type UpdateMyDriverDtoType = InstanceType<typeof UpdateMyDriverDto>;
