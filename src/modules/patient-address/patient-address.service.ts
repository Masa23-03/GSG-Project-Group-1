import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationQueryDto } from 'src/types/pagination.query';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { PatientAddressListItemResponseDto } from './dto/response/list.response.dto';
import { Prisma } from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import {
  mapPatientAddressListItem,
  mapPatientAddressDetails,
} from './util/mapper';
import { CreatePatientAddressDto } from './dto/request/create-patient-address.dto';
import { UpdatePatientAddressDto } from './dto/request/update-patient-address.dto';
import { addressDetailsSelect } from './util/constant';
import { PatientAddressDetailsResponseDto } from './dto/response/details.response.dto';

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
  async create(
    userId: number,
    payload: CreatePatientAddressDto,
  ): Promise<ApiSuccessResponse<PatientAddressDetailsResponseDto>> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const existingCount = await tx.patientAddress.count({
        where: {
          userId,
          isDeleted: false,
        },
      });
      let isDefault = payload.isDefault ?? false;
      if (existingCount === 0) {
        isDefault = true;
      }

      if (isDefault) {
        await tx.patientAddress.updateMany({
          where: {
            userId,
            isDeleted: false,
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }
      const created = await tx.patientAddress.create({
        data: {
          ...payload,
          isDefault,
          userId,
        },
        select: addressDetailsSelect
      });
      return mapPatientAddressDetails(created);
    });
    return {
      success: true,
      data: result,
    };
  }

  async update(
    userId: number,
    id: number,
    payload: UpdatePatientAddressDto,
  ): Promise<ApiSuccessResponse<PatientAddressDetailsResponseDto>> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const address = await tx.patientAddress.findFirst({
        where: { id, userId },
      });

      if (!address || address.isDeleted)
        throw new NotFoundException('Address not found');

      if (payload.isDefault === true) {
        await tx.patientAddress.updateMany({
          where: {
            userId,
            isDeleted: false,
            isDefault: true,
            NOT: { id },
          },
          data: { isDefault: false },
        });
      }
     const updated = await tx.patientAddress.update({
        where: { id },
        data: payload,
        select: addressDetailsSelect
      });
      return mapPatientAddressDetails(updated);
    });
    return {
      success: true,
      data: result,
    };
  }

  async remove(userId: number, id: number): Promise<ApiSuccessResponse<null>> {
    await this.prismaService.$transaction(async (tx) => {
      const address = await tx.patientAddress.findFirst({
        where: { id, userId },
      });
      if (!address || address.isDeleted) {
        throw new NotFoundException('Address not found');
      }

      await tx.patientAddress.update({
        where: { id },
        data: {
          isDeleted: true,
          isDefault: false,
        },
      });

      if (address.isDefault) {
        const replacement = await tx.patientAddress.findFirst({
          where: { userId, isDeleted: false, id: { not: id } },
          orderBy: { createdAt: 'desc' },
        });

        if (replacement) {
          await tx.patientAddress.update({
            where: { id: replacement.id },
            data: { isDefault: true },
          });
        }
      }
    });
    return {
      success: true,
      data: null,
    };
  }
}
