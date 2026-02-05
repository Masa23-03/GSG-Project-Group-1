import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/request.dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/request.dto/update-inventory.dto';
import { GetInventoryQueryDto } from './dto/query.dto/get-inventory-query.dto';
import { PaginationResult } from 'src/types/unifiedType.types';
import { DatabaseService } from '../database/database.service';
import { InventoryItemResponseDto } from './dto/response.dto/inventory-response.dto';
import { InventoryMapper } from './util/mapToResponse.helper';

@Injectable()
export class InventoryService {
  constructor(private prisma: DatabaseService) {}

  private validatePriceRange(price: number, medicine: any) {
    if (medicine.minPrice && price < medicine.minPrice) {
      throw new BadRequestException(
        `Price is below minimum allowed (${medicine.minPrice})`,
      );
    }
    if (medicine.maxPrice && price > medicine.maxPrice) {
      throw new BadRequestException(
        `Price is above maximum allowed (${medicine.maxPrice})`,
      );
    }
  }

  private readonly includeQuery = {
    include: { medicine: true },
  };

  async create(
    userId: number,
    payload: CreateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    // 1. Get the Pharmacylinked to this User
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { userId },
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy profile not found');

    // 2. Validate Medicine (Must exist, be APPROVED, and ACTIVE)
    const medicine = await this.prisma.medicine.findUnique({
      where: { id: payload.medicineId },
    });
    if (!medicine || medicine.status !== 'APPROVED' || !medicine.isActive) {
      throw new BadRequestException(
        'Medicine is not available for inventory listing',
      );
    }

    // 3. Enforce Price Range : minPrice < sellPrice <  maxPrice
    this.validatePriceRange(payload.sellPrice, medicine);
    // 4. Availability check
    const isAvailable = payload.stockQuantity > 0;
    // 5. Check for existing record

    const existing = await this.prisma.inventoryItem.findFirst({
      where: { pharmacyId: pharmacy.id, medicineId: payload.medicineId },
    });
    if (existing) {
      if (!existing.isDeleted)
        throw new ConflictException('Item already exists');

      const updated = await this.prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { ...payload, isDeleted: false, isAvailable },
        ...this.includeQuery,
      });
      return InventoryMapper.toResponseDto(updated);
    }
    const created = await this.prisma.inventoryItem.create({
      data: { ...payload, pharmacyId: pharmacy.id, isAvailable },
      ...this.includeQuery,
    });
    return InventoryMapper.toResponseDto(created);
  }

  async findAll(
    userId: number,
    query: GetInventoryQueryDto,
  ): Promise<PaginationResult<InventoryItemResponseDto>> {
    const {
      page = 1,
      limit = 10,
      q,
      medicineId,
      isAvailable,
      lowStock,
    } = query;
    // 1. onwership check
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { userId },
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy profile not found');
    // 2. build filters
    const where: any = {
      pharmacyId: pharmacy.id,
      isDeleted: false,
    };
    if (medicineId) where.medicineId = medicineId;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (q) {
      where.medicine = {
        OR: [
          { genericName: { contains: q} },
          { brandName: { contains: q } },
        ],
      };
    }
    if (lowStock) {
      where.stockQuantity = { lte: this.prisma.inventoryItem.fields.minStock };
    }
    // 3. Fetch data and count for pagination
    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        ...this.includeQuery,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      data: items.map((item) => InventoryMapper.toResponseDto(item)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
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
    return InventoryMapper.toResponseDto(item);
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
    return InventoryMapper.toResponseDto(updated);
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
    return InventoryMapper.toResponseDto(deleted);
  }
}
