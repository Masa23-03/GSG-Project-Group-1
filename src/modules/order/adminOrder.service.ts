import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { GetAdminOrderQueryDto } from './dto/request.dto/order.query.dto';
import { AdminOrderListItemDto } from './dto/response.dto/admin-order-listItem.response.dto';
import { Prisma, OrderStatus } from '@prisma/client';
import {
  mapToAdminOrderListItem,
  adminOrderListInclude,
} from './util/adminOrderResposne.mapper';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';

@Injectable()
export class AdminOrderService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAllAdmin(
    query: GetAdminOrderQueryDto,
  ): Promise<ApiPaginationSuccessResponse<AdminOrderListItemDto>> {
    const searchNumber = query.q ? parseInt(query.q) : NaN;
    const isNumber = !isNaN(searchNumber);

    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.q && {
        OR: [
          ...(isNumber ? [{ id: searchNumber }] : []),
          { patient: { name: { contains: query.q } } },
          {
            pharmacyOrders: {
              some: { pharmacy: { pharmacyName: { contains: query.q } } },
            },
          },
        ],
      }),
    };
    const {
      skip,
      take: limit,
      page,
    } = this.prisma.handleQueryPagination(query);
    const [orders, count] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: adminOrderListInclude,
      }),
      this.prisma.order.count({ where }),
    ]);
    const data: AdminOrderListItemDto[] = orders.map((order) => {
      return mapToAdminOrderListItem(order);
    });

    return {
      success: true,
      data,
      meta: await this.prisma.formatPaginationResponse({
        count,
        page,
        limit,
      }),
    };
  }
}
