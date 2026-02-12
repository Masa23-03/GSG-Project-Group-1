import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  MedicineStatus,
  Prisma,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { medicineInclude, MedicineWithImages } from './util/medicine.shared';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { PatientMedicineListQueryDto } from './swagger/query.medicine.dto';
import { removeFields } from 'src/utils/object.util';
import {
  PatientMedicinePharmaciesQueryDto,
  PatientMedicinePharmacyItemDto,
} from './dto/medicine-pahrmacies.dto';
import {
  mapToPatientMedicinePharmacyItem,
  patientMedicinePharmacySelect,
} from './util/medicine-pharmacy.mapper';

@Injectable()
export class MedicineService {
  constructor(protected readonly prisma: DatabaseService) {}

  async getPharmaciesByMedicine(
    patientId: number,
    medicineId: number,
    query: PatientMedicinePharmaciesQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientMedicinePharmacyItemDto>> {
    const pagination = await this.prisma.handleQueryPagination(query);
    await this.prisma.medicine.findFirstOrThrow({
      where: {
        id: medicineId,
        status: MedicineStatus.APPROVED,
        isActive: true,
      },
      select: { id: true },
    });
    const where: Prisma.InventoryItemWhereInput = {
      medicineId,
      isDeleted: false,
      isAvailable: true,
      stockQuantity: { gt: 0 },

      pharmacy: {
        verificationStatus: VerificationStatus.VERIFIED,
        user: {
          status: UserStatus.ACTIVE,
        },
      },
    };

    const [rows, count] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        ...removeFields(pagination, ['page']),
        where,
        select: patientMedicinePharmacySelect,
        orderBy: { pharmacy: { pharmacyName: 'asc' } },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    const defaultAddress = await this.prisma.patientAddress.findFirst({
      where: {
        userId: patientId,
        isDefault: true,
        isDeleted: false,
      },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    const patientLat =
      defaultAddress?.latitude !== null &&
      defaultAddress?.latitude !== undefined
        ? Number(defaultAddress.latitude)
        : undefined;

    const patientLng =
      defaultAddress?.longitude !== null &&
      defaultAddress?.longitude !== undefined
        ? Number(defaultAddress.longitude)
        : undefined;

    let items = rows.map((r) =>
      mapToPatientMedicinePharmacyItem(r, patientLat, patientLng),
    );

    return {
      success: true,
      data: items,
      meta: await this.prisma.formatPaginationResponse({
        count: count,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

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
