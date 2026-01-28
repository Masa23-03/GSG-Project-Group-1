import { Injectable, ConflictException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../auth/util/crypto.util';
import { removeFields } from '../../utils/object.util';
import { DatabaseService } from '../database/database.service';
import { RegisterationDTO } from '../auth/dto/auth.register.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(
    payload: RegisterationDTO,
    role?: UserRole,
    status?: UserStatus,
    tx?: any,
  ) {
    const client = tx ?? this.prisma;

    const email = this.normalizeEmail(payload.email);
    const phoneNumber = payload.phoneNumber.trim();

    await this.ensureEmailNotUsed(email, client);
    await this.ensurePhoneNotUsed(phoneNumber, client);

    const hashedPassword = await hashPassword(payload.password);

    const user = await client.user.create({
      data: {
        name: payload.name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: role ?? UserRole.PATIENT,
        status: status ?? UserStatus.ACTIVE,
      },
    });

    return removeFields(user, ['password']);
  }

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async ensureEmailNotUsed(email: string, client?: any) {
    const db = client ?? this.prisma;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');
  }

  async ensurePhoneNotUsed(phoneNumber: string, client?: any) {
    const db = client ?? this.prisma;

    const existing = await db.user.findFirst({
      where: { phoneNumber },
    });

    if (existing) throw new ConflictException('Phone number already in use');
  }
}
