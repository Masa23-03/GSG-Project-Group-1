import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MedicineStatus, Prisma } from '@prisma/client';
import { medicineInclude, MedicineWithImages, toMeta } from './util/medicine.shared';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
  Params,
} from 'src/types/unifiedType.types'

@Injectable()
export class MedicineService {
  constructor(protected readonly prisma: DatabaseService) { }



  async browseMedicines(
    params: Params,
  ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
    const qTrim = params.q?.trim();
    const { categoryId, page, limit } = params;

    const where: Prisma.MedicineWhereInput = {
      status: MedicineStatus.APPROVED,
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(qTrim
        ? {
          OR: [
            { genericName: { contains: qTrim } },
            { brandName: { contains: qTrim } },
          ],
        }
        : {}),
    };

    const total = await this.prisma.medicine.count({ where });
    const items = await this.prisma.medicine.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: medicineInclude,
    });

    return {
      success: true,
      data: items,
      meta: toMeta(page, limit, total),
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
