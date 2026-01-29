import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

import { DatabaseService } from '../database/database.service';
import { hashPassword } from '../auth/util/crypto.util';
import { removeFields } from '../../utils/object.util';
import { RegisterationDTO } from '../auth/dto/auth.register.dto';

import { UserMeResponseDto } from './dto/response.dto/profile.dto';
import { mapPatientAddress } from '../patient-address/util/mapper';
import { UpdateMyPatientDto } from './dto/request.dto/profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: DatabaseService) {}

  async create(
    payload: RegisterationDTO,
    role?: UserRole,
    status?: UserStatus,
    tx?: any,
  ) {
    const client = tx ?? this.prismaService;

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

  private async ensureEmailNotUsed(email: string, client?: any) {
    const db = client ?? this.prismaService;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');
  }

  private async ensurePhoneNotUsed(phoneNumber: string, client?: any) {
    const db = client ?? this.prismaService;

    const existing = await db.user.findFirst({ where: { phoneNumber } });
    if (existing) throw new ConflictException('Phone number already in use');
  }

  async findMyProfile(id: number): Promise<UserMeResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        dateOfBirth: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          where: {
            isDefault: true,
            isDeleted: false,
          },
          select: {
            id: true,
            label: true,
            addressLine1: true,
            addressLine2: true,
            area: true,
            region: true,
            latitude: true,
            longitude: true,
            cityId: true,
            city: { select: { name: true } },
          },
          take: 1,
        },
      },
    });

    if (!user) throw new NotFoundException();

    const defaultAddress = user.addresses[0];
    const mappedAddress = defaultAddress
      ? mapPatientAddress(defaultAddress)
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      defaultAddress: mappedAddress,
      role: user.role,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().slice(0, 10)
        : null,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateMyProfile(
    id: number,
    payload: UpdateMyPatientDto,
  ): Promise<UserMeResponseDto> {
    const foundedUser = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!foundedUser) throw new NotFoundException();

    const insertedData: any = { ...payload };

    if (payload.dateOfBirth !== undefined) {
      insertedData.dateOfBirth = payload.dateOfBirth
        ? new Date(`${payload.dateOfBirth}T00:00:00.000Z`)
        : null;
    }

    await this.prismaService.user.update({
      where: { id },
      data: insertedData,
    });

    return this.findMyProfile(id);
  }
}
