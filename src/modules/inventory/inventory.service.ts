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
import {
  InventoryAdminDetailsResponseDto,
  InventoryItemResponseDto,
} from './dto/response.dto/inventory-response.dto';
import {
  mapInventoryAdminDetails,
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
import {
  inventoryIncludeAdminList,
  inventoryIncludeDetails,
  inventoryIncludeList,
} from './util/types';

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

  private parseExpiryDate(expiryDate?: string | null): Date | null | undefined {
    if (expiryDate === undefined) return undefined;
    if (expiryDate === null) return null;
    return new Date(`${expiryDate}T00:00:00.000Z`);
  }
  private readonly includeQuery = {
    include: inventoryIncludeDetails,
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
      const expiryDate = this.parseExpiryDate(payload.expiryDate);

      const updated = await this.prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          ...payload,
          ...(expiryDate !== undefined ? { expiryDate } : {}),
          isDeleted: false,
          isAvailable,
        },
        ...this.includeQuery,
      });
      return mapInventoryDetails(updated);
    }
    const data = {
      pharmacyId: pharmacy.id,
      medicineId: payload.medicineId,
      stockQuantity: payload.stockQuantity,
      minStock: payload.minStock ?? 0,
      sellPrice: payload.sellPrice,
      costPrice: payload.costPrice ?? null,
      batchNumber: payload.batchNumber ?? null,
      expiryDate: this.parseExpiryDate(payload.expiryDate) ?? null,
      shelfLocation: payload.shelfLocation ?? null,
      notes: payload.notes ?? null,
      isAvailable,
    };
    const created = await this.prisma.inventoryItem.create({
      data: data,
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
      ...(query.medicineId != null ? { medicineId: query.medicineId } : {}),
      ...(query.q?.trim()
        ? {
            medicine: {
              OR: [
                { genericName: { contains: query.q.trim() } },
                { brandName: { contains: query.q.trim() } },
              ],
            },
          }
        : {}),
    };
    if (query.stockStatus) {
      const rows = await this.prisma.inventoryItem.findMany({
        where,
        include: inventoryIncludeList,
        orderBy: { updatedAt: 'desc' },
      });

      const filtered = rows.filter(
        (i) =>
          computeStockStatus(i.stockQuantity, i.minStock) === query.stockStatus,
      );

      const total = filtered.length;
      const start = (pagination.page - 1) * pagination.take;
      const paged = filtered.slice(start, start + pagination.take);

      return {
        success: true,
        data: paged.map(mapInventoryPharmacyListItem),
        meta: await this.prisma.formatPaginationResponse({
          count: total,
          page: pagination.page,
          limit: pagination.take,
        }),
      };
    }

    // 3. Fetch data and count for pagination
    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        ...removeFields(pagination, ['page']),
        where,
        include: inventoryIncludeList,

        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return {
      success: true,
      data: items.map(mapInventoryPharmacyListItem),
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
        include: inventoryIncludeList,
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
    const where: Prisma.InventoryItemWhereInput = {
      ...(query.pharmacyId ? { pharmacyId: query.pharmacyId } : {}),
      ...(query.medicineId ? { medicineId: query.medicineId } : {}),
      ...(typeof query.isAvailable === 'boolean'
        ? { isAvailable: query.isAvailable }
        : {}),
      ...(!query.includeDeleted ? { isDeleted: false } : {}),
    };
    if (query.pharmacyUserStatus) {
      where.pharmacy = { user: { status: query.pharmacyUserStatus } };
    }

    if (typeof query.medicineIsActive === 'boolean') {
      where.medicine = { isActive: query.medicineIsActive };
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        ...removeFields(pagination, ['page']),
        where,
        include: inventoryIncludeAdminList,
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

  async findOneAdmin(id: number): Promise<InventoryAdminDetailsResponseDto> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        ...inventoryIncludeDetails,
        pharmacy: true,
      },
    });

    if (!item) throw new NotFoundException('Inventory item not found');

    return mapInventoryAdminDetails(item);
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
    if (payload.sellPrice !== undefined) {
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
        expiryDate: this.parseExpiryDate(payload.expiryDate),
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
