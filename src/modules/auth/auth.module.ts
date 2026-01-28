import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/config/env';
import { OtpService } from './otp/otp.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        secret: env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
})
export class AuthModule {}
