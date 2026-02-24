import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MedicineStatus, Prisma, VerificationStatus } from '@prisma/client';
import { medicineInclude, MedicineWithImages } from './util/medicine.shared';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { removeFields } from 'src/utils/object.util';
import { normalizeMedicineName } from 'src/utils/zod.helper';
import { CreateMedicinePharmacyRequestDto } from './swagger/create.medicine.dto';
import { UpdateMedicineDto } from './swagger/update.medicine.dto';

@Injectable()
export class MedicinePharmacyService {
  constructor(private readonly prisma: DatabaseService) {}

  private async CategoryExists(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) throw new NotFoundException('Category not found');
  }

  async verifiedPharmacyIdOrThrow(userId: number): Promise<number> {
    const pharmacy = await this.prisma.pharmacy.findFirst({
      where: { userId },
      select: { id: true, verificationStatus: true },
    });

    if (!pharmacy) throw new ForbiddenException('Pharmacy profile not found');
    if (pharmacy.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('Pharmacy must be VERIFIED');
    }
    return pharmacy.id;
  }

  async pharmacyRequestCreate(
    userId: number,
    myPharmacyId: number,
    body: CreateMedicinePharmacyRequestDto,
  ): Promise<MedicineWithImages> {
    await this.CategoryExists(body.categoryId);

    const normalizedIncoming = normalizeMedicineName(body.genericName);

    const pendingCandidates = await this.prisma.medicine.findMany({
      where: {
        requestedByPharmacyId: myPharmacyId,
        status: MedicineStatus.PENDING,
        categoryId: body.categoryId,
      },
      select: { genericName: true },
    });

    const pendingDup = pendingCandidates.find(
      (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
    );

    if (pendingDup) {
      throw new ConflictException(
        'You already have a pending request for this medicine',
      );
    }

    const approvedCandidates = await this.prisma.medicine.findMany({
      where: {
        status: MedicineStatus.APPROVED,
        categoryId: body.categoryId,
      },
      select: { genericName: true },
    });

    const approvedDup = approvedCandidates.find(
      (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
    );

    if (approvedDup) {
      throw new ConflictException('Medicine already exists in this category.');
    }

    return this.prisma.medicine.create({
      data: {
        categoryId: body.categoryId,
        genericName: body.genericName,
        brandName: body.brandName ?? null,
        manufacturer: body.manufacturer ?? null,
        dosageForm: body.dosageForm ?? null,
        strengthValue:
          body.strengthValue != null
            ? new Prisma.Decimal(body.strengthValue)
            : null,
        strengthUnit: body.strengthUnit ?? null,
        packSize: body.packSize ?? null,
        packUnit: body.packUnit ?? null,
        requiresPrescription: body.requiresPrescription ?? false,

        activeIngredients: body.activeIngredients ?? null,
        dosageInstructions: body.dosageInstructions ?? null,
        storageInstructions: body.storageInstructions ?? null,
        warnings: body.warnings ?? null,
        description: body.description,

        status: MedicineStatus.PENDING,
        isActive: false,
        requestedByPharmacyId: myPharmacyId,

        medicineImages: body.images?.length
          ? {
              create: body.images.map((img) => ({
                url: img.url,
                sortOrder: img.sortOrder,
              })),
            }
          : undefined,
      },
      include: medicineInclude,
    });
  }
  async pharmacyListMyRequests(params: {
    myPharmacyId: number;
    status?: MedicineStatus;
    page: number;
    limit: number;
  }): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
    const pagination = await this.prisma.handleQueryPagination(params);
    const { myPharmacyId, status } = params;

    const where: Prisma.MedicineWhereInput = {
      requestedByPharmacyId: myPharmacyId,
      ...(status ? { status } : {}),
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

  async pharmacyGetMyRequestById(
    myPharmacyId: number,
    id: number,
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, requestedByPharmacyId: myPharmacyId },
      include: medicineInclude,
    });
    if (!medicine) throw new NotFoundException('Medicine request not found');
    return { success: true, data: medicine };
  }

  async pharmacyUpdateMyPendingRequest(
    myPharmacyId: number,
    id: number,
    body: UpdateMedicineDto,
  ): Promise<MedicineWithImages> {
    const owned = await this.prisma.medicine.findFirst({
      where: { id, requestedByPharmacyId: myPharmacyId },
      select: {
        id: true,
        status: true,
        genericName: true,
        categoryId: true,
      },
    });

    if (!owned) throw new NotFoundException('Medicine request not found');
    if (owned.status !== MedicineStatus.PENDING) {
      throw new ConflictException('Only PENDING requests can be updated');
    }
    if (body.genericName !== undefined || body.categoryId !== undefined) {
      const nextCategoryId = body.categoryId ?? owned.categoryId;
      const nextGenericName = body.genericName ?? owned.genericName;
      const normalizedIncoming = normalizeMedicineName(nextGenericName);

      const approvedCandidates = await this.prisma.medicine.findMany({
        where: {
          status: MedicineStatus.APPROVED,
          categoryId: nextCategoryId,
        },
        select: { id: true, genericName: true },
      });

      const approvedDup = approvedCandidates.find(
        (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
      );

      if (approvedDup) {
        throw new ConflictException(
          'Medicine already exists in this category.',
        );
      }

      const pendingCandidates = await this.prisma.medicine.findMany({
        where: {
          requestedByPharmacyId: myPharmacyId,
          status: MedicineStatus.PENDING,
          categoryId: nextCategoryId,
          id: { not: id },
        },
        select: { id: true, genericName: true },
      });

      const pendingDup = pendingCandidates.find(
        (m) => normalizeMedicineName(m.genericName) === normalizedIncoming,
      );

      if (pendingDup) {
        throw new ConflictException(
          'You already have another pending request for this medicine in this category.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (body.images !== undefined) {
        await tx.medicineImage.deleteMany({
          where: { medicineId: id },
        });

        if (body.images.length) {
          await tx.medicineImage.createMany({
            data: body.images.map((img) => ({
              medicineId: id,
              url: img.url,
              sortOrder: img.sortOrder,
            })),
          });
        }
      }

      return tx.medicine.update({
        where: { id },
        data: {
          categoryId: body.categoryId,
          genericName: body.genericName,
          brandName: body.brandName,
          manufacturer: body.manufacturer,
          dosageForm: body.dosageForm,
          strengthValue:
            body.strengthValue != null
              ? new Prisma.Decimal(body.strengthValue)
              : undefined,
          strengthUnit: body.strengthUnit,
          packSize: body.packSize,
          packUnit: body.packUnit,
          requiresPrescription: body.requiresPrescription,
          activeIngredients: body.activeIngredients,
          dosageInstructions: body.dosageInstructions,
          storageInstructions: body.storageInstructions,
          warnings: body.warnings,
          description: body.description,
        },
        include: medicineInclude,
      });
    });
  }
}
