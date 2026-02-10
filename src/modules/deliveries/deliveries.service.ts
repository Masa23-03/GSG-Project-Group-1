import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import { DriverAvailableDeliveriesListItemDto } from './dto/response/list.response.dto';
import { DatabaseService } from '../database/database.service';
import {
  AvailabilityStatus,
  DeliveryStatus,
  PharmacyOrderStatus,
} from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import {
  deliveryAvailableListSelect,
  mapDeliveryListItem,
} from './util/list.mapper';
import { DriverDeliveriesListQueryDto } from './dto/request/query.dto';
import { SortOrder } from 'src/types/pagination.query';
import { DriverDeliveryDetailsResponseDto } from './dto/response/details.response.dto';
import {
  deliveryDetailsSelect,
  mapToDeliveryDetails,
} from './util/deatils.mapper';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prismaService: DatabaseService) {}
  async getAvailableDeliveries(
    userId: number,
    query: DriverDeliveriesListQueryDto,
  ): Promise<
    ApiPaginationSuccessResponse<DriverAvailableDeliveriesListItemDto>
  > {
    const driver = await this.prismaService.driver.findUnique({
      where: {
        userId,
      },
      select: {
        availabilityStatus: true,
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.availabilityStatus !== AvailabilityStatus.ONLINE)
      throw new ForbiddenException('Driver must be ONLINE');
    const pagination = await this.prismaService.handleQueryPagination(query);
    const where = {
      driverId: null,
      status: DeliveryStatus.PENDING,
      pharmacyOrders: {
        every: {
          status: PharmacyOrderStatus.READY_FOR_PICKUP,
        },
      },
    };
    const [rows, count] = await Promise.all([
      this.prismaService.delivery.findMany({
        ...removeFields(pagination, ['page']),
        where,
        select: deliveryAvailableListSelect,
        orderBy: [
          { createdAt: query.sortOrder ?? SortOrder.DESC },
          { id: 'desc' },
        ],
      }),
      this.prismaService.delivery.count({
        where,
      }),
    ]);

    return {
      success: true,
      data: rows.map((d) => mapDeliveryListItem(d)),
      meta: await this.prismaService.formatPaginationResponse({
        count,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async findOne(
    userId: number,
    id: number,
  ): Promise<DriverDeliveryDetailsResponseDto> {
    const driver = await this.prismaService.driver.findUnique({
      where: { userId },
      select: {
        id: true,
        availabilityStatus: true,
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    const accessToDelivery = await this.prismaService.delivery.findFirst({
      where: {
        id,
        OR: [
          {
            driverId: null,
            status: DeliveryStatus.PENDING,
          },
          { driverId: driver.id },
        ],
      },
      select: { id: true },
    });

    if (!accessToDelivery) {
      if (driver.availabilityStatus !== AvailabilityStatus.ONLINE)
        throw new ForbiddenException('Driver must be ONLINE');
      throw new ForbiddenException('Not allowed');
    }
    const delivery = await this.prismaService.delivery.findUnique({
      where: { id },
      select: deliveryDetailsSelect,
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    return mapToDeliveryDetails(delivery);
  }

  update(id: number, updateDeliveryDto) {
    return `This action updates a #${id} delivery`;
  }
}
