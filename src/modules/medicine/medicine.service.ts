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
import {
  sortByCityThenName,
  sortByDistanceThenName,
  sortPharmaciesByPatientLocation,
} from '../pharmacy/util/helper';
import { mapToPatientMedicine } from './util/medicine.patient.mapper';
import { PatientMedicineListItemDto } from './dto/patient-medicine-list.dto';

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
    const defaultAddress = await this.prisma.patientAddress.findFirst({
      where: { userId: patientId, isDefault: true, isDeleted: false },
      select: { latitude: true, longitude: true, cityId: true },
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
    const patientCityId = defaultAddress?.cityId;
    const rows = await this.prisma.inventoryItem.findMany({
      where,
      select: patientMedicinePharmacySelect,
      orderBy: { pharmacy: { pharmacyName: 'asc' } },
    });
    let items = rows.map((r) =>
      mapToPatientMedicinePharmacyItem(r, patientLat, patientLng),
    );

    items = sortPharmaciesByPatientLocation(
      items,
      patientLat,
      patientLng,
      patientCityId,
    );

    const total = items.length;
    const start = (pagination.page - 1) * pagination.take;
    const paged = items.slice(start, start + pagination.take);

    return {
      success: true,
      data: paged,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async browseMedicines(
    params: PatientMedicineListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientMedicineListItemDto>> {
    const pagination = await this.prisma.handleQueryPagination(params);
    const q = params.q;
    const and: Prisma.MedicineWhereInput[] = [];
    if (params.onlyAvailable === true) {
      and.push({
        inventoryItems: {
          some: {
            isDeleted: false,
            isAvailable: true,
            stockQuantity: { gt: 0 },
            pharmacy: {
              verificationStatus: VerificationStatus.VERIFIED,
              user: { status: UserStatus.ACTIVE },
            },
          },
        },
      });
    }
    if (params.minPrice !== undefined) {
      const min = new Prisma.Decimal(params.minPrice);
      and.push({ minPrice: { gte: min } });
    }

    if (params.maxPrice !== undefined) {
      const max = new Prisma.Decimal(params.maxPrice);
      and.push({ maxPrice: { lte: max } });
    }
    const where: Prisma.MedicineWhereInput = {
      status: MedicineStatus.APPROVED,
      isActive: true,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(typeof params.requiresPrescription === 'boolean'
        ? { requiresPrescription: params.requiresPrescription }
        : {}),
      ...(q
        ? {
            OR: [
              { genericName: { contains: q } },
              { brandName: { contains: q } },
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

    const mapped = items.map(mapToPatientMedicine);

    return {
      success: true,
      data: mapped,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async getApprovedActiveById(id: number): Promise<PatientMedicineListItemDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, status: MedicineStatus.APPROVED, isActive: true },
      include: medicineInclude,
    });

    if (!medicine) throw new NotFoundException('Medicine not found');

    return mapToPatientMedicine(medicine);
  }
}
