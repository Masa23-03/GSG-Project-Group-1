import { Prisma } from '@prisma/client';

export const pharmacyOrderWithRelations =
  Prisma.validator<Prisma.PharmacyOrderInclude>()({
    order: {
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
    },

    pharmacyOrderItems: {
      include: {
        inventoryItem: {
          include: {
            medicine: true,
          },
        },
      },
    },

    prescriptions: {
      where: { isActive: true },
      select: { id: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    },
  });
