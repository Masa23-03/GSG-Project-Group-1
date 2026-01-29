import { OtpChannel, OtpPurpose } from '@prisma/client';

export type RequestOtpDTO = {
    // userId: number;
    purpose: OtpPurpose;
    channel: OtpChannel;
    destination: string;
};

export type VerifyOtpDTO = {
    purpose: OtpPurpose;
    channel: OtpChannel;
    destination: string;
    code: string;
};