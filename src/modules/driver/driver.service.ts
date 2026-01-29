import { Injectable, NotFoundException } from '@nestjs/common';

import {
  AdminDriverListQueryDto,
  AdminDriverListQueryDtoT,
} from './dto/query.dto/get-driver-dto';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import {
  AdminDriverDetailsDto,
  AdminDriverListItemDto,
  AdminDriverVerificationUpdateResponseDto,
  BusyStatus,
} from './dto/response.dto/admin-drivers-response.dto';
import { DatabaseService } from '../database/database.service';
import { buildAdminDriverWhere } from './util/helper';
import { removeFields } from 'src/utils/object.util';
import { AvailabilityStatus, DeliveryStatus, Driver } from '@prisma/client';
import { AdminBaseUpdateVerificationStatusDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { assertVerificationStatusTransition } from 'src/utils/status.helper';
import { DriverMeResponseDto } from './dto/response.dto/profile.dto';
import { userBaseSelect } from '../user/util/helper';
import { UpdateMyDriverDto } from './dto/request.dto/profile.dto';
import { mapBaseUserForProfileUpdate } from 'src/utils/util';
import { UserRole, UserStatus } from '@prisma/client';
import { UserService } from '../user/user.service';
import type { RegisterDriverDTO } from '../auth/dto/auth.register.dto';
@Injectable()
export class DriverService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly userService: UserService,
  ) {}


  async create(payload: RegisterDriverDTO) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const user = await this.userService.create(
          payload,
          UserRole.DRIVER,
          UserStatus.INACTIVE,
          tx,
        );

        const driver = await tx.driver.create({
          data: {
            userId: user.id,
            vehicleName: payload.vehicleName,
            vehiclePlate: payload.vehiclePlate,
            licenseDocumentUrl: payload.licenseDocUrl,
          },
        });

        return {
          user,
          driver
        }

      })
    } catch (e) {
      console.log('driver service error - create() method :', e);
      throw e;
    }
  }

  //Admin only
  async findAllAdmin(
    query: AdminDriverListQueryDtoT,
  ): Promise<ApiPaginationSuccessResponse<AdminDriverListItemDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const whereStatement = buildAdminDriverWhere(query);
      const pagination = this.prismaService.handleQueryPagination(query);

      const foundedDrivers = await prisma.driver.findMany({
        ...removeFields(pagination, ['page']),
        where: whereStatement,
        select: {
          id: true,
          vehicleName: true,
          vehiclePlate: true,
          availabilityStatus: true,
          verificationStatus: true,
          user: { select: { phoneNumber: true, name: true } },
          _count: {
            select: {
              deliveries: {
                where: {
                  status: {
                    in: [
                      DeliveryStatus.ASSIGNED,
                      DeliveryStatus.EN_ROUTE,
                      DeliveryStatus.PICKUP_IN_PROGRESS,
                    ],
                  },
                },
              },
            },
          },
        },
      });
      const count = await prisma.driver.count({
        where: whereStatement,
      });
      const data: AdminDriverListItemDto[] = foundedDrivers.map((d) => ({
        id: d.id,
        name: d.user.name,
        availabilityStatus: d.availabilityStatus,
        phoneNumber: d.user.phoneNumber,
        busyStatus: this.calculateBusyStatus(d._count.deliveries),
        vehicleName: d.vehicleName,
        vehiclePlate: d.vehiclePlate,
        verificationStatus: d.verificationStatus,
      }));
      return {
        success: true,
        data,
        meta: this.prismaService.formatPaginationResponse({
          count: count,
          page: pagination.page,
          limit: pagination.take,
        }),
      };
    });
  }
  //Admin only
  async findOneAdmin(id: number): Promise<AdminDriverDetailsDto> {
    const foundedDriver = await this.prismaService.driver.findUnique({
      where: { id },
      select: {
        id: true,
        vehicleName: true,
        vehiclePlate: true,
        availabilityStatus: true,
        verificationStatus: true,
        user: { select: { phoneNumber: true, name: true } },
        licenseNumber: true,
        licenseDocumentUrl: true,
        _count: {
          select: {
            deliveries: {
              where: {
                status: {
                  in: [
                    DeliveryStatus.ASSIGNED,
                    DeliveryStatus.EN_ROUTE,
                    DeliveryStatus.PICKUP_IN_PROGRESS,
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!foundedDriver) throw new NotFoundException();

    const data: AdminDriverDetailsDto = {
      id: foundedDriver.id,
      name: foundedDriver.user.name,
      phoneNumber: foundedDriver.user.phoneNumber,
      vehicleName: foundedDriver.vehicleName,
      vehiclePlate: foundedDriver.vehiclePlate,
      licenseDocumentUrl: foundedDriver.licenseDocumentUrl,
      licenseNumber: foundedDriver.licenseNumber,
      verificationStatus: foundedDriver.verificationStatus,
      availabilityStatus: foundedDriver.availabilityStatus,
      busyStatus: this.calculateBusyStatus(foundedDriver._count.deliveries),
    };
    return data;
  }

  async updateDriverStatus(
    id: number,
    updateDriverDto: AdminBaseUpdateVerificationStatusDto,
    adminId: number,
  ): Promise<AdminDriverVerificationUpdateResponseDto> {
    const driver = await this.prismaService.driver.findUnique({
      where: { id },
    });
    if (!driver) throw new NotFoundException();
    assertVerificationStatusTransition(
      driver.verificationStatus,
      updateDriverDto.verificationStatus,
    );
    const updatedDriver = await this.prismaService.driver.update({
      where: { id },
      data: {
        verificationStatus: updateDriverDto.verificationStatus,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      select: {
        id: true,
        vehicleName: true,
        vehiclePlate: true,
        availabilityStatus: true,
        verificationStatus: true,
        reviewedAt: true,
        reviewedBy: true,
        user: { select: { phoneNumber: true, name: true } },
        _count: {
          select: {
            deliveries: {
              where: {
                status: {
                  in: [
                    DeliveryStatus.ASSIGNED,
                    DeliveryStatus.EN_ROUTE,
                    DeliveryStatus.PICKUP_IN_PROGRESS,
                  ],
                },
              },
            },
          },
        },
      },
    });

    const data: AdminDriverVerificationUpdateResponseDto = {
      busyStatus: this.calculateBusyStatus(updatedDriver._count.deliveries),
      id: driver.id,
      reviewedAt: updatedDriver.reviewedAt?.toISOString(),
      reviewedBy: adminId,
      phoneNumber: updatedDriver.user.phoneNumber,
      name: updatedDriver.user.name,
      vehicleName: updatedDriver.vehicleName,
      vehiclePlate: updatedDriver.vehiclePlate,
      verificationStatus: updatedDriver.verificationStatus,
      availabilityStatus: updatedDriver.availabilityStatus,
    };
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} driver`;
  }

  async getMyProfile(userId: number): Promise<DriverMeResponseDto> {
    const driver = await this.prismaService.driver.findUnique({
      where: { userId },
      select: {
        user: { select: userBaseSelect },
        vehicleName: true,
        vehiclePlate: true,
        id: true,
        availabilityStatus: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!driver) throw new NotFoundException();
    const data: DriverMeResponseDto = {
      driverId: driver.id,
      userId: driver.user.id,
      vehicleName: driver.vehicleName,
      vehiclePlate: driver.vehiclePlate,
      verificationStatus: driver.verificationStatus,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
      availabilityStatus: driver.availabilityStatus,
      email: driver.user.email,
      name: driver.user.name,
      phoneNumber: driver.user.phoneNumber,
      profileImageUrl: driver.user.profileImageUrl,
      role: driver.user.role,
    };
    return data;
  }
  async updateMyProfile(
    userId: number,
    payload: UpdateMyDriverDto,
  ): Promise<DriverMeResponseDto> {
    const foundedDriver = await this.prismaService.driver.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!foundedDriver) throw new NotFoundException();
    await this.prismaService.$transaction(async (prisma) => {
      const userData = mapBaseUserForProfileUpdate(payload);
      if (userData) {
        await prisma.user.update({
          where: { id: userId },
          data: userData,
        });
      }
      const driverData: any = {};
      if (payload.vehicleName !== undefined)
        driverData.vehicleName = payload.vehicleName;
      if (payload.vehiclePlate !== undefined)
        driverData.vehiclePlate = payload.vehiclePlate;

      if (Object.keys(driverData).length > 0) {
        await prisma.driver.update({
          where: {
            id: foundedDriver.id,
          },
          data: driverData,
        });
      }
    });

    return this.getMyProfile(userId);
  }
  private calculateBusyStatus(activeDeliveriesCount: number): BusyStatus {
    return activeDeliveriesCount > 0 ? BusyStatus.BUSY : BusyStatus.AVAILABLE;
  }
}
