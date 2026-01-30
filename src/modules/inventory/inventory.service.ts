import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { DatabaseService } from '../database/database.service';
import { InventoryItemResponseDto } from './dto/inventory-response.dto';
import { InventoryMapper } from './util/mapToResponse.helper';

@Injectable()
export class InventoryService {

  constructor(private prisma: DatabaseService) {}

  async create(userId: number, payload: CreateInventoryItemDto)  {
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

    // 3. Enforce Price Range : minPrice <= sellPrice <= maxPrice
    if (
      medicine.minPrice !== null &&
      payload.sellPrice <= Number(medicine.minPrice)
    ) {
      throw new BadRequestException(
        `Price is below the minimum allowed (${medicine.minPrice})`,
      );
    }
    if (
      medicine.maxPrice !== null &&
      payload.sellPrice >= Number(medicine.maxPrice)
    ) {
      throw new BadRequestException(
        `Price exceeds the maximum allowed (${medicine.maxPrice})`,
      );
    }
    // 4. Availability check
    const isAvailable = payload.stockQuantity > 0;
    // 5. Check for existing record (Soft-delete logic)
     const includeQuery = {
      include: { medicine: true }
    };
    const existing = await this.prisma.inventoryItem.findFirst({
      where: { pharmacyId: pharmacy.id, medicineId: payload.medicineId },
    });
    if (existing) {
      if (!existing.isDeleted)
        throw new ConflictException('Item already exists');

      // Directly return the updated result
      const updated = await this.prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { ...payload, isDeleted: false, isAvailable },
        ...includeQuery,
      });
      return InventoryMapper.toResponseDto(updated);;
    }
    const created = await this.prisma.inventoryItem.create({
        data: { ...payload, pharmacyId: pharmacy.id, isAvailable },
        ...includeQuery,
      });
    return InventoryMapper.toResponseDto(created);
    }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
