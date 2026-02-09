import { Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import {
  PatientMedicinePharmaciesQueryDto,
  PatientMedicinePharmacyItemDto,
} from './dto/medicine-pahrmacies.dto';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import { DatabaseService } from '../database/database.service';
import {
  MedicineStatus,
  Prisma,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import {
  mapToPatientMedicinePharmacyItem,
  patientMedicinePharmacySelect,
} from './util/medicine-pharmacy.mapper';
import { removeFields } from 'src/utils/object.util';

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

  create(createMedicineDto: CreateMedicineDto) {
    return 'This action adds a new medicine';
  }

  findAll() {
    return `This action returns all medicine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicine`;
  }

  update(id: number, updateMedicineDto: UpdateMedicineDto) {
    return `This action updates a #${id} medicine`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicine`;
  }
}
