import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePharmacyDto } from './dto/request.dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/request.dto/update-pharmacy.dto';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import { AdminPharmacyListItemDto } from './dto/response.dto/admin-pharmacy.response.dto';
import { AdminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { DatabaseService } from '../database/database.service';
import { buildAdminPharmacyWhere } from './util/helper';
import { removeFields } from 'src/utils/object.util';

@Injectable()
export class PharmacyService {
  constructor(private readonly prismaService: DatabaseService) {}
  create(createPharmacyDto: CreatePharmacyDto) {
    return 'This action adds a new pharmacy';
  }

  //Admin only
  async findAllAdmin(
    query: AdminListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<AdminPharmacyListItemDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = this.prismaService.handleQueryPagination(query);
      const whereStatement = buildAdminPharmacyWhere(query);
      const foundedPharmacies = await prisma.pharmacy.findMany({
        ...removeFields(pagination, ['page']),
        where: whereStatement,
        select: {
          id: true,
          pharmacyName: true,
          city: { select: { name: true } },
          user: {
            select: {
              id: true,
              phoneNumber: true,
            },
          },
          verificationStatus: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      });
      if (!foundedPharmacies) throw new NotFoundException();
      const count = await prisma.pharmacy.count({
        where: whereStatement,
      });
      const data: AdminPharmacyListItemDto[] = foundedPharmacies.map((p) => ({
        id: p.id,
        pharmacyName: p.pharmacyName,
        phoneNumber: p.user.phoneNumber,
        address: p.address ?? null,
        latitude: p.latitude?.toNumber() ?? null,
        longitude: p.longitude?.toNumber() ?? null,
        cityName: p.city.name,
        verificationStatus: p.verificationStatus,
      }));

      return {
        success: true,
        data: data,
        meta: this.prismaService.formatPaginationResponse({
          count: count,
          limit: pagination.take,
          page: pagination.page,
        }),
      };
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} pharmacy`;
  }

  update(id: number, updatePharmacyDto: UpdatePharmacyDto) {
    return `This action updates a #${id} pharmacy`;
  }

  remove(id: number) {
    return `This action removes a #${id} pharmacy`;
  }
}
