import {
  buildMedicineDisplayNameHelper,
  buildMedicinePackInfoHelper,
} from 'src/modules/order/util/medicineDisplayName.helper';
import {
  InventoryItemResponseDto,
  MedicineDto,
} from '../dto/response.dto/inventory-response.dto';
import {
  InventoryAdminListItemResponseDto,
  InventoryListItemDto,
  PatientInventoryListItemDto,
} from '../dto/response.dto/InventoryListItem.dto';
import { computeStockStatus } from './stockStaus.helper';
import {
  InventoryAdminListPayload,
  InventoryDetailsPayload,
  InventoryListPayload,
} from './types';
import { PharmacySummaryDto } from '../dto/response.dto/inventory-admin-response.dto';

export function mapInventoryDetails(
  item: InventoryDetailsPayload,
): InventoryItemResponseDto {
  return {
    id: item.id,
    medicineId: item.medicineId,
    pharmacyId: item.pharmacyId,
    stockQuantity: item.stockQuantity,
    minStock: item.minStock,
    sellPrice: Number(item.sellPrice),
    costPrice: item.costPrice ? Number(item.costPrice) : null,
    isAvailable: item.isAvailable,
    batchNumber: item.batchNumber ?? null,
    expiryDate: item.expiryDate
      ? item.expiryDate.toISOString().slice(0, 10)
      : null,
    shelfLocation: item.shelfLocation ?? null,
    notes: item.notes ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    medicine: mapMedicine(item.medicine),
  };
}
export function mapInventoryPharmacyListItem(
  item: InventoryListPayload,
): InventoryListItemDto {
  const m = item.medicine;
  return {
    id: item.id,
    medicineId: item.medicineId,
    medicineName: buildMedicineDisplayNameHelper({
      brandName: m.brandName,
      genericName: m.genericName,
      strengthValue: m.strengthValue,
      strengthUnit: m.strengthUnit,
      dosageForm: m.dosageForm,
    }),
    categoryName: m.category.name,
    packDisplayName: buildMedicinePackInfoHelper(1, m.packSize, m.packUnit),
    requiresPrescription: m.requiresPrescription,
    stockQuantity: item.stockQuantity,
    minStock: item.minStock,
    sellPrice: Number(item.sellPrice),
    stockStatus: computeStockStatus(item.stockQuantity, item.minStock),
    expiryDate: item.expiryDate
      ? item.expiryDate.toISOString().slice(0, 10)
      : null,
  };
}

export function mapInventoryPatientListItem(
  item: InventoryListPayload,
): PatientInventoryListItemDto {
  const base = mapInventoryPharmacyListItem(item);
  return {
    id: base.id,
    medicineId: base.medicineId,
    medicineName: base.medicineName,
    sellPrice: base.sellPrice,
    requiresPrescription: base.requiresPrescription,
    stockStatus: base.stockStatus,
    packDisplayName: base.packDisplayName,
    imageUrl: item.medicine.medicineImages?.[0]?.url ?? null,
  };
}

export function mapInventoryAdminListItem(
  item: InventoryAdminListPayload,
): InventoryAdminListItemResponseDto {
  return {
    ...mapInventoryPharmacyListItem(item),
    isDeleted: item.isDeleted,
    pharmacy: mapPharmacySummary(item.pharmacy),
  };
}
function mapMedicine(
  medicine: InventoryDetailsPayload['medicine'],
): MedicineDto {
  return {
    id: medicine.id,
    genericName: medicine.genericName,
    brandName: medicine.brandName ?? null,
    status: medicine.status,
    isActive: medicine.isActive,
    minPrice: medicine.minPrice ? Number(medicine.minPrice) : null,
    maxPrice: medicine.maxPrice ? Number(medicine.maxPrice) : null,
    requiresPrescription: medicine.requiresPrescription,
    categoryId: medicine.categoryId,
    manufacturer: medicine.manufacturer ?? null,
    dosageForm: medicine.dosageForm ?? null,
    dosageInstructions: medicine.dosageInstructions ?? null,
    storageInstructions: medicine.storageInstructions ?? null,
    warnings: medicine.warnings ?? null,
    description: medicine.description,
    packSize: medicine.packSize ?? null,
  };
}
function mapPharmacySummary(
  pharmacy: InventoryAdminListPayload['pharmacy'],
): PharmacySummaryDto {
  return {
    id: pharmacy.id,
    pharmacyName: pharmacy.pharmacyName,
    verificationStatus: pharmacy.verificationStatus,
  };
}
