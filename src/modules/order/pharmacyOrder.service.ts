import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class PharmacyOrderService {
  constructor(private readonly prismaService: DatabaseService) {}

  //! get orders list
  async getPharmacyOrders(
    pharmacyId: number,
    query: PharmacyOrderQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PharmacyOrderListResponseDto>> {
    const pagination = this.prismaService.handleQueryPagination(query);
    const orderBy = buildCreatedAtOrderBy(query);
    const whereSt = buildPharmacyOrderWhereStatement(pharmacyId, query);

    const [orders, count] = await Promise.all([
      this.prismaService.pharmacyOrder.findMany({
        ...removeFields(pagination, ['page']),
        where: whereSt,
        orderBy: orderBy,

        include: pharmacyOrderWithRelations,
      }),
      this.prismaService.pharmacyOrder.count({
        where: whereSt,
      }),
    ]);
    const data: PharmacyOrderListResponseDto[] = orders.map(
      mapToPharmacyOrderList,
    );
    return {
      success: true,
      data: data,
      meta: this.prismaService.formatPaginationResponse({
        count,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  //! get order
  async getPharmacyOrder(
    pharmacyId: number,
    pharmacyOrderId: number,
  ): Promise<PharmacyOrderDetailsResponseDto> {
    const order = await this.prismaService.pharmacyOrder.findFirst({
      where: { id: pharmacyOrderId, pharmacyId },
      include: pharmacyOrderDetailsInclude,
    });
    if (!order) throw new NotFoundException('Pharmacy order not found');
    return mapToPharmacyOrderDetails(order);
  }
}
