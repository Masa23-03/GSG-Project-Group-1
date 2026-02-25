import { Prisma, PrismaClient } from '@prisma/client';

function isoDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

type InventorySeedRow = {
  pharmacyId: number;
  medicineId: number;
  stockQuantity: number;
  minStock: number;
  sellPrice: Prisma.Decimal | number | string;
  costPrice?: Prisma.Decimal | number | string | null;
  batchNumber?: string | null;
  expiryDate?: Date | null;
  shelfLocation?: string | null;
  notes?: string | null;
  isDeleted?: boolean;
};

export async function seedInventory(prisma: PrismaClient) {
  // VERIFIED pharmacies to use
  const pharmacies = [77, 78, 79, 80];

  // APPROVED + ACTIVE medicine to use
  const meds = [1, 2, 3, 4, 6, 7, 8, 10, 12, 13, 14, 15, 16, 19];

  const existingPharmacies = await prisma.pharmacy.findMany({
    where: { id: { in: pharmacies } },
    select: { id: true },
  });
  const existingMedicines = await prisma.medicine.findMany({
    where: { id: { in: meds }, status: 'APPROVED', isActive: true },
    select: { id: true, minPrice: true, maxPrice: true },
  });

  const pharmacyIds = new Set(existingPharmacies.map((p) => p.id));
  const medicineMap = new Map(existingMedicines.map((m) => [m.id, m]));

  if (pharmacyIds.size === 0) {
    console.warn('No target pharmacies found. Skipping inventory seed.');
    return;
  }
  if (medicineMap.size === 0) {
    console.warn(
      'No approved/active medicines found. Skipping inventory seed.',
    );
    return;
  }

  const clampPrice = (medicineId: number, price: number) => {
    const m = medicineMap.get(medicineId);
    if (!m) return price;
    const min = m.minPrice != null ? Number(m.minPrice) : null;
    const max = m.maxPrice != null ? Number(m.maxPrice) : null;
    if (min != null && price < min) return min;
    if (max != null && price > max) return max;
    return price;
  };

  const rows: InventorySeedRow[] = [
    //pharmacy 77
    {
      pharmacyId: 77,
      medicineId: 2,
      stockQuantity: 120,
      minStock: 15,
      sellPrice: 11.5,
      costPrice: 10,
      batchNumber: 'DB-PAIN-2026-01',
      expiryDate: isoDate('2026-11-30'),
      shelfLocation: 'A1',
      notes: 'Fast-moving item',
    },
    {
      pharmacyId: 77,
      medicineId: 1,
      stockQuantity: 40,
      minStock: 10,
      sellPrice: 22,
      costPrice: 18,
      batchNumber: 'DB-GI-2026-02',
      expiryDate: isoDate('2026-10-15'),
      shelfLocation: 'B2',
      notes: 'Popular heartburn med',
    },
    {
      pharmacyId: 77,
      medicineId: 12,
      stockQuantity: 0,
      minStock: 10,
      sellPrice: 18,
      costPrice: 14,
      batchNumber: 'DB-ALL-2026-03',
      expiryDate: null,
      shelfLocation: 'C3',
      notes: 'Out of stock',
    },
    {
      pharmacyId: 77,
      medicineId: 14,
      stockQuantity: 75,
      minStock: 20,
      sellPrice: 7,
      costPrice: 4.5,
      batchNumber: 'DB-ORS-2026-04',
      expiryDate: isoDate('2027-01-01'),
      shelfLocation: 'D1',
      notes: 'Emergency stock',
    },

    {
      pharmacyId: 77,
      medicineId: 3,
      stockQuantity: 65,
      minStock: 12,
      sellPrice: 28,
      costPrice: 22,
      batchNumber: 'DB-PARA-2026-05',
      expiryDate: isoDate('2026-09-15'),
      shelfLocation: 'A2',
      notes: 'Standard analgesic',
    },
    {
      pharmacyId: 77,
      medicineId: 4,
      stockQuantity: 25,
      minStock: 10,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'DB-IBU-2026-06',
      expiryDate: isoDate('2026-12-20'),
      shelfLocation: 'A3',
      notes: 'Pain relief shelf',
    },
    {
      pharmacyId: 77,
      medicineId: 7,
      stockQuantity: 18,
      minStock: 10,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'DB-CET-2026-07',
      expiryDate: isoDate('2026-08-01'),
      shelfLocation: 'C1',
      notes: 'Allergy season',
    },
    {
      pharmacyId: 77,
      medicineId: 13,
      stockQuantity: 10,
      minStock: 10,
      sellPrice: 32,
      costPrice: 26,
      batchNumber: 'DB-PANTO-2026-08',
      expiryDate: isoDate('2026-12-31'),
      shelfLocation: 'RX1',
      notes: 'Prescription item',
    },
    {
      pharmacyId: 77,
      medicineId: 15,
      stockQuantity: 22,
      minStock: 8,
      sellPrice: 24,
      costPrice: 19,
      batchNumber: 'DB-EYE-2026-09',
      expiryDate: isoDate('2026-07-10'),
      shelfLocation: 'E1',
      notes: 'Eye care shelf',
    },
    {
      pharmacyId: 77,
      medicineId: 19,
      stockQuantity: 14,
      minStock: 8,
      sellPrice: 20,
      costPrice: 16,
      batchNumber: 'DB-DXM-2026-10',
      expiryDate: isoDate('2026-06-01'),
      shelfLocation: 'C2',
      notes: 'Seasonal cough',
    },

    //pharmacy 78
    {
      pharmacyId: 78,
      medicineId: 4,
      stockQuantity: 90,
      minStock: 20,
      sellPrice: 32,
      costPrice: 26,
      batchNumber: 'GZ-IBU-2026-01',
      expiryDate: isoDate('2026-12-10'),
      shelfLocation: 'A2',
      notes: 'High demand',
    },
    {
      pharmacyId: 78,
      medicineId: 6,
      stockQuantity: 15,
      minStock: 15,
      sellPrice: 40,
      costPrice: 33,
      batchNumber: 'GZ-AZI-2026-02',
      expiryDate: isoDate('2026-08-20'),
      shelfLocation: 'RX1',
      notes: 'Prescription',
    },
    {
      pharmacyId: 78,
      medicineId: 10,
      stockQuantity: 8,
      minStock: 12,
      sellPrice: 38,
      costPrice: 30,
      batchNumber: 'GZ-VENT-2026-03',
      expiryDate: isoDate('2026-09-01'),
      shelfLocation: 'RX2',
      notes: 'Low stock',
    },
    {
      pharmacyId: 78,
      medicineId: 15,
      stockQuantity: 25,
      minStock: 8,
      sellPrice: 24,
      costPrice: 19,
      batchNumber: 'GZ-EYE-2026-04',
      expiryDate: isoDate('2026-07-15'),
      shelfLocation: 'E1',
      notes: 'Eye care shelf',
    },

    {
      pharmacyId: 78,
      medicineId: 2,
      stockQuantity: 150,
      minStock: 20,
      sellPrice: 12,
      costPrice: 10,
      batchNumber: 'GZ-PAIN-2026-05',
      expiryDate: isoDate('2026-11-25'),
      shelfLocation: 'A1',
      notes: 'Top seller',
    },
    {
      pharmacyId: 78,
      medicineId: 3,
      stockQuantity: 70,
      minStock: 15,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'GZ-PARA-2026-06',
      expiryDate: isoDate('2026-10-01'),
      shelfLocation: 'A3',
      notes: 'General pain relief',
    },
    {
      pharmacyId: 78,
      medicineId: 1,
      stockQuantity: 30,
      minStock: 10,
      sellPrice: 24,
      costPrice: 19,
      batchNumber: 'GZ-OME-2026-07',
      expiryDate: isoDate('2026-09-30'),
      shelfLocation: 'B2',
      notes: 'GI shelf',
    },
    {
      pharmacyId: 78,
      medicineId: 12,
      stockQuantity: 45,
      minStock: 12,
      sellPrice: 20,
      costPrice: 15,
      batchNumber: 'GZ-LORA-2026-08',
      expiryDate: isoDate('2026-10-20'),
      shelfLocation: 'C1',
      notes: 'Allergy meds',
    },
    {
      pharmacyId: 78,
      medicineId: 14,
      stockQuantity: 55,
      minStock: 15,
      sellPrice: 8,
      costPrice: 5,
      batchNumber: 'GZ-ORS-2026-09',
      expiryDate: isoDate('2027-01-15'),
      shelfLocation: 'D1',
      notes: 'Hydration salts',
    },
    {
      pharmacyId: 78,
      medicineId: 19,
      stockQuantity: 5,
      minStock: 8,
      sellPrice: 22,
      costPrice: 16,
      batchNumber: 'GZ-DXM-2026-10',
      expiryDate: isoDate('2026-05-20'),
      shelfLocation: 'C2',
      notes: 'Low stock cough syrup',
    },

    //pharmacy 79
    {
      pharmacyId: 79,
      medicineId: 8,
      stockQuantity: 60,
      minStock: 20,
      sellPrice: 50,
      costPrice: 40,
      batchNumber: 'KY-MET-2026-01',
      expiryDate: isoDate('2027-02-28'),
      shelfLocation: 'RX3',
      notes: 'Chronic meds',
    },
    {
      pharmacyId: 79,
      medicineId: 13,
      stockQuantity: 22,
      minStock: 10,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'KY-PANTO-2026-02',
      expiryDate: isoDate('2026-12-31'),
      shelfLocation: 'RX2',
      notes: 'Prescription',
    },
    {
      pharmacyId: 79,
      medicineId: 7,
      stockQuantity: 0,
      minStock: 10,
      sellPrice: 28,
      costPrice: 22,
      batchNumber: 'KY-CET-2026-03',
      expiryDate: null,
      shelfLocation: 'B1',
      notes: 'Out of stock',
    },
    {
      pharmacyId: 79,
      medicineId: 19,
      stockQuantity: 18,
      minStock: 8,
      sellPrice: 20,
      costPrice: 16,
      batchNumber: 'KY-DXM-2026-04',
      expiryDate: isoDate('2026-06-01'),
      shelfLocation: 'C2',
      notes: 'Seasonal cough',
    },

    {
      pharmacyId: 79,
      medicineId: 2,
      stockQuantity: 80,
      minStock: 15,
      sellPrice: 11.5,
      costPrice: 10,
      batchNumber: 'KY-PAIN-2026-05',
      expiryDate: isoDate('2026-11-11'),
      shelfLocation: 'A1',
      notes: 'Top pain relief',
    },
    {
      pharmacyId: 79,
      medicineId: 3,
      stockQuantity: 35,
      minStock: 12,
      sellPrice: 29,
      costPrice: 22,
      batchNumber: 'KY-PARA-2026-06',
      expiryDate: isoDate('2026-10-05'),
      shelfLocation: 'A2',
      notes: 'Regular analgesic',
    },
    {
      pharmacyId: 79,
      medicineId: 4,
      stockQuantity: 10,
      minStock: 15,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'KY-IBU-2026-07',
      expiryDate: isoDate('2026-12-01'),
      shelfLocation: 'A3',
      notes: 'Low stock ibuprofen',
    },
    {
      pharmacyId: 79,
      medicineId: 1,
      stockQuantity: 20,
      minStock: 10,
      sellPrice: 21,
      costPrice: 18,
      batchNumber: 'KY-OME-2026-08',
      expiryDate: isoDate('2026-09-10'),
      shelfLocation: 'B2',
      notes: 'GI meds',
    },
    {
      pharmacyId: 79,
      medicineId: 12,
      stockQuantity: 15,
      minStock: 10,
      sellPrice: 19,
      costPrice: 15,
      batchNumber: 'KY-LORA-2026-09',
      expiryDate: isoDate('2026-10-25'),
      shelfLocation: 'C1',
      notes: 'Allergy tablets',
    },
    {
      pharmacyId: 79,
      medicineId: 15,
      stockQuantity: 12,
      minStock: 8,
      sellPrice: 25,
      costPrice: 19,
      batchNumber: 'KY-EYE-2026-10',
      expiryDate: isoDate('2026-07-01'),
      shelfLocation: 'E1',
      notes: 'Eye drops',
    },

    //pharmacy 80
    {
      pharmacyId: 80,
      medicineId: 3,
      stockQuantity: 55,
      minStock: 12,
      sellPrice: 28,
      costPrice: 22,
      batchNumber: 'NS-PARA-2026-01',
      expiryDate: isoDate('2026-11-01'),
      shelfLocation: 'A1',
      notes: 'Standard analgesic',
    },
    {
      pharmacyId: 80,
      medicineId: 16,
      stockQuantity: 10,
      minStock: 10,
      sellPrice: 35,
      costPrice: 28,
      batchNumber: 'NS-LEVO-2026-02',
      expiryDate: isoDate('2027-03-01'),
      shelfLocation: 'RX4',
      notes: 'Prescription',
    },
    {
      pharmacyId: 80,
      medicineId: 12,
      stockQuantity: 35,
      minStock: 10,
      sellPrice: 20,
      costPrice: 15,
      batchNumber: 'NS-LORA-2026-03',
      expiryDate: isoDate('2026-10-05'),
      shelfLocation: 'B2',
      notes: 'Allergy meds',
    },
    {
      pharmacyId: 80,
      medicineId: 14,
      stockQuantity: 5,
      minStock: 10,
      sellPrice: 8,
      costPrice: 5,
      batchNumber: 'NS-ORS-2026-04',
      expiryDate: isoDate('2026-09-20'),
      shelfLocation: 'D1',
      notes: 'Low stock',
    },

    {
      pharmacyId: 80,
      medicineId: 2,
      stockQuantity: 100,
      minStock: 20,
      sellPrice: 11.5,
      costPrice: 10,
      batchNumber: 'NS-PAIN-2026-05',
      expiryDate: isoDate('2026-12-05'),
      shelfLocation: 'A2',
      notes: 'Top seller',
    },
    {
      pharmacyId: 80,
      medicineId: 1,
      stockQuantity: 18,
      minStock: 10,
      sellPrice: 23,
      costPrice: 18,
      batchNumber: 'NS-OME-2026-06',
      expiryDate: isoDate('2026-10-10'),
      shelfLocation: 'B1',
      notes: 'GI',
    },
    {
      pharmacyId: 80,
      medicineId: 4,
      stockQuantity: 0,
      minStock: 10,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'NS-IBU-2026-07',
      expiryDate: null,
      shelfLocation: 'A3',
      notes: 'Out of stock',
    },
    {
      pharmacyId: 80,
      medicineId: 7,
      stockQuantity: 16,
      minStock: 10,
      sellPrice: 32,
      costPrice: 24,
      batchNumber: 'NS-CET-2026-08',
      expiryDate: isoDate('2026-08-15'),
      shelfLocation: 'C1',
      notes: 'Allergy',
    },
    {
      pharmacyId: 80,
      medicineId: 15,
      stockQuantity: 20,
      minStock: 8,
      sellPrice: 26,
      costPrice: 19,
      batchNumber: 'NS-EYE-2026-09',
      expiryDate: isoDate('2026-07-20'),
      shelfLocation: 'E1',
      notes: 'Eye care',
    },
    {
      pharmacyId: 80,
      medicineId: 19,
      stockQuantity: 12,
      minStock: 8,
      sellPrice: 19,
      costPrice: 16,
      batchNumber: 'NS-DXM-2026-10',
      expiryDate: isoDate('2026-06-10'),
      shelfLocation: 'C2',
      notes: 'Cough meds',
    },

    //some soft deleted items
    {
      pharmacyId: 78,
      medicineId: 13,
      stockQuantity: 0,
      minStock: 10,
      sellPrice: 30,
      costPrice: 24,
      batchNumber: 'GZ-DEL-OLD-11',
      expiryDate: null,
      shelfLocation: 'RX1',
      notes: 'Soft deleted demo',
      isDeleted: true,
    },
    {
      pharmacyId: 79,
      medicineId: 10,
      stockQuantity: 0,
      minStock: 10,
      sellPrice: 40,
      costPrice: 30,
      batchNumber: 'KY-DEL-OLD-12',
      expiryDate: null,
      shelfLocation: 'RX2',
      notes: 'Soft deleted demo',
      isDeleted: true,
    },
    {
      pharmacyId: 80,
      medicineId: 6,
      stockQuantity: 0,
      minStock: 10,
      sellPrice: 40,
      costPrice: 33,
      batchNumber: 'NS-DEL-OLD-13',
      expiryDate: null,
      shelfLocation: 'RX3',
      notes: 'Soft deleted demo',
      isDeleted: true,
    },
  ];
  for (const r of rows) {
    if (!pharmacyIds.has(r.pharmacyId)) continue;
    if (!medicineMap.has(r.medicineId)) continue;

    const sell = clampPrice(r.medicineId, Number(r.sellPrice));
    const isAvailable = r.stockQuantity > 0 && !r.isDeleted;

    await prisma.inventoryItem.upsert({
      where: {
        pharmacyId_medicineId: {
          pharmacyId: r.pharmacyId,
          medicineId: r.medicineId,
        },
      },
      create: {
        pharmacyId: r.pharmacyId,
        medicineId: r.medicineId,
        stockQuantity: r.stockQuantity,
        minStock: r.minStock,
        sellPrice: sell,
        costPrice: r.costPrice ?? null,
        batchNumber: r.batchNumber ?? null,
        expiryDate: r.expiryDate ?? null,
        shelfLocation: r.shelfLocation ?? null,
        notes: r.notes ?? null,
        isAvailable,
        isDeleted: r.isDeleted ?? false,
      },
      update: {
        stockQuantity: r.stockQuantity,
        minStock: r.minStock,
        sellPrice: sell,
        costPrice: r.costPrice ?? null,
        batchNumber: r.batchNumber ?? null,
        expiryDate: r.expiryDate ?? null,
        shelfLocation: r.shelfLocation ?? null,
        notes: r.notes ?? null,
        isAvailable,
        isDeleted: r.isDeleted ?? false,
      },
    });
  }

  console.log(`Seeded inventory rows: ${rows.length}`);
}
