import { MedicineWithImages } from '../util/medicine.shared';
import { PatientMedicineListItemDto } from '../dto/patient-medicine-list.dto';

export function mapToPatientMedicine(
  medicine: MedicineWithImages,
): PatientMedicineListItemDto {
  return {
    id: medicine.id,
    genericName: medicine.genericName,
    brandName: medicine.brandName ?? null,
    manufacturer: medicine.manufacturer ?? null,
    dosageForm: medicine.dosageForm ?? null,
    strengthValue: medicine.strengthValue?.toString() ?? null,
    strengthUnit: medicine.strengthUnit ?? null,
    packSize: medicine.packSize ?? null,
    packUnit: medicine.packUnit ?? null,
    minPrice: medicine.minPrice?.toString() ?? null,
    maxPrice: medicine.maxPrice?.toString() ?? null,
    requiresPrescription: medicine.requiresPrescription,
    images:
      medicine.medicineImages?.map((img) => ({
        url: img.url,
        sortOrder: img.sortOrder,
      })) ?? [],
    category: {
      id: medicine.category.id,
      name: medicine.category.name,
    },
  };
}
