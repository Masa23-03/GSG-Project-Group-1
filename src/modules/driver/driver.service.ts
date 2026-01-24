import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/request.dto/create-driver.dto';
import { UpdateDriverDto } from './dto/request.dto/update-driver.dto';
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
import { AvailabilityStatus, DeliveryStatus } from '@prisma/client';
import { AdminBaseUpdateVerificationStatusDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { assertVerificationStatusTransition } from 'src/utils/status.helper';

@Injectable()
export class DriverService {
  constructor(private readonly prismaService: DatabaseService) {}
  create(createDriverDto: CreateDriverDto) {
    return 'This action adds a new driver';
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

  private calculateBusyStatus(activeDeliveriesCount: number): BusyStatus {
    return activeDeliveriesCount > 0 ? BusyStatus.BUSY : BusyStatus.AVAILABLE;
  }
}
