import { ApiProperty } from '@nestjs/swagger';
import { UpdateMyUserBaseDto } from 'src/modules/user/dto/request.dto/profile.dto';

export class UpdateMyDriverDto extends UpdateMyUserBaseDto {
  @ApiProperty({ required: false, nullable: true })
  vehiclePlate?: string | null;

  @ApiProperty({ required: false, nullable: true })
  vehicleName?: string | null;
}

export type UpdateMyDriverDtoType = InstanceType<typeof UpdateMyDriverDto>;
