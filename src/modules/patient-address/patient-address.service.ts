import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationQueryDto } from 'src/types/pagination.query';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import { PatientAddressListItemResponseDto } from './dto/response/list.response.dto';
import { Prisma } from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import { mapPatientAddressListItem } from './util/mapper';
import { CreatePatientAddressDto } from './dto/request/create-patient-address.dto';

@Injectable()
export class PatientAddressService {
  constructor(private readonly prismaService: DatabaseService) {}
  async listMyAddresses(
    userId: number,
    query: PaginationQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientAddressListItemResponseDto>> {
    const pagination = await this.prismaService.handleQueryPagination(query);
    const where: Prisma.PatientAddressWhereInput = {
      userId: userId,
      isDeleted: false,
    };
    const select: Prisma.PatientAddressSelect = {
      id: true,
      label: true,
      latitude: true,
      longitude: true,
      addressLine1: true,
      city: {
        select: { name: true },
      },
      cityId: true,
      isDefault: true,
    };

    const [rows, count] = await this.prismaService.$transaction([
      this.prismaService.patientAddress.findMany({
        ...removeFields(pagination, ['page']),
        where: where,
        select: select,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prismaService.patientAddress.count({
        where: where,
      }),
    ]);

    const items = rows.map((p) => mapPatientAddressListItem(p));
    return {
      success: true,
      data: items,
      meta: await this.prismaService.formatPaginationResponse({
        count,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }
  async create(id: number, payload: CreatePatientAddressDto): {

}
