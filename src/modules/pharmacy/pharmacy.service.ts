import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import {
  AdminPharmacyDetailsDto,
  AdminPharmacyListItemDto,
  AdminPharmacyStatusUpdateResponseDto,
} from './dto/response.dto/admin-pharmacy.response.dto';
import {
  AdminBaseUpdateVerificationStatusDto,
  AdminListQueryDto,
} from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { DatabaseService } from '../database/database.service';
import {
  buildAdminPharmacyWhere,
  isPharmacyOpenNow,
  toHHmm,
} from './util/helper';
import { removeFields } from 'src/utils/object.util';
import { assertVerificationStatusTransition } from 'src/utils/status.helper';
import {
  PharmacyMeResponseDto,
  WorkingHoursDto,
} from './dto/response.dto/profile.dto';
import { userBaseSelect } from '../user/util/helper';
import { close } from 'fs';

@Injectable()
export class PharmacyService {
  constructor(private readonly prismaService: DatabaseService) {}
  create(createPharmacyDto) {
    return 'This action adds a new pharmacy';
  }

  //Admin only
  async findAllAdmin(
    query: AdminListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<AdminPharmacyListItemDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = this.prismaService.handleQueryPagination(query);
      const whereStatement = buildAdminPharmacyWhere(query);
      const foundedPharmacies = await prisma.pharmacy.findMany({
        ...removeFields(pagination, ['page']),
        where: whereStatement,
        select: {
          id: true,
          pharmacyName: true,
          city: { select: { name: true } },
          user: {
            select: {
              id: true,
              phoneNumber: true,
            },
          },
          verificationStatus: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      });

      const count = await prisma.pharmacy.count({
        where: whereStatement,
      });
      const data: AdminPharmacyListItemDto[] = foundedPharmacies.map((p) => ({
        id: p.id,
        pharmacyName: p.pharmacyName,
        phoneNumber: p.user.phoneNumber,
        address: p.address ?? null,
        latitude: p.latitude?.toNumber() ?? null,
        longitude: p.longitude?.toNumber() ?? null,
        cityName: p.city.name,
        verificationStatus: p.verificationStatus,
      }));

      return {
        success: true,
        data: data,
        meta: this.prismaService.formatPaginationResponse({
          count: count,
          limit: pagination.take,
          page: pagination.page,
        }),
      };
    });
  }
  //Admin view only
  async findOneAdmin(id: number): Promise<AdminPharmacyDetailsDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacy = await prisma.pharmacy.findFirstOrThrow({
        where: { id },
        select: {
          id: true,
          pharmacyName: true,
          latitude: true,
          longitude: true,
          address: true,
          city: { select: { name: true } },
          verificationStatus: true,
          licenseDocumentUrl: true,
          licenseNumber: true,
          user: {
            select: {
              phoneNumber: true,
              id: true,
            },
          },
        },
      });
      const data: AdminPharmacyDetailsDto = {
        id: pharmacy.id,
        pharmacyName: pharmacy.pharmacyName,
        address: pharmacy.address ?? null,
        latitude: pharmacy.latitude?.toNumber() ?? null,

        longitude: pharmacy.longitude?.toNumber() ?? null,
        cityName: pharmacy.city.name,
        verificationStatus: pharmacy.verificationStatus,
        licenseNumber: pharmacy.licenseNumber,
        licenseDocumentUrl: pharmacy.licenseDocumentUrl ?? null,
        phoneNumber: pharmacy.user.phoneNumber,
      };

      return data;
    });
  }

  async updatePharmacyStatus(
    id: number,
    updatePharmacyDto: AdminBaseUpdateVerificationStatusDto,
    adminId: number,
  ): Promise<AdminPharmacyStatusUpdateResponseDto> {
    const foundedPharmacy = await this.prismaService.pharmacy.findUnique({
      where: { id },
    });
    if (!foundedPharmacy) throw new NotFoundException();

    assertVerificationStatusTransition(
      foundedPharmacy.verificationStatus,
      updatePharmacyDto.verificationStatus,
    );

    const pharmacy = await this.prismaService.pharmacy.update({
      where: { id },
      data: {
        verificationStatus: updatePharmacyDto.verificationStatus,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { phoneNumber: true } },
        city: { select: { name: true } },
      },
    });
    const data: AdminPharmacyStatusUpdateResponseDto = {
      id: pharmacy.id,
      pharmacyName: pharmacy.pharmacyName,
      reviewedAt: String(pharmacy.reviewedAt),
      reviewedBy: adminId,
      phoneNumber: pharmacy.user.phoneNumber,
      cityName: pharmacy.city.name,
      verificationStatus: pharmacy.verificationStatus,
    };
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} pharmacy`;
  }
  async findMyProfile(userId: number): Promise<PharmacyMeResponseDto> {
    const pharmacy = await this.prismaService.pharmacy.findUnique({
      where: { userId },
      select: {
        pharmacyName: true,
        verificationStatus: true,
        city: { select: { name: true } },
        updatedAt: true,
        createdAt: true,
        coverImageUrl: true,
        id: true,
        latitude: true,
        longitude: true,
        address: true,
        user: {
          select: userBaseSelect,
        },
        workCloseTime: true,
        workOpenTime: true,
      },
    });
    if (!pharmacy) throw new NotFoundException();
    const openHour = toHHmm(pharmacy.workOpenTime);
    const closeHour = toHHmm(pharmacy.workCloseTime);

    const workingHours: WorkingHoursDto | null =
      openHour && closeHour
        ? { openTime: openHour, closeTime: closeHour }
        : null;

    const data: PharmacyMeResponseDto = {
      pharmacyId: pharmacy.id,
      userId: pharmacy.user.id,
      email: pharmacy.user.email,
      phoneNumber: pharmacy.user.phoneNumber,
      profileImageUrl: pharmacy.user.profileImageUrl,
      coverImageUrl: pharmacy.coverImageUrl,
      verificationStatus: pharmacy.verificationStatus,
      cityName: pharmacy.city.name,
      createdAt: pharmacy.createdAt.toISOString(),
      updatedAt: pharmacy.updatedAt.toISOString(),
      role: pharmacy.user.role,
      pharmacyName: pharmacy.pharmacyName,
      address: pharmacy.address ?? null,
      latitude: pharmacy.latitude?.toNumber() ?? null,
      longitude: pharmacy.longitude?.toNumber() ?? null,
      workingHours,
    };
    return data;
  }
}
