import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { hashPassword } from '../auth/util/crypto.util';
import { removeFields } from '../../utils/object.util';
import { RegisterationDTO } from '../auth/dto/auth.register.dto';
import { UserMeResponseDto } from './dto/response.dto/profile.dto';
import { mapPatientAddress } from '../patient-address/util/mapper';
import { UpdateMyPatientDto } from './dto/request.dto/profile.dto';
import { AdminUserListQueryDto } from './dto/request.dto/admin-user.query.dto';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import {
  AdminUserDetailsDto,
  AdminUserListItemDto,
} from './dto/response.dto/admin-user.response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: DatabaseService) {}

  async create(
    payload: RegisterationDTO,
    role: UserRole,
    status?: UserStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? this.prismaService;

    const email = this.normalizeEmail(payload.email);

    const phoneNumber = payload.phoneNumber.trim();

    await this.ensureEmailNotUsed(email, db);
    await this.ensurePhoneNotUsed(phoneNumber, db);
    const hashedPassword = await hashPassword(payload.password);
    const user = await db.user.create({
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
  private async ensurePhoneNotUsed(phoneNumber: string, client) {
    const db = client ?? this.prismaService;
    const existing = await db.user.findUnique({
      where: { phoneNumber },
    });
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
    if (!foundedUser) throw new NotFoundException(`User with ${id} not found`);

    const data: Prisma.UserUncheckedUpdateInput = {};

    if (payload.name !== undefined) {
      data.name = payload.name;
    }

    if (payload.phoneNumber !== undefined) {
      const newPhone = payload.phoneNumber.trim();
      if (newPhone !== foundedUser.phoneNumber) {
        const exists = await this.prismaService.user.findUnique({
          where: { phoneNumber: newPhone },
          select: { id: true },
        });
        if (exists) throw new ConflictException('Phone number already in use');

        data.phoneNumber = newPhone;
      }
    }

    if (payload.profileImageUrl !== undefined) {
      data.profileImageUrl = payload.profileImageUrl;
    }

    if (payload.dateOfBirth !== undefined) {
      data.dateOfBirth = payload.dateOfBirth
        ? new Date(`${payload.dateOfBirth}T00:00:00.000Z`)
        : null;
    }

    await this.prismaService.user.update({
      where: { id },
      data,
    });

    return this.findMyProfile(id);
  }

  async findAllAdmin(
    query: AdminUserListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<AdminUserListItemDto>> {
    const pagination = await this.prismaService.handleQueryPagination(query);

    const q = query.q?.trim();
    const numericId = q && /^\d+$/.test(q) ? Number(q) : null;

    const where: Prisma.UserWhereInput = {
      role: UserRole.PATIENT,
      ...(query.status ? { status: query.status } : {}),
      ...(q
        ? {
            OR: [
              ...(numericId ? [{ id: numericId }] : []),
              { name: { contains: q } },
              { email: { contains: q } },
              { phoneNumber: { contains: q } },
            ],
          }
        : {}),
    };

    const [users, count] = await Promise.all([
      this.prismaService.user.findMany({
        ...removeFields(pagination, ['page']),
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      success: true,
      data: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      meta: await this.prismaService.formatPaginationResponse({
        count,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async findOneAdmin(id: number): Promise<AdminUserDetailsDto> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
        role: UserRole.PATIENT,
      },
    });

    if (!user) throw new NotFoundException('Patient not found');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().slice(0, 10)
        : null,
      profileImageUrl: user.profileImageUrl,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
