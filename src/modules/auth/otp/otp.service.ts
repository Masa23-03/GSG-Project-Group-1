import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as crypto from 'crypto';
import { OtpChannel, OtpPurpose } from '@prisma/client';
import z from 'zod';
import { RequestOtpSchema, VerifyOtpSchema } from './otp.schema';

type RequestOtpDTO = z.infer<typeof RequestOtpSchema>;
type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;

function sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class OtpService {
    constructor(private readonly prisma: DatabaseService) { }

    async requestOtp(params: RequestOtpDTO) {
        const destination = params.channel === OtpChannel.EMAIL
            ? params.destination.trim().toLowerCase()
            : params.destination.trim();

        const last = await this.prisma.otp.findFirst({
            where: {
                userId: params['userId'],
                purpose: params.purpose,
                channel: params.channel,
                destination,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (last && Date.now() - last.createdAt.getTime() < 60_000) {
            throw new ForbiddenException('Please wait before requesting another code');
        }

        const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
        const salt = crypto.randomBytes(16).toString('hex');
        const codeHash = sha256(`${salt}:${code}`);

        await this.prisma.otp.create({
            data: {
                userId: params['userId'],
                purpose: params.purpose as unknown as OtpPurpose,
                channel: params.channel as unknown as OtpChannel,
                destination,
                codeHash: `${salt}:${codeHash}`,
                expiresAt: new Date(Date.now() + 10 * 60_000),
            },
        });

        console.log(`OTP CODE (${params.channel}) to ${destination} = ${code}`);
        return { sent: true };
    }

    async verifyAndConsume(params: VerifyOtpDTO) {
        try {
            const destination = params.channel === OtpChannel.EMAIL ? params.destination.trim().toLowerCase() : params.destination.trim();

            const otp = await this.prisma.otp.findFirst({
                where: {
                    purpose: params.purpose as unknown as OtpPurpose,
                    channel: params.channel as unknown as OtpChannel,
                    destination,
                    consumedAt: null,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { createdAt: 'desc' },
            });

            if (!otp) throw new BadRequestException('Invalid or expired code');

            if (otp.attempts >= 5) {
                throw new ForbiddenException('Too many attempts. Request a new code.');
            }

            const [salt, storedHash] = otp.codeHash.split(':');
            if (!salt || !storedHash) throw new BadRequestException('Invalid or expired code');

            const incomingHash = sha256(`${salt}:${params.code}`);
            const ok = crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(incomingHash, 'hex'));

            if (!ok) {
                await this.prisma.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
                throw new BadRequestException('Invalid or expired code');
            }

            await this.prisma.$transaction(async (tx) => {
                await tx.otp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

                if (params.purpose === 'VERIFY' && params.channel === 'EMAIL') {
                    await tx.user.update({ where: { id: otp.userId }, data: { isEmailVerified: true } });
                }

                if (params.purpose === 'VERIFY' && params.channel === 'PHONE') {
                    await tx.user.update({ where: { id: otp.userId }, data: { isPhoneVerified: true } });
                }
            });

            return { userId: otp.userId };
        } catch (e) {
            console.log('OTP VERIFY ERROR RAW:', e);
            if ((e as any)?.code) console.log('Prisma code:', (e as any).code);
            if ((e as any)?.meta) console.log('Prisma meta:', (e as any).meta);
            if ((e as any)?.message) console.log('Error message:', (e as any).message);
            throw e;
        }
    }
}
