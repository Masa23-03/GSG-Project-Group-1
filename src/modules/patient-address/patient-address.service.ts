import { Injectable, NotFoundException } from '@nestjs/common';
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
      const city = await tx.city.findFirst({
        where: { id: payload.cityId },
        select: { id: true },
      });
      if (!city) throw new NotFoundException('City not found');
      const existing = await tx.patientAddress.findFirst({
        where: {
          userId,
          isDeleted: false,
        },
        select: { id: true },
      });
      const isFirstAddress = !existing;
      const shouldBeDefault = isFirstAddress || payload.isDefault === true;

      if (shouldBeDefault) {
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
          userId,
          cityId: payload.cityId,

          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2 ?? null,
          label: payload.label ?? null,
          region: payload.region ?? null,
          area: payload.area ?? null,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          isDefault: shouldBeDefault,
        },
        select: addressDetailsSelect,
      });

      return created;
    });

    return {
      success: true,
      data: mapPatientAddressDetails(result),
    };
  }
  async getMyAddress(
    userId: number,
    id: number,
  ): Promise<ApiSuccessResponse<PatientAddressDetailsResponseDto>> {
    const address = await this.prismaService.patientAddress.findFirst({
      where: {
        id: id,
        userId,
        isDeleted: false,
      },
      select: addressDetailsSelect,
    });
    if (!address) throw new NotFoundException('Address not found');

    return {
      success: true,
      data: mapPatientAddressDetails(address),
    };
  }

  async setDefault(
    userId: number,
    id: number,
  ): Promise<ApiSuccessResponse<PatientAddressDetailsResponseDto>> {
    const result = await this.prismaService.$transaction(async (prisma) => {
      const address = await prisma.patientAddress.findFirst({
        where: {
          userId,
          id: id,
          isDeleted: false,
        },
        select: { id: true, isDefault: true },
      });
      if (!address) throw new NotFoundException('Address not found');
      if (address.isDefault) {
        const current = await prisma.patientAddress.findFirstOrThrow({
          where: { userId, id, isDeleted: false },
          select: addressDetailsSelect,
        });
        return mapPatientAddressDetails(current);
      }

      await prisma.patientAddress.updateMany({
        where: { userId, isDeleted: false, isDefault: true },
        data: {
          isDefault: false,
        },
      });

      const updated = await prisma.patientAddress.update({
        where: { id },
        data: {
          isDefault: true,
        },
        select: addressDetailsSelect,
      });
      return mapPatientAddressDetails(updated);
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
        where: { id, userId, isDeleted: false },
      });

      if (!address) throw new NotFoundException('Address not found');
      if (payload.cityId != null) {
        const city = await tx.city.findFirst({
          where: { id: payload.cityId },
          select: { id: true },
        });
        if (!city) throw new NotFoundException('City not found');
      }
      const updated = await tx.patientAddress.update({
        where: { id },
        data: {
          cityId: payload.cityId,
          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2,
          label: payload.label,
          region: payload.region,
          area: payload.area,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
        select: addressDetailsSelect,
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
        where: { id, userId, isDeleted: false },
      });
      if (!address) throw new NotFoundException('Address not found');

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
