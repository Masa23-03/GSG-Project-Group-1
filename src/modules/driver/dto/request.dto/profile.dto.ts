import { ApiProperty } from '@nestjs/swagger';
import { UpdateMyUserBaseDto } from 'src/modules/user/dto/request.dto/profile.dto';

export class UpdateMyDriverDto extends UpdateMyUserBaseDto {
  @ApiProperty({
    required: false,
    description:
      'Vehicle plate number (letters, numbers, dash and space only).',
    example: 'ABC-1234',
  })
  vehiclePlate?: string;

  @ApiProperty({
    required: false,
    description: 'Vehicle name or model.',
    example: 'Toyota Corolla',
  })
  vehicleName?: string;
}

export type UpdateMyDriverDtoType = InstanceType<typeof UpdateMyDriverDto>;
