import { Prisma } from "@prisma/client";

export const addressDetailsSelect: Prisma.PatientAddressSelect = {
      id: true,
      label: true,
      area: true,
      region: true,
      cityId: true,
      addressLine1: true,
      addressLine2: true,
      latitude: true,
      longitude: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
      city: { select: { name: true } },
    };