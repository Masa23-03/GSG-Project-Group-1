import {
  BadRequestException,
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
  OrderStatus,
  PharmacyOrderStatus,
  Prisma,
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
import {
  DeliveryDecision,
  DriverDeliveryDecisionDto,
} from './dto/request/update-delivery.dto';

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

  async decideDelivery(
    userId: number,
    deliveryId: number,
    dto: DriverDeliveryDecisionDto,
  ): Promise<DriverDeliveryDetailsResponseDto> {
    if (dto.decision === DeliveryDecision.DECLINE) {
      return this.findOne(userId, deliveryId);
    }
    return await this.prismaService.$transaction(async (prisma) => {
      const driver = await prisma.driver.findUnique({
        where: { userId },
        select: { id: true, availabilityStatus: true },
      });
      if (!driver) throw new NotFoundException('Driver not found');
      if (driver.availabilityStatus !== AvailabilityStatus.ONLINE) {
        throw new ForbiddenException('Driver must be ONLINE');
      }
      const activeDelivery = await prisma.delivery.findFirst({
        where: {
          driverId: driver.id,
          status: {
            in: [
              DeliveryStatus.ASSIGNED,
              DeliveryStatus.PICKUP_IN_PROGRESS,
              DeliveryStatus.EN_ROUTE,
            ],
          },
        },
        select: { id: true },
      });

      if (activeDelivery) {
        throw new ForbiddenException('Driver already has an active delivery');
      }

      const delivery = await prisma.delivery.updateMany({
        where: {
          id: deliveryId,
          driverId: null,
          status: DeliveryStatus.PENDING,
          pharmacyOrders: {
            every: {
              status: PharmacyOrderStatus.READY_FOR_PICKUP,
            },
          },
        },
        data: {
          driverId: driver.id,
          acceptedAt: new Date(),
          status: DeliveryStatus.ASSIGNED,
        },
      });

      if (delivery.count !== 1)
        throw new ForbiddenException('Delivery is no longer available');

      const fullReturn = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        select: deliveryDetailsSelect,
      });
      if (!fullReturn) throw new NotFoundException('Delivery not found');

      return mapToDeliveryDetails(fullReturn);
    });
  }

  async confirmPharmacyPickup(
    userId: number,
    deliveryId: number,
    pharmacyOrderId: number,
  ): Promise<DriverDeliveryDetailsResponseDto> {
    return await this.prismaService.$transaction(async (prisma) => {
      const driver = await this.foundDriver(prisma, userId);
      const delivery = await prisma.delivery.findFirst({
        where: {
          id: deliveryId,
          driverId: driver.id,
          status: {
            in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKUP_IN_PROGRESS],
          },
        },
        select: { id: true, status: true },
      });
      if (!delivery)
        throw new NotFoundException(
          'Delivery not found or not assigned to you',
        );
      const updated = await prisma.pharmacyOrder.updateMany({
        where: {
          id: pharmacyOrderId,
          deliveryId,
          status: PharmacyOrderStatus.READY_FOR_PICKUP,
        },
        data: {
          pickedUpAt: new Date(),
          status: PharmacyOrderStatus.PICKED_UP,
        },
      });
      if (updated.count === 0)
        throw new BadRequestException(
          'Pharmacy order is not READY_FOR_PICKUP, not in this delivery, or already picked up',
        );
      if (delivery.status === DeliveryStatus.ASSIGNED) {
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: { status: DeliveryStatus.PICKUP_IN_PROGRESS },
        });
      }

      const fullReturn = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        select: deliveryDetailsSelect,
      });
      if (!fullReturn) throw new NotFoundException('Delivery not found');

      return mapToDeliveryDetails(fullReturn);
    });
  }
  async startDelivery(
    userId: number,
    deliveryId: number,
  ): Promise<DriverDeliveryDetailsResponseDto> {
    return await this.prismaService.$transaction(async (prisma) => {
      const driver = await this.foundDriver(prisma, userId);
      const updated = await prisma.delivery.updateMany({
        where: {
          id: deliveryId,
          driverId: driver.id,
          status: DeliveryStatus.PICKUP_IN_PROGRESS,
          pharmacyOrders: {
            every: { status: PharmacyOrderStatus.PICKED_UP },
          },
        },
        data: { status: DeliveryStatus.EN_ROUTE },
      });

      if (updated.count !== 1) {
        throw new BadRequestException(
          'Cannot start delivery. Make sure all pharmacies are picked up and delivery is in PICKUP_IN_PROGRESS.',
        );
      }

      const fullReturn = await prisma.delivery.findUniqueOrThrow({
        where: { id: deliveryId },
        select: deliveryDetailsSelect,
      });
      await prisma.order.update({
        where: {
          id: fullReturn?.orderId,
        },
        data: {
          status: OrderStatus.OUT_FOR_DELIVERY,
        },
      });

      return mapToDeliveryDetails(fullReturn);
    });
  }

  async confirmDelivery(
    userId: number,
    deliveryId: number,
  ): Promise<DriverDeliveryDetailsResponseDto> {
    return await this.prismaService.$transaction(async (prisma) => {
      const driver = await this.foundDriver(prisma, userId);
      const updated = await prisma.delivery.updateMany({
        where: {
          id: deliveryId,
          driverId: driver.id,
          status: DeliveryStatus.EN_ROUTE,
        },
        data: {
          status: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });
      if (updated.count !== 1) {
        throw new BadRequestException(
          'Cannot confirm delivery. Delivery must be EN_ROUTE and assigned to you.',
        );
      }
      const fullReturn = await prisma.delivery.findUniqueOrThrow({
        where: { id: deliveryId },
        select: deliveryDetailsSelect,
      });
      await prisma.order.update({
        where: {
          id: fullReturn.orderId,
        },
        data: {
          status: OrderStatus.DELIVERED,
        },
      });
      await prisma.pharmacyOrder.updateMany({
        where: { deliveryId: deliveryId },
        data: { status: PharmacyOrderStatus.COMPLETED },
      });

      return mapToDeliveryDetails(fullReturn);
    });
  }

  private async foundDriver(prisma: Prisma.TransactionClient, userId: number) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: { id: true, availabilityStatus: true },
    });

    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.availabilityStatus !== AvailabilityStatus.ONLINE) {
      throw new ForbiddenException('Driver must be ONLINE');
    }

    return driver;
  }
}
