import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath, } from '@nestjs/swagger';
import { AuthStage } from 'src/decorators/stage.decorator';
import { AuthUserDto, DriverAuthProfileDto, PharmacyAuthProfileDto } from './role.swagger.dto';
import { AuthTokensDto } from './token.swagger.dto';


@ApiExtraModels(PharmacyAuthProfileDto, DriverAuthProfileDto)
export class AuthResponseDto {
    @ApiProperty({ type: AuthUserDto })
    user!: AuthUserDto;

    @ApiProperty({ type: AuthTokensDto })
    tokens!: AuthTokensDto;

    @ApiProperty({
        enum: AuthStage,
        example: AuthStage.LIMITED,
        description:
            'FULL/LIMITED access stage used by FE to gate features and routes',
    })
    stage!: AuthStage;

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
    success!: boolean;
}


