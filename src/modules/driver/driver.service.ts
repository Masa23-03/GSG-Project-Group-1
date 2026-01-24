import { Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/request.dto/create-driver.dto';
import { UpdateDriverDto } from './dto/request.dto/update-driver.dto';
import {
  AdminDriverListQueryDto,
  AdminDriverListQueryDtoT,
} from './dto/query.dto/get-driver-dto';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import {
  AdminDriverListItemDto,
  BusyStatus,
} from './dto/response.dto/admin-drivers-response.dto';
import { DatabaseService } from '../database/database.service';
import { buildAdminDriverWhere } from './util/helper';
import { removeFields } from 'src/utils/object.util';
import { AvailabilityStatus, DeliveryStatus } from '@prisma/client';

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
      const data: AdminDriverListItemDto[] = foundedDrivers.map((d) => {
        const busy =
          d._count.deliveries > 0 ? BusyStatus.BUSY : BusyStatus.AVAILABLE;
        return {
          id: d.id,
          name: d.user.name,
          availabilityStatus: d.availabilityStatus,
          phoneNumber: d.user.phoneNumber,
          busyStatus: busy,
          vehicleName: d.vehicleName,
          vehiclePlate: d.vehiclePlate,
          verificationStatus: d.verificationStatus,
        };
      });
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

  findOne(id: number) {
    return `This action returns a #${id} driver`;
  }

  update(id: number, updateDriverDto: UpdateDriverDto) {
    return `This action updates a #${id} driver`;
  }

  remove(id: number) {
    return `This action removes a #${id} driver`;
  }
}
