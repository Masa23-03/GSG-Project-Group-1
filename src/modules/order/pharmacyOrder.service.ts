import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PharmacyOrderQueryDto } from './dto/request.dto/order.query.dto';
import {
  PharmacyOrderDetailsResponseDto,
  PharmacyOrderListResponseDto,
} from './dto/response.dto/pharmacyOrder.response.dto';
import { buildPharmacyOrderWhereStatement } from './util/pharmacyOrderWhereBuilder.util';
import { buildCreatedAtOrderBy } from 'src/types/pagination.query';
import { removeFields } from 'src/utils/object.util';
import {
  mapToPharmacyOrderDetails,
  mapToPharmacyOrderList,
  pharmacyOrderDetailsInclude,
  pharmacyOrderWithRelations,
} from './util/pharmacyOrder.mapper';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import {
  PharmacyOrderDecision,
  PharmacyOrderDecisionDto,
  PharmacyProgressStatus,
  UpdatePharmacyOrderStatusDto,
} from './dto/request.dto/update-order.dto';
import {
  OrderStatus,
  PaymentStatus,
  PharmacyOrderStatus,
  PrescriptionStatus,
  Prisma,
} from '@prisma/client';
import { assertPharmacyOrderTransition } from './util/status.order.helper';
import { OrderService } from './order.service';
import { requirePharmacyId } from 'src/utils/getPharmacyAndDriverFromUserId';

