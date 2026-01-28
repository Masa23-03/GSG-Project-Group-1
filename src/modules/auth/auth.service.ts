import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { verifyPassword } from './util/crypto.util';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole, OtpPurpose, OtpChannel } from '@prisma/client';
import { PharmacyService } from '../pharmacy/pharmacy.service';
import { DriverService } from '../driver/driver.service';
import { OtpService } from './otp/otp.service';
import { removeFields } from '../../utils/object.util';
import { generateRefreshToken, hashRefreshToken } from './util/refresh-token.util';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly pharmacyService: PharmacyService,
        private readonly driverService: DriverService,
        private readonly otpService: OtpService,
        private readonly prisma: DatabaseService,
    ) { }

    async registerPatient(dto: any) {
        const user = await this.userService.create(dto, UserRole.PATIENT);
        const { accessToken, refreshToken, stage } = await this.issueTokens(user.id);
        return {
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    async registerPharmacy(dto: any) {
        const { user, pharmacy } = await this.pharmacyService.create(
            dto,
            UserRole.PHARMACY,
        );
        return {
            user,
            pharmacy,
            message: 'Registered successfully. Your pharmacy is under review.',
        };
    }



    

    async registerDriver(dto: any) {
        const { user, driver } = await this.driverService.create(
            dto,
            UserRole.DRIVER,
        );
        return {
            user,
            driver,
            message: 'Registered successfully. Driver account is under review.',
        };
    }

    computeStage(user: any) {
        if (user.role === 'PATIENT' || user.role === 'ADMIN') return 'FULL';
        if (user.role === 'PHARMACY') {
            return user.pharmacy?.verificationStatus === 'VERIFIED' ? 'FULL' : 'LIMITED';
        }
        if (user.role === 'DRIVER') {
            return user.driver?.verificationStatus === 'VERIFIED' ? 'FULL' : 'LIMITED';
        }
        return 'LIMITED';
    }

    async issueTokens(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                pharmacy: { select: { verificationStatus: true } },
                driver: { select: { verificationStatus: true } },
            },
        });

        if (!user) throw new UnauthorizedException('Invalid session');

        const stage = this.computeStage(user);
        const payload = {
            sub: user.id,
            role: user.role,
            stage,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
        });

        const refreshToken = generateRefreshToken();
        const refreshHash = hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshHash,
                expiresAt,
            },
        });

        return { accessToken, refreshToken, stage };
    }

    async login(dto: any) {
        const email = this.userService.normalizeEmail(dto.email);
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                pharmacy: { select: { verificationStatus: true } },
                driver: { select: { verificationStatus: true } },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const ok = await verifyPassword(user.password, dto.password);
        if (!ok) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { accessToken, refreshToken, stage } = await this.issueTokens(user.id);
        const userWithoutPassword = removeFields(user, [
            'password',
            'pharmacy',
            'driver',
        ]);

        return {
            user: userWithoutPassword,
            refreshToken,
            accessToken,
        };
    }

    async refresh(dto: any) {
        const providedHash = hashRefreshToken(dto.refreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: providedHash },
            select: { id: true, userId: true, expiresAt: true, revokedAt: true },
        });

        if (!stored || stored.revokedAt) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (stored.expiresAt.getTime() < Date.now()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });

        return this.issueTokens(stored.userId);
    }




    async logout(dto: any) {
        const providedHash = hashRefreshToken(dto.refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { token: providedHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }





    async requestOtp(dto: any) {
        const destination =
            dto.channel === 'EMAIL'
                ? dto.destination.trim().toLowerCase()
                : dto.destination.trim();

        const user = await this.prisma.user.findFirst({
            where:
                dto.channel === 'EMAIL'
                    ? { email: destination }
                    : { phoneNumber: destination },
            select: { id: true, email: true, phoneNumber: true },
        });

        if (!user) {
            return { success: true, message: 'If the account exists, a code was sent.' };
        }

        await this.otpService.requestOtp({
            purpose: OtpPurpose.VERIFY,
            channel:
                dto.channel === 'EMAIL' ? OtpChannel.EMAIL : OtpChannel.PHONE,
            destination,
        });

        return {
            success: true,
            message: 'code was sent.',
        };
    }





    async verifyOtp(dto: any) {
        try {
            const destination =
                dto.channel === 'EMAIL'
                    ? dto.destination.trim().toLowerCase()
                    : dto.destination.trim();

            const { userId } = await this.otpService.verifyAndConsume({
                purpose: dto.purpose,
                channel: dto.channel,
                destination,
                code: dto.code,
            });

            const user = await this.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                select: {
                    id: true,
                    role: true,
                    status: true,
                    isEmailVerified: true,
                    isPhoneVerified: true,
                },
            });

            if (
                user.role !== 'PATIENT' &&
                !(user.isEmailVerified || user.isPhoneVerified)
            ) {
                throw new ForbiddenException('Verification required');
            }

            const { accessToken, refreshToken, stage } = await this.issueTokens(
                user.id,
            );

            return {
                accessToken,
                stage,
                message:
                    stage === 'FULL'
                        ? 'Verified.'
                        : 'Verified. Your account is under review. Profile access only.',
            };
        } catch (e) {
            console.log('OTP VERIFY ERROR:', e);
            throw e;
        }
    }



  
}

