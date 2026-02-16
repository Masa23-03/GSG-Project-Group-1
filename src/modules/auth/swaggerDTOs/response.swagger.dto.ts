import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  AuthUserDto,
  DriverAuthProfileDto,
  PharmacyAuthProfileDto,
} from './role.swagger.dto';
import { AuthTokensDto } from './token.swagger.dto';

@ApiExtraModels(PharmacyAuthProfileDto, DriverAuthProfileDto)
export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;

  @ApiPropertyOptional({
    description: 'Role specific profile (present for PHARMACY/DRIVER)',
    oneOf: [
      { $ref: getSchemaPath(PharmacyAuthProfileDto) },
      { $ref: getSchemaPath(DriverAuthProfileDto) },
    ],
  })
  profile?: PharmacyAuthProfileDto | DriverAuthProfileDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  revoked!: boolean;
}
