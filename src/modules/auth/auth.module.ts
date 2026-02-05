import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/config/env';
import { OtpService } from './otp/otp.service';
import { UserModule } from '../user/user.module';
import { PharmacyModule } from '../pharmacy/pharmacy.module';
import { DriverModule } from '../driver/driver.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  imports: [
    UserModule,
    PharmacyModule,
    DriverModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        secret: env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
})
export class AuthModule {}
