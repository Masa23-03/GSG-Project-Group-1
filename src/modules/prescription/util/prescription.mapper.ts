import { Prescription } from '@prisma/client';
import { PrescriptionResponseDto } from '../dto/response/response.dto';
type PrescriptionWithFiles = Prescription & {
  prescriptionFiles: {
    id: number;
    url: string;
    sortOrder: number;
  }[];
};
export const mapToPrescriptionResponse = (
  prescription: PrescriptionWithFiles,
): PrescriptionResponseDto => {
  return {
    id: prescription.id,
    status: prescription.status,
    reuploadReason: prescription.reuploadReason,
    reuploadRequestedAt: prescription.reuploadRequestedAt
      ? prescription.reuploadRequestedAt?.toISOString()
      : null,
    createdAt: prescription.createdAt.toISOString(),
    updatedAt: prescription.updatedAt.toISOString(),
    isActive: prescription.isActive,
    files: prescription.prescriptionFiles
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((f) => ({
        id: f.id,
        sortOrder: f.sortOrder,
        url: f.url,
      })),
  };
};
