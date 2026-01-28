import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic } from '../../decorators/isPublic.decorator';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { pharmacyValidationSchema } from './validation/pharmacy.validation.schema';
import { driverRegistrationValidationSchema } from './validation/auth.schema';
import { baseRegisterSchema } from './validation/patient.validation.schema';
import { RequestOtpSchema, VerifyOtpSchema } from './otp/otp.schema';
import { LoginSchema } from './validation/login.validation.schema';
import { RefreshTokenSchema } from './validation/refresh.validation.schema';
import type { RegisterDriverDTO, RegisterPatientDTO, RegisterPharmacyDTO } from './dto/auth.register.dto';
import type { RequestOtpDTO, VerifyOtpDTO } from './dto/otp.dto';
import type { LoginDTO } from './dto/auth.login.dto';
import type { RefreshTokenDTO } from './dto/refresh-token.dto';
import type { LogoutDto } from './dto/auth.logout.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @IsPublic()
    @Post('register/patient')
    registerPatient(@Body(new ZodValidationPipe(baseRegisterSchema)) dto: RegisterPatientDTO) {
        return this.authService.registerPatient(dto);
    }


    @IsPublic()
    @Post('register/pharmacy')
    registerPharmacy(
        @Body(new ZodValidationPipe(pharmacyValidationSchema)) dto: RegisterPharmacyDTO,
    ) {
        return this.authService.registerPharmacy(dto);
    }


    @IsPublic()
    @Post('register/driver')
    registerDriver(@Body(new ZodValidationPipe(driverRegistrationValidationSchema)) dto: RegisterDriverDTO) {
        return this.authService.registerDriver(dto);
    }


    @IsPublic()
    @Post('otp/request')
    requestOtp(@Body(new ZodValidationPipe(RequestOtpSchema)) dto: RequestOtpDTO) {
        return this.authService.requestOtp(dto);
    }


    @IsPublic()
    @Post('otp/verify')
    verifyOtp(@Body(new ZodValidationPipe(VerifyOtpSchema)) dto: VerifyOtpDTO) {
        return this.authService.verifyOtp(dto);
    }


    @IsPublic()
    @Post('login')
    login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDTO) {
        return this.authService.login(dto);
    }


    @IsPublic()
    @Post('refresh')
    refresh(@Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenDTO) {
        return this.authService.refresh(dto);
    }


    @Post('logout')
    logout(@Body(new ZodValidationPipe(RefreshTokenSchema)) dto: LogoutDto) {
        return this.authService.logout(dto);
    }
}
