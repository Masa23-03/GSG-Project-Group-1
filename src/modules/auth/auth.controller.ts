import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsPublic } from '../../decorators/isPublic.decorator';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

import { pharmacyValidationSchema } from './validation/pharmacy.validation.schema';
import { driverRegistrationValidationSchema } from './validation/auth.schema';
import { baseRegisterSchema } from './validation/patient.validation.schema';
import { LoginSchema } from './validation/login.validation.schema';
import { RefreshTokenSchema } from './validation/refresh.validation.schema';

import type {
  RegisterDriverDTO,
  RegisterPatientDTO,
  RegisterPharmacyDTO,
} from './dto/auth.register.dto';

import type { LogoutDto } from './dto/auth.logout.dto';
import {
  LoginRequestDto,
  LogoutRequestDto,
  RefreshTokenRequestDto,
  RegisterDriverRequestDto,
  RegisterPatientRequestDto,
  RegisterPharmacyRequestDto,
} from './swaggerDTOs/request.swagger.dto';
import {
  AuthResponseDto,
  LogoutResponseDto,
} from './swaggerDTOs/response.swagger.dto';

import type { LoginDTO } from './dto/auth.login.dto';
import type { RefreshTokenDTO } from './dto/refresh-token.dto';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { LogoutSchema } from './validation/logout.validation.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('register/patient')
  @ApiOperation({ summary: 'Register patient' })
  @ApiBody({ type: RegisterPatientRequestDto })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  registerPatient(
    @Body(new ZodValidationPipe(baseRegisterSchema)) dto: RegisterPatientDTO,
  ) {
    return this.authService.registerPatient(dto);
  }

  @IsPublic()
  @Post('register/pharmacy')
  @ApiOperation({ summary: 'Register pharmacy' })
  @ApiBody({ type: RegisterPharmacyRequestDto })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  registerPharmacy(
    @Body(new ZodValidationPipe(pharmacyValidationSchema))
    dto: RegisterPharmacyDTO,
  ) {
    return this.authService.registerPharmacy(dto);
  }

  @IsPublic()
  @Post('register/driver')
  @ApiOperation({ summary: 'Register driver' })
  @ApiBody({ type: RegisterDriverRequestDto })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  registerDriver(
    @Body(new ZodValidationPipe(driverRegistrationValidationSchema))
    dto: RegisterDriverDTO,
  ) {
    return this.authService.registerDriver(dto);
  }

  @IsPublic()
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @IsPublic()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenDTO,
  ) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiBody({ type: LogoutRequestDto })
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  @ApiBearerAuth('access-token')
  logout(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(LogoutSchema)) dto: LogoutDto,
  ) {
    return this.authService.logout(user.id, dto);
  }

  //     @IsPublic()
  //     @Post('otp/request')
  //     requestOtp(@Body(new ZodValidationPipe(RequestOtpSchema)) dto: RequestOtpDTO) {
  //         return this.authService.requestOtp(dto);
  //     }

  //     @IsPublic()
  //     @Post('otp/verify')
  //     verifyOtp(@Body(new ZodValidationPipe(VerifyOtpSchema)) dto: VerifyOtpDTO) {
  //         return this.authService.verifyOtp(dto);
  //     }
}
