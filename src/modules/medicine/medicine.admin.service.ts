import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MedicineStatus, Prisma } from '@prisma/client';
import { medicineInclude, MedicineWithImages } from './util/medicine.shared';
import { CreateMedicineAdminDto } from './swagger/create.medicine.dto';
import { UpdateMedicineDto } from './swagger/update.medicine.dto';
import { AdminReviewDto } from './swagger/status.medicine.dto';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { AdminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { AdminMedicineListQueryDto } from './swagger/query.medicine.dto';
import { removeFields } from 'src/utils/object.util';
import { normalizeMedicineName } from 'src/utils/zod.helper';

@Injectable()
export class MedicineAdminService {
  constructor(private readonly prisma: DatabaseService) {}

  private async CategoryExists(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) throw new NotFoundException('Category not found');
  }

  async adminList(
    params: AdminMedicineListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
    const q = params.q;
    const pagination = await this.prisma.handleQueryPagination(params);
    const { status, isActive, categoryId } = params;

    const where: Prisma.MedicineWhereInput = {
      ...(status ? { status } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { genericName: { contains: q } },
              { brandName: { contains: q } },
            ],
          }
        : {}),
    };

    const total = await this.prisma.medicine.count({ where });
    const data = await this.prisma.medicine.findMany({
      ...removeFields(pagination, ['page']),
      where,
      orderBy: { id: 'desc' },

      include: medicineInclude,
    });

    return {
      success: true,
      data,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async adminGetById(
    id: number,
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: medicineInclude,
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    return { success: true, data: medicine };
  }
  async adminCreate(
    adminId: number,
    payload: CreateMedicineAdminDto,
  ): Promise<MedicineWithImages> {
    await this.CategoryExists(payload.categoryId);

    const normalizedIncoming = normalizeMedicineName(payload.genericName);

    const candidates = await this.prisma.medicine.findMany({
      where: { categoryId: payload.categoryId },
      select: { id: true, genericName: true },
    });

    const duplicate = candidates.find(
      (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
    );

    if (duplicate) {
      throw new ConflictException('Medicine already exists in this category.');
    }

    if (payload.minPrice > payload.maxPrice) {
      throw new ConflictException('minPrice must be <= maxPrice');
    }

    const medicine = await this.prisma.medicine.create({
      data: {
        categoryId: payload.categoryId,
        genericName: payload.genericName,
        brandName: payload.brandName ?? null,
        manufacturer: payload.manufacturer ?? null,
        dosageForm: payload.dosageForm ?? null,
        strengthValue:
          payload.strengthValue != null
            ? new Prisma.Decimal(payload.strengthValue)
            : null,
        strengthUnit: payload.strengthUnit ?? null,
        packSize: payload.packSize ?? null,
        packUnit: payload.packUnit ?? null,
        requiresPrescription: payload.requiresPrescription ?? false,

        activeIngredients: payload.activeIngredients ?? null,
        dosageInstructions: payload.dosageInstructions ?? null,
        storageInstructions: payload.storageInstructions ?? null,
        warnings: payload.warnings ?? null,
        description: payload.description,

        status: MedicineStatus.APPROVED,
        isActive: true,

        minPrice: new Prisma.Decimal(payload.minPrice),
        maxPrice: new Prisma.Decimal(payload.maxPrice),

        createdByUserId: adminId,

        medicineImages: payload.images?.length
          ? {
              create: payload.images.map((img) => ({
                url: img.url,
                sortOrder: img.sortOrder,
              })),
            }
          : undefined,
      },
      include: medicineInclude,
    });

    return medicine;
  }
  async updateMedicineAdmin(
    id: number,
    payload: UpdateMedicineDto,
  ): Promise<MedicineWithImages> {
    const existing = await this.prisma.medicine.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        genericName: true,
        minPrice: true,
        maxPrice: true,
      },
    });

    if (!existing) throw new NotFoundException('Medicine not found');

    const nextMin =
      payload.minPrice !== undefined
        ? new Prisma.Decimal(payload.minPrice)
        : existing.minPrice;

    const nextMax =
      payload.maxPrice !== undefined
        ? new Prisma.Decimal(payload.maxPrice)
        : existing.maxPrice;

    if (nextMin && nextMax && nextMin.greaterThan(nextMax)) {
      throw new ConflictException('minPrice must be <= maxPrice');
    }

    if (payload.genericName !== undefined || payload.categoryId !== undefined) {
      const nextCategoryId = payload.categoryId ?? existing.categoryId;
      const nextGenericName = payload.genericName ?? existing.genericName;

      const normalizedIncoming = normalizeMedicineName(nextGenericName);

      const candidates = await this.prisma.medicine.findMany({
        where: {
          categoryId: nextCategoryId,
          id: { not: id },
        },
        select: { genericName: true },
      });

      const duplicate = candidates.find(
        (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
      );

      if (duplicate) {
        throw new ConflictException(
          'Medicine already exists in this category.',
        );
      }
    }

    return this.prisma.medicine.update({
      where: { id },
      data: {
        categoryId: payload.categoryId,
        genericName: payload.genericName,
        brandName: payload.brandName,
        manufacturer: payload.manufacturer,
        dosageForm: payload.dosageForm,
        strengthValue:
          payload.strengthValue != null
            ? new Prisma.Decimal(payload.strengthValue)
            : undefined,
        strengthUnit: payload.strengthUnit,
        packSize: payload.packSize,
        packUnit: payload.packUnit,
        requiresPrescription: payload.requiresPrescription,
        activeIngredients: payload.activeIngredients,
        dosageInstructions: payload.dosageInstructions,
        storageInstructions: payload.storageInstructions,
        warnings: payload.warnings,
        description: payload.description,
        minPrice:
          payload.minPrice !== undefined
            ? new Prisma.Decimal(payload.minPrice)
            : undefined,
        maxPrice:
          payload.maxPrice !== undefined
            ? new Prisma.Decimal(payload.maxPrice)
            : undefined,
      },
      include: medicineInclude,
    });
  }

  // ! the new update here is for :
  //? If a medicine is deactivated by admin, it becomes unavailable for sale
  //? even if pharmacies still have it in their inventories
  //? Inventories are not deleted, but selling is blocked
  async activateMedicineAdmin(
    id: number,
    isActive: boolean,
  ): Promise<MedicineWithImages> {
    const existing = await this.prisma.medicine.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) throw new NotFoundException('Medicine not found');

    if (existing.status !== MedicineStatus.APPROVED) {
      throw new ConflictException(
        'Only APPROVED medicines can be activated/deactivated',
      );
    }

    const medicine = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.medicine.update({
        where: { id },
        data: { isActive },
        include: medicineInclude,
      });

      if (!isActive) {
        await tx.inventoryItem.updateMany({
          where: { medicineId: id, isDeleted: false },
          data: { isAvailable: false },
        });
      }

      return updated;
    });

    return medicine;
  }

  async adminReview(
    adminId: number,
    id: number,
    payload: AdminReviewDto,
  ): Promise<MedicineWithImages> {
    const existing = await this.prisma.medicine.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        requestedByPharmacyId: true,
        minPrice: true,
        maxPrice: true,
      },
    });

    if (!existing) throw new NotFoundException('Medicine not found');
    if (existing.requestedByPharmacyId == null) {
      throw new ConflictException('This medicine is not a pharmacy request');
    }
    if (existing.status !== MedicineStatus.PENDING) {
      throw new ConflictException('Only PENDING requests can be reviewed');
    }

    if (payload.status === 'APPROVED') {
      const finalMin =
        payload.minPrice !== undefined
          ? new Prisma.Decimal(payload.minPrice)
          : existing.minPrice;

      const finalMax =
        payload.maxPrice !== undefined
          ? new Prisma.Decimal(payload.maxPrice)
          : existing.maxPrice;

      if (!finalMin || !finalMax) {
        throw new ConflictException(
          'minPrice and maxPrice must be set to approve',
        );
      }

      if (finalMin.greaterThan(finalMax)) {
        throw new ConflictException('minPrice must be <= maxPrice');
      }

      return this.prisma.medicine.update({
        where: { id },
        data: {
          status: MedicineStatus.APPROVED,
          isActive: true,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: null,
          minPrice:
            payload.minPrice !== undefined
              ? new Prisma.Decimal(payload.minPrice)
              : undefined,
          maxPrice:
            payload.maxPrice !== undefined
              ? new Prisma.Decimal(payload.maxPrice)
              : undefined,
        },
        include: medicineInclude,
      });
    }

    if (payload.status === 'REJECTED') {
      if (!payload.rejectionReason) {
        throw new BadRequestException(
          'rejectionReason is required when rejecting',
        );
      }

      return this.prisma.medicine.update({
        where: { id },
        data: {
          status: MedicineStatus.REJECTED,
          isActive: false,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: payload.rejectionReason,
        },
        include: medicineInclude,
      });
    }

    throw new BadRequestException(`Invalid status: ${payload.status}`);
  }
}
