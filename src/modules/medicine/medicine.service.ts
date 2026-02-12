import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MedicineStatus, Prisma } from '@prisma/client';
import { medicineInclude, MedicineWithImages } from './util/medicine.shared';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { PatientMedicineListQueryDto } from './swagger/query.medicine.dto';
import { removeFields } from 'src/utils/object.util';

@Injectable()
export class MedicineService {
  constructor(protected readonly prisma: DatabaseService) {}

  async browseMedicines(
    params: PatientMedicineListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
    const pagination = await this.prisma.handleQueryPagination(params);
    const qTrim = params.q?.trim();
    const and: Prisma.MedicineWhereInput[] = [];
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const min =
        params.minPrice !== undefined
          ? new Prisma.Decimal(params.minPrice)
          : null;
      const max =
        params.maxPrice !== undefined
          ? new Prisma.Decimal(params.maxPrice)
          : null;

      if (min !== null && max !== null && min.greaterThan(max)) {
        throw new BadRequestException('minPrice must be <= maxPrice');
      }

      if (min !== null) and.push({ minPrice: { gte: min } });
      if (max !== null) and.push({ maxPrice: { lte: max } });
    }

    const where: Prisma.MedicineWhereInput = {
      status: MedicineStatus.APPROVED,
      isActive: true,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(typeof params.requiresPrescription === 'boolean'
        ? { requiresPrescription: params.requiresPrescription }
        : {}),
      ...(qTrim
        ? {
            OR: [
              { genericName: { contains: qTrim } },
              { brandName: { contains: qTrim } },
            ],
          }
        : {}),
      ...(and.length ? { AND: and } : {}),
    };

    const total = await this.prisma.medicine.count({ where });
    const items = await this.prisma.medicine.findMany({
      ...removeFields(pagination, ['page']),
      where,
      orderBy: { id: 'desc' },

      include: medicineInclude,
    });

    return {
      success: true,
      data: items,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async getApprovedActiveById(
    id: number,
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, status: MedicineStatus.APPROVED, isActive: true },
      include: medicineInclude,
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    return { success: true, data: medicine };
  }
}
