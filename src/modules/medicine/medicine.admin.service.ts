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
    const qTrim = params.q?.trim();
    const pagination = await this.prisma.handleQueryPagination(params);
    const { status, isActive, categoryId } = params;

    const where: Prisma.MedicineWhereInput = {
      ...(status ? { status } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
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
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    const genericName = payload.genericName.trim();
    const normalizedIncoming = normalizeMedicineName(payload.genericName);
    await this.CategoryExists(payload.categoryId);

    const candidates = await this.prisma.medicine.findMany({
      where: {
        categoryId: payload.categoryId,
      },
      select: {
        id: true,
        genericName: true,
      },
    });

    const duplicate = candidates.find(
      (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
    );

    if (duplicate) {
      throw new ConflictException('Medicine already exists in this category.');
    }

    if (Number(payload.minPrice) > Number(payload.maxPrice)) {
      throw new ConflictException('minPrice must be <= maxPrice');
    }

    const medicine = await this.prisma.medicine.create({
      data: {
        categoryId: payload.categoryId,
        genericName,
        brandName: payload.brandName?.trim(),
        manufacturer: payload.manufacturer?.trim(),
        dosageForm: payload.dosageForm?.trim(),
        strengthValue: payload.strengthValue
          ? new Prisma.Decimal(payload.strengthValue)
          : undefined,
        strengthUnit: payload.strengthUnit?.trim(),
        packSize: payload.packSize,
        packUnit: payload.packUnit?.trim(),
        requiresPrescription: payload.requiresPrescription ?? false,
        activeIngredients: payload.activeIngredients?.trim(),
        dosageInstructions: payload.dosageInstructions?.trim(),
        storageInstructions: payload.storageInstructions?.trim(),
        warnings: payload.warnings?.trim(),
        description: payload.description.trim(),

        status: MedicineStatus.APPROVED,
        isActive: true,

        minPrice: new Prisma.Decimal(payload.minPrice),
        maxPrice: new Prisma.Decimal(payload.maxPrice),

        createdByUserId: adminId,

        medicineImages: payload.images?.length
          ? {
              create: payload.images.map((img: any) => ({
                url: img.url.trim(),
                sortOrder: img.sortOrder,
              })),
            }
          : undefined,
      },
      include: medicineInclude,
    });
    return { success: true, data: medicine };
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
        : (existing.minPrice ?? null);

    const nextMax =
      payload.maxPrice !== undefined
        ? new Prisma.Decimal(payload.maxPrice)
        : (existing.maxPrice ?? null);

    if (nextMin !== null && nextMax !== null) {
      if (nextMin.greaterThan(nextMax)) {
        throw new ConflictException('minPrice must be <= maxPrice');
      }
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

    const medicine = await this.prisma.medicine.update({
      where: { id },
      data: {
        categoryId: payload.categoryId,
        genericName: payload.genericName?.trim(),
        brandName: payload.brandName?.trim(),
        manufacturer: payload.manufacturer?.trim(),
        dosageForm: payload.dosageForm?.trim(),
        strengthValue: payload.strengthValue
          ? new Prisma.Decimal(payload.strengthValue)
          : undefined,
        strengthUnit: payload.strengthUnit?.trim(),
        packSize: payload.packSize,
        packUnit: payload.packUnit?.trim(),
        requiresPrescription: payload.requiresPrescription,
        activeIngredients: payload.activeIngredients?.trim(),
        dosageInstructions: payload.dosageInstructions?.trim(),
        storageInstructions: payload.storageInstructions?.trim(),
        warnings: payload.warnings?.trim(),
        description: payload.description?.trim(),
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

    return medicine;
  }

  // ! the new update here is for :
  //? If a medicine is deactivated by admin, it becomes unavailable for sale
  //? even if pharmacies still have it in their inventories
  //? Inventories are not deleted, but selling is blocked
  async activateMedicineAdmin(
    id: number,
    isActive: boolean,
  ): Promise<MedicineWithImages> {
    try {
      const medicine = await this.prisma.medicine.update({
        where: { id },
        data: { isActive },
        include: medicineInclude,
      });

      if (!isActive) {
        await this.prisma.inventoryItem.updateMany({
          where: {
            medicineId: id,
            isDeleted: false,
          },
          data: { isAvailable: false },
        });
      }
      return medicine;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Medicine not found');
      }
      throw error;
    }
  }
  async adminReview(
    adminId: number,
    id: number,
    payload: AdminReviewDto,
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    const existingMedicine = await this.prisma.medicine.findUnique({
      where: { id },
      select: { id: true, minPrice: true, maxPrice: true },
    });

    if (!existingMedicine) throw new NotFoundException('Medicine not found');

    if (payload.status === 'APPROVED') {
      const finalMin =
        payload.minPrice !== undefined
          ? new Prisma.Decimal(payload.minPrice)
          : existingMedicine.minPrice;

      const finalMax =
        payload.maxPrice !== undefined
          ? new Prisma.Decimal(payload.maxPrice)
          : existingMedicine.maxPrice;

      if (finalMin == null || finalMax == null) {
        throw new ConflictException(
          'minPrice and maxPrice must be set to approve',
        );
      }

      if (finalMin.greaterThan(finalMax)) {
        throw new ConflictException('minPrice must be <= maxPrice');
      }

      const updatedMedicineApproved = await this.prisma.medicine.update({
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

      return { success: true, data: updatedMedicineApproved };
    }

    if (payload.status === 'REJECTED') {
      const reason = payload.rejectionReason?.trim();
      if (!reason)
        throw new BadRequestException(
          'rejectionReason is required when rejecting',
        );

      const updatedMedicineRejected = await this.prisma.medicine.update({
        where: { id },
        data: {
          status: MedicineStatus.REJECTED,
          isActive: false,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: payload.rejectionReason?.trim() ?? null,
        },
        include: medicineInclude,
      });

      return { success: true, data: updatedMedicineRejected };
    }

    throw new BadRequestException(`Invalid status: ${payload.status}`);
  }
}
