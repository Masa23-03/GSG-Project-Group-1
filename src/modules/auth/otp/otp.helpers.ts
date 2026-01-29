import * as crypto from 'crypto';
import { OtpChannel, OtpPurpose } from '@prisma/client';


export function sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

export function normalizeDestination(channel: OtpChannel, destination: string) {
    const trimmed = destination.trim();
    return channel === OtpChannel.EMAIL ? trimmed.toLowerCase() : trimmed;
}

export function generateOtpCode() {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashOtp(code: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = sha256(`${salt}:${code}`);
    return { salt, codeHash };
}