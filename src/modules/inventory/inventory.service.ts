import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/request.dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/request.dto/update-inventory.dto';
import { GetInventoryQueryDto } from './dto/query.dto/get-inventory-query.dto';
import { GetInventoryAdminQueryDto } from './dto/query.dto/get-inventory-admin-query.dto';
import { PaginationQueryDto } from 'src/types/pagination.query';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import { DatabaseService } from '../database/database.service';
import { InventoryItemResponseDto } from './dto/response.dto/inventory-response.dto';
import {
  mapInventoryAdminListItem,
  mapInventoryDetails,
  mapInventoryPatientListItem,
  mapInventoryPharmacyListItem,
} from './util/mapToResponse.helper';
import {
  MedicineStatus,
  Prisma,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import {
  InventoryAdminListItemResponseDto,
  InventoryListItemDto,
  PatientInventoryListItemDto,
  StockStatus,
} from './dto/response.dto/InventoryListItem.dto';
import { computeStockStatus } from './util/stockStaus.helper';

@Injectable()
export class InventoryService {
  constructor(private prisma: DatabaseService) {}

  private validatePriceRange(price: number, medicine: any) {
    const min = medicine.minPrice != null ? Number(medicine.minPrice) : null;
    const max = medicine.maxPrice != null ? Number(medicine.maxPrice) : null;
    if (min != null && price < min) {
      throw new BadRequestException(`Price is below minimum allowed (${min})`);
    }
    if (max != null && price > max) {
      throw new BadRequestException(`Price is above maximum allowed (${max})`);
    }
  }

  private readonly includeQuery = {
    include: { medicine: true },
  };

  async create(
    userId: number,
    payload: CreateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    // 1. Get the Pharmacy linked to this User
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { userId },
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy profile not found');

    // 2. Validate Medicine (Must exist, be APPROVED, and ACTIVE)
    const medicine = await this.prisma.medicine.findUnique({
      where: { id: payload.medicineId },
    });
    if (
      !medicine ||
      medicine.status !== MedicineStatus.APPROVED ||
      !medicine.isActive
    ) {
      throw new BadRequestException(
        'Medicine is not available for inventory listing',
      );
    }

    // 3. Enforce Price Range : minPrice < sellPrice <  maxPrice
    this.validatePriceRange(payload.sellPrice, medicine);
    // 4. Availability check
    const isAvailable = payload.stockQuantity > 0;
    // 5. Check for existing record

    const existing = await this.prisma.inventoryItem.findUnique({
      where: {
        pharmacyId_medicineId: {
          pharmacyId: pharmacy.id,
          medicineId: payload.medicineId,
        },
      },
    });
    if (existing) {
      if (!existing.isDeleted)
        throw new ConflictException('Item already exists');

      const updated = await this.prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { ...payload, isDeleted: false, isAvailable },
        ...this.includeQuery,
      });
      return mapInventoryDetails(updated);
    }
    const created = await this.prisma.inventoryItem.create({
      data: { ...payload, pharmacyId: pharmacy.id, isAvailable },
      ...this.includeQuery,
    });
    return mapInventoryDetails(created);
  }

  async findAll(
    userId: number,
    query: GetInventoryQueryDto,
  ): Promise<ApiPaginationSuccessResponse<InventoryListItemDto>> {
    const pagination = await this.prisma.handleQueryPagination(query);

    // 1. onwership check
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { userId },
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy profile not found');
    // 2. build filters
    const where: Prisma.InventoryItemWhereInput = {
      pharmacyId: pharmacy.id,
      isDeleted: false,
    };
    if (query.medicineId != null) where.medicineId = query.medicineId;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.medicine = {
        OR: [{ genericName: { contains: q } }, { brandName: { contains: q } }],
      };
    }

    // 3. Fetch data and count for pagination
    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        ...removeFields(pagination, ['page']),
        where,
        include: {
          medicine: {
            include: {
              category: true,
              medicineImages: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
        },

        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    let filtered = items;
    if (query.stockStatus) {
      filtered = items.filter(
        (i) =>
          computeStockStatus(i.stockQuantity, i.minStock) === query.stockStatus,
      );
    }
    const data = filtered.map(mapInventoryPharmacyListItem);
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

  async findOne(userId: number, id: number): Promise<InventoryItemResponseDto> {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id,
        pharmacy: { userId },
        isDeleted: false,
      },
      ...this.includeQuery,
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return mapInventoryDetails(item);
  }
  async findAllForPatient(
    pharmacyId: number,
    query: PaginationQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientInventoryListItemDto>> {
    const pagination = await this.prisma.handleQueryPagination(query);
    const pharmacyExists = await this.prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      select: { id: true },
    });

    if (!pharmacyExists) {
      throw new NotFoundException(`Pharmacy with ID ${pharmacyId} not found`);
    }

    const where: Prisma.InventoryItemWhereInput = {
      pharmacyId,
      isDeleted: false,
      isAvailable: true,
      stockQuantity: { gt: 0 },
      pharmacy: {
        verificationStatus: VerificationStatus.VERIFIED,
        user: { status: UserStatus.ACTIVE },
      },
      medicine: {
        status: MedicineStatus.APPROVED,
        isActive: true,
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        ...removeFields(pagination, ['page']),
        where,
        include: {
          medicine: {
            include: {
              category: true,
              medicineImages: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    const data = items.map((i) => mapInventoryPatientListItem(i));
    return {
      success: true,
      data: data,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        page: pagination.page,
        limit: pagination.take,
      }),
    };
  }

  async findAllAdmin(
    query: GetInventoryAdminQueryDto,
  ): Promise<ApiPaginationSuccessResponse<InventoryAdminListItemResponseDto>> {
    const pagination = await this.prisma.handleQueryPagination(query);
    const where: any = {};
    if (query.pharmacyId) where.pharmacyId = query.pharmacyId;
    if (query.medicineId) where.medicineId = query.medicineId;
    if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable;
    if (!query.includeDeleted) where.isDeleted = false;
    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        ...removeFields(pagination, ['page']),
        where,
        include: {
          medicine: {
            include: {
              category: true,
              medicineImages: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
          pharmacy: true,
        },

        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    const data = items.map((i) => mapInventoryAdminListItem(i));
    return {
      success: true,
      data: data,
      meta: await this.prisma.formatPaginationResponse({
        count: total,
        limit: pagination.take,
        page: pagination.page,
      }),
    };
  }

  async findOneAdmin(id: number): Promise<InventoryItemResponseDto> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        medicine: true,
        pharmacy: true,
      },
    });

    if (!item) throw new NotFoundException('Inventory item not found');

    return mapInventoryDetails(item);
  }

  async update(
    id: number,
    userId: number,
    payload: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id,
        pharmacy: { userId },
        isDeleted: false,
      },
      ...this.includeQuery,
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    // if price is being updated, validate price range
    if (payload.sellPrice) {
      this.validatePriceRange(payload.sellPrice, item.medicine);
    }
    // upadate availability if stockQuantity is being updated
    const newStock =
      payload.stockQuantity !== undefined
        ? payload.stockQuantity
        : item.stockQuantity;
    const isAvailable = newStock > 0;

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...payload,
        isAvailable,
      },
      ...this.includeQuery,
    });
    return mapInventoryDetails(updated);
  }

  async remove(id: number, userId: number): Promise<InventoryItemResponseDto> {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id,
        pharmacy: { userId },
        isDeleted: false,
      },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    const deleted = await this.prisma.inventoryItem.update({
      where: { id },
      data: { isDeleted: true, isAvailable: false },
      ...this.includeQuery,
    });
    return mapInventoryDetails(deleted);
  }
}