@Injectable()
export class PharmacyOrderService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly orderService: OrderService,
  ) {}

  //! get orders list
  async getPharmacyOrders(
    userId: number,
    query: PharmacyOrderQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PharmacyOrderListResponseDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacyId = await requirePharmacyId(prisma, userId);

      const pagination = this.prismaService.handleQueryPagination(query);
      const orderBy = buildCreatedAtOrderBy(query);
      const whereSt = buildPharmacyOrderWhereStatement(pharmacyId, query);

      const [orders, count] = await Promise.all([
        prisma.pharmacyOrder.findMany({
          ...removeFields(pagination, ['page']),
          where: whereSt,
          orderBy,
          include: pharmacyOrderWithRelations,
        }),
        prisma.pharmacyOrder.count({ where: whereSt }),
      ]);

      return {
        success: true,
        data: orders.map(mapToPharmacyOrderList),
        meta: this.prismaService.formatPaginationResponse({
          count,
          page: pagination.page,
          limit: pagination.take,
        }),
      };
    });
  }

  //! get order
  async getPharmacyOrder(
    userId: number,
    pharmacyOrderId: number,
  ): Promise<PharmacyOrderDetailsResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacyId = await requirePharmacyId(prisma, userId);

      const order = await prisma.pharmacyOrder.findFirst({
        where: { id: pharmacyOrderId, pharmacyId },
        include: pharmacyOrderDetailsInclude,
      });

      if (!order) throw new NotFoundException('Pharmacy order not found');
      return mapToPharmacyOrderDetails(order);
    });
  }

  //! accept/reject order (decision)
  async decidePharmacyOrder(
    userId: number,
    orderId: number,
    dto: PharmacyOrderDecisionDto,
  ): Promise<PharmacyOrderDetailsResponseDto> {
    return await this.prismaService.$transaction(async (prisma) => {
      const pharmacyId = await requirePharmacyId(prisma, userId);
      const po = await prisma.pharmacyOrder.findFirst({
        where: { id: orderId, pharmacyId: pharmacyId },
        select: {
          id: true,
          status: true,
          requiresPrescription: true,
          deliveryId: true,
          orderId: true,
          totalAmount: true,
          pharmacyOrderItems: {
            select: {
              quantity: true,
            },
          },

          order: {
            select: {
              status: true,
              delivery: { select: { id: true } },
              deliveryFeeAmount: true,
              totalAmount: true,
              subtotalAmount: true,
            },
          },
        },
      });
      if (!po) throw new NotFoundException('Pharmacy order not found');
      if (po.status !== PharmacyOrderStatus.PENDING)
        throw new BadRequestException('Pharmacy order is already decided');
      if (
        po.order.status === OrderStatus.DELIVERED ||
        po.order.status === OrderStatus.CANCELLED ||
        po.order.status === OrderStatus.REJECTED
      )
        throw new BadRequestException(
          `Cannot decide: parent order is ${po.order.status}`,
        );
      if (po.status !== PharmacyOrderStatus.PENDING)
        throw new BadRequestException('Pharmacy order is already decided');
      assertPharmacyOrderTransition(
        po.status,
        this.decisionToStatus(dto.decision),
      );
      if (dto.decision === PharmacyOrderDecision.REJECT) {
        const reason = dto.rejectionReason?.trim();
        if (!reason) {
          throw new BadRequestException(
            'rejectionReason is required when decision is REJECT',
          );
        }
      }
      const nextStatus = this.decisionToStatus(dto.decision);
      const now = new Date();
      const poItemsCount = po.pharmacyOrderItems.reduce(
        (a, x) => a + x.quantity,
        0,
      );
      const dataToUpdate: Prisma.PharmacyOrderUpdateInput =
        nextStatus === PharmacyOrderStatus.ACCEPTED
          ? {
              status: PharmacyOrderStatus.ACCEPTED,
              acceptedAt: now,
              rejectedAt: null,
              rejectionReason: null,
            }
          : {
              status: PharmacyOrderStatus.REJECTED,
              acceptedAt: null,
              rejectedAt: now,
              rejectionReason: dto.rejectionReason!.trim(),
            };

      await prisma.pharmacyOrder.update({
        where: { id: orderId },
        data: dataToUpdate,
      });
      if (nextStatus === PharmacyOrderStatus.ACCEPTED) {
        await this.onPharmacyOrderAccepted(prisma, po);
      } else {
        await this.onPharmacyOrderRejected(prisma, po, poItemsCount);
      }

      //async parent order status (call asyncOrderStatus)
      await this.orderService.syncOrderStatus(prisma, po.orderId);

      const full = await prisma.pharmacyOrder.findUniqueOrThrow({
        where: { id: po.id },
        include: pharmacyOrderDetailsInclude,
      });

      return mapToPharmacyOrderDetails(full);
    });
  }

  //! update pharmacy order status
  async updatePharmacyOrderStatus(
    userId: number,
    pharmacyOrderId: number,
    dto: UpdatePharmacyOrderStatusDto,
  ): Promise<PharmacyOrderDetailsResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacyId = await requirePharmacyId(prisma, userId);

      const pharmacyOrder = await prisma.pharmacyOrder.findFirst({
        where: { id: pharmacyOrderId, pharmacyId },
        select: {
          id: true,
          status: true,
          orderId: true,
          order: {
            select: { status: true, delivery: { select: { id: true } } },
          },
        },
      });

      if (!pharmacyOrder)
        throw new NotFoundException('Pharmacy order not found');
      const terminalOrderStatuses: OrderStatus[] = [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.REJECTED,
      ];

      if (terminalOrderStatuses.includes(pharmacyOrder.order.status)) {
        throw new BadRequestException(
          `Cannot update: parent order is ${pharmacyOrder.order.status}`,
        );
      }

      if (
        ![
          PharmacyOrderStatus.PREPARING,
          PharmacyOrderStatus.READY_FOR_PICKUP,
        ].includes(dto.status)
      ) {
        throw new BadRequestException('Invalid progress status');
      }

      assertPharmacyOrderTransition(pharmacyOrder.status, dto.status);
      // update pharmacy order status
      await prisma.pharmacyOrder.update({
        where: { id: pharmacyOrder.id },
        data: { status: dto.status },
      });

      // Only if it became READY_FOR_PICKUP, check if delivery should be created
      if (dto.status === PharmacyOrderStatus.READY_FOR_PICKUP) {
        const existing = await prisma.delivery.findUnique({
          where: { orderId: pharmacyOrder.orderId },
          select: { id: true },
        });

        if (!existing) {
          const notReadyCount = await prisma.pharmacyOrder.count({
            where: {
              orderId: pharmacyOrder.orderId,
              status: { not: PharmacyOrderStatus.READY_FOR_PICKUP },
            },
          });

          if (notReadyCount === 0) {
            const delivery = await prisma.delivery.create({
              data: { orderId: pharmacyOrder.orderId },
              select: { id: true },
            });

            await prisma.pharmacyOrder.updateMany({
              where: { orderId: pharmacyOrder.orderId, deliveryId: null },
              data: { deliveryId: delivery.id },
            });
          }
        }
      }
      await prisma.pharmacyOrder.update({
        where: { id: pharmacyOrder.id },
        data: { status: dto.status },
      });

      await this.orderService.syncOrderStatus(prisma, pharmacyOrder.orderId);

      const full = await prisma.pharmacyOrder.findUniqueOrThrow({
        where: { id: pharmacyOrder.id },
        include: pharmacyOrderDetailsInclude,
      });

      return mapToPharmacyOrderDetails(full);
    });
  }

  //! helpers
  private decisionToStatus(
    decision: PharmacyOrderDecision,
  ): PharmacyOrderStatus {
    return decision === PharmacyOrderDecision.ACCEPT
      ? PharmacyOrderStatus.ACCEPTED
      : PharmacyOrderStatus.REJECTED;
  }

  private async getActivePrescription(
    prisma: Prisma.TransactionClient,
    pharmacyOrderId: number,
  ) {
    const activePrescription = await prisma.prescription.findFirst({
      where: { pharmacyOrderId, isActive: true },
      select: {
        id: true,
        status: true,
      },
    });
    if (!activePrescription)
      throw new NotFoundException('Active prescription not found');

    return activePrescription;
  }

  private async onPharmacyOrderAccepted(
    prisma: Prisma.TransactionClient,
    po: { id: number; orderId: number; requiresPrescription: boolean },
  ) {
    if (!po.requiresPrescription) return;
    //prescription: approved

    const prescription = await this.getActivePrescription(prisma, po.id);
    await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: PrescriptionStatus.APPROVED,
        isActive: true,
      },
    });
  }

  private async onPharmacyOrderRejected(
    prisma: Prisma.TransactionClient,
    po: {
      id: number;
      orderId: number;
      requiresPrescription: boolean;
      totalAmount: Prisma.Decimal;
      order: {
        deliveryFeeAmount: Prisma.Decimal;
        subtotalAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
      };
    },
    itemsCount: number,
  ) {
    //prescription: rejected
    if (po.requiresPrescription) {
      const prescription = await this.getActivePrescription(prisma, po.id);
      await prisma.prescription.update({
        where: { id: prescription.id },
        data: {
          status: PrescriptionStatus.REJECTED,
        },
      });
    }

    //release stock (call releaseStockForPharmacyOrder)
    await this.orderService.releaseStockForPharmacyOrder(prisma, po.id);
    //calculate parent order: total amount , sub total , items count
    const newSubOrderTotal = po.order.subtotalAmount.sub(po.totalAmount);
    const isEmpty = newSubOrderTotal.equals(0);
    const newDeliveryFee = isEmpty
      ? new Prisma.Decimal(0)
      : po.order.deliveryFeeAmount;

    const newOrderTotal = newSubOrderTotal.add(newDeliveryFee);
    await prisma.order.update({
      where: { id: po.orderId },
      data: {
        subtotalAmount: newSubOrderTotal,
        totalAmount: newOrderTotal,
        itemsCount: { decrement: itemsCount },
      },
    });
    //update payment -> total
    await prisma.payment.updateMany({
      where: { orderId: po.orderId, status: PaymentStatus.PENDING },
      data: { amount: newOrderTotal },
    });
  }
}
