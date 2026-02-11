import {
  InventoryItemResponseDto,
  MedicineSummaryDto,
} from '../dto/response.dto/inventory-response.dto';
import {
  InventoryAdminResponseDto,
  PharmacySummaryDto,
} from '../dto/response.dto/inventory-admin-response.dto';

export class InventoryMapper {
  static toResponseDto(item: any): InventoryItemResponseDto {
    return {
      id: item.id,
      medicineId: item.medicineId,
      pharmacyId: item.pharmacyId,
      stockQuantity: item.stockQuantity,
      minStock: item.minStock,
      sellPrice: Number(item.sellPrice),
      costPrice: item.costPrice ? Number(item.costPrice) : null,
      isAvailable: item.isAvailable,
      batchNumber: item.batchNumber || null,
      expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
      shelfLocation: item.shelfLocation || null,
      notes: item.notes || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      medicine: this.toMedicineSummaryDto(item.medicine),
    };
  }
  private static toMedicineSummaryDto(medicine: any): MedicineSummaryDto {
    return {
      id: medicine.id,
      genericName: medicine.genericName,
      brandName: medicine.brandName || null,
      status: medicine.status,
      isActive: medicine.isActive,
      minPrice: medicine.minPrice ? Number(medicine.minPrice) : null,
      maxPrice: medicine.maxPrice ? Number(medicine.maxPrice) : null,
      requiresPrescription: medicine.requiresPrescription,
      categoryId: String(medicine.categoryId),
      manufacturer: medicine.manufacturer || null,
      dosageForm: medicine.dosageForm || null,
      dosageInstructions: medicine.dosageInstructions || null,
      storageInstructions: medicine.storageInstructions || null,
      warnings: medicine.warnings || null,
      description: medicine.description,
      packSize: medicine.packSize ? String(medicine.packSize) : null,
    };
  }
  private static toPharmacySummaryDto(pharmacy: any): PharmacySummaryDto {
    return {
      id: pharmacy.id,
      pharmacyName: pharmacy.pharmacyName,
      verificationStatus: pharmacy.verificationStatus,
    };
  }

  static toAdminResponseDto(item: any): InventoryAdminResponseDto {
    const base = this.toResponseDto(item);

    return {
      ...base,
      isDeleted: item.isDeleted,
      pharmacy: this.toPharmacySummaryDto(item.pharmacy),
    };
  }

  static toResponseDtoArray(items: any[]): InventoryItemResponseDto[] {
    return items.map((item) => this.toResponseDto(item));
  }
}
