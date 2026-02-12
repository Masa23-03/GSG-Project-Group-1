import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { removeFields } from 'src/utils/object.util';
import { assertVerificationStatusTransition } from 'src/utils/status.helper';
import {
  PharmacyMeResponseDto,
  WorkingHoursDto,
} from './dto/response.dto/profile.dto';
import { userBaseSelect } from '../user/util/helper';
import { UpdateMyPharmacyProfileDto } from './dto/request.dto/profile.dto';
import { mapBaseUserForProfileUpdate } from 'src/utils/util';
import {
  Prisma,
  UserRole,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { UserService } from '../user/user.service';
import type { RegisterPharmacyDTO } from '../auth/dto/auth.register.dto';
import {
  PatientPharmaciesQueryDto,
  PharmacyScope,
} from './dto/query.dto/patient.query.dto';
import {
  PatientPharmacyDetailsDto,
  PatientPharmacyListResponseDto,
} from './dto/response.dto/pateint-pharmacy.response.dto';
import {
  mapToPatientPharmacyDetails,
  mapToPatientPharmacyList,
  patientPharmacyDetailsSelect,
  patientPharmacySelect,
} from './util/mapper';
import {
  applyRadiusFilter,
  buildAdminPharmacyWhere,
  buildPatientPharmacyWhere,
  sortByDistanceThenName,
  toHHmm,
} from './util/helper';

@Injectable()
export class PharmacyService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly userService: UserService,
  ) {}

  async create(payload: RegisterPharmacyDTO) {
    try {
      return this.prismaService.$transaction(async (tx) => {

        const city = await tx.city.findUnique({ where: { id: payload.cityId }, select: { id: true } });
        if (!city) throw new NotFoundException('City not found');

        const user = await this.userService.create(
          payload,
          UserRole.PHARMACY,
          UserStatus.INACTIVE,
          tx,
        );

        const pharmacy = await tx.pharmacy.create({
          data: {
            userId: user.id,
            pharmacyName: payload.pharmacyName,
            licenseNumber: payload.licenseNumber,
            cityId: payload.cityId,
            address: payload.address ?? null,
            licenseDocumentUrl: payload.licenseDocUrl ?? null,
            latitude: payload.lat ?? null,
            longitude: payload.lng ?? null,
          },
        });

        return {
          user,
          pharmacy
        };

      });
    } catch (e) {
      console.log('pharmacy service error - create() method :', e);
      throw e;
    }
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

  //! Patient
  async findAllPatient(
    query: PatientPharmaciesQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientPharmacyListResponseDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = await this.prismaService.handleQueryPagination(query);
      const whereSt = buildPatientPharmacyWhere(query);
      const willComputeDistanceSort =
        (query.scope ?? PharmacyScope.nearby) === PharmacyScope.nearby &&
        query.lat !== undefined &&
        query.lng !== undefined;

      const orderBy: Prisma.PharmacyOrderByWithRelationInput[] = [
        { pharmacyName: 'asc' },
      ];

      const [rows, count] = await Promise.all([
        prisma.pharmacy.findMany({
          ...removeFields(pagination, ['page']),
          where: whereSt,
          select: patientPharmacySelect,
          orderBy: orderBy,
        }),
        prisma.pharmacy.count({ where: whereSt }),
      ]);

      let items = rows.map((p) => mapToPatientPharmacyList(p, query));
      if (willComputeDistanceSort) {
        items = applyRadiusFilter(items, query.radiusKm);
        items = sortByDistanceThenName(items);
      }

      return {
        success: true,
        data: items,
        meta: this.prismaService.formatPaginationResponse({
          count: count,
          page: pagination.page,
          limit: pagination.take,
        }),
      };
    });
  }

  async findPatientOnePharmacy(
    patientId: number,
    pharmacyId: number,
  ): Promise<PatientPharmacyDetailsDto> {
    const pharmacy = await this.prismaService.pharmacy.findFirst({
      where: {
        id: pharmacyId,
        verificationStatus: VerificationStatus.VERIFIED,
        user: { status: UserStatus.ACTIVE },
      },
      select: patientPharmacyDetailsSelect,
    });

    if (!pharmacy) {
      throw new NotFoundException();
    }
    const defaultAddress = await this.prismaService.patientAddress.findFirst({
      where: {
        userId: patientId,
        isDefault: true,
        isDeleted: false,
      },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    const patientLat =
      defaultAddress?.latitude !== null &&
      defaultAddress?.latitude !== undefined
        ? Number(defaultAddress.latitude)
        : undefined;

    const patientLng =
      defaultAddress?.longitude !== null &&
      defaultAddress?.longitude !== undefined
        ? Number(defaultAddress.longitude)
        : undefined;
    return mapToPatientPharmacyDetails(pharmacy, patientLat, patientLng);
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

  async updateMyProfile(
    userId: number,
    payload: UpdateMyPharmacyProfileDto,
  ): Promise<PharmacyMeResponseDto> {
    const foundedPharmacy = await this.prismaService.pharmacy.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!foundedPharmacy) throw new NotFoundException();
    await this.prismaService.$transaction(async (prisma) => {
      const userData = mapBaseUserForProfileUpdate(payload);
      if (userData) {
        await prisma.user.update({
          where: { id: userId },
          data: userData,
        });
      }
      const pharmacyData: any = {};
      if (payload.pharmacyName !== undefined)
        pharmacyData.pharmacyName = payload.pharmacyName;

      if (payload.address !== undefined) pharmacyData.address = payload.address;
      if (payload.latitude !== undefined)
        pharmacyData.latitude = payload.latitude;
      if (payload.longitude !== undefined)
        pharmacyData.longitude = payload.longitude;
      if (payload.workingHours !== undefined) {
        if (payload.workingHours === null) {
          pharmacyData.workOpenTime = null;
          pharmacyData.workCloseTime = null;
        } else {
          pharmacyData.workOpenTime = new Date(
            `1970-01-01T${payload.workingHours.openTime}:00.000Z`,
          );
          pharmacyData.workCloseTime = new Date(
            `1970-01-01T${payload.workingHours.closeTime}:00.000Z`,
          );
        }
      }
      if (Object.keys(pharmacyData).length > 0) {
        await prisma.pharmacy.update({
          where: { id: foundedPharmacy.id },
          data: pharmacyData,
        });
      }
    });
    return this.findMyProfile(userId);
  }
}
