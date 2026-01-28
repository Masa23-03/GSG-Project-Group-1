import { Injectable, ConflictException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../auth/util/crypto.util';
import { removeFields } from '../../utils/object.util';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: DatabaseService) { }

    async create(
        payload: any,
        role?: UserRole,
        status?: UserStatus,
        tx?: any,
    ) {
        const client = tx ?? this.prisma;
        await this.ensureEmailNotUsed(payload.email, tx);

        const email = this.normalizeEmail(payload.email);
        const hashedPassword = await hashPassword(payload.password);

        try {
            const user = await client.user.create({
                data: {
                    name: payload.name,
                    email: email,
                    phoneNumber: payload.phoneNumber,
                    password: hashedPassword,
                    role: role ?? UserRole.PATIENT,
                    status: status ?? UserStatus.ACTIVE,
                },
            });

            const userWithoutPassword = removeFields(user, ['password']);
            return userWithoutPassword;
        } catch (e) {
            throw e;
        }
    }

    normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    async ensureEmailNotUsed(email: string, tx?: any) {
        const client = tx ?? this.prisma;
        const existing = await client.user.findUnique({ where: { email } });

        if (existing) throw new ConflictException('Email already in use');
    }
}
