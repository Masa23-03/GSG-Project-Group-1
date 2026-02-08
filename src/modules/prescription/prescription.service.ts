import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePrescriptionDto,
  ReuploadPrescriptionDto,
} from './dto/create-prescription.dto';
import { PrescriptionResponseDto } from './dto/response/response.dto';
import { DatabaseService } from '../database/database.service';
import {
  PrescriptionStatus,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { mapToPrescriptionResponse } from './util/prescription.mapper';

@Injectable()
export class PrescriptionService {
  constructor(private readonly prismaService: DatabaseService) {}
  async create(
    userId: number,
    dto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacy = await prisma.pharmacy.findFirst({
        where: {
          id: dto.pharmacyId,
          verificationStatus: VerificationStatus.VERIFIED,
          user: { status: UserStatus.ACTIVE },
        },
        select: { id: true },
      });
      if (!pharmacy) throw new NotFoundException('Pharmacy not found');
      const prescription = await prisma.prescription.create({
        data: {
          patientId: userId,
          pharmacyId: pharmacy.id,
          isActive: true,
          status: PrescriptionStatus.UNDER_REVIEW,
          prescriptionFiles: {
            create: dto.fileUrls.map((url, index) => ({
              url: url,
              sortOrder: index + 1,
            })),
          },
        },
        include: {
          prescriptionFiles: true,
        },
      });

      return mapToPrescriptionResponse(prescription);
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} prescription`;
  }

  async reupload(
    userId: number,
    prescriptionId: number,
    dto: ReuploadPrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const oldPrescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          patientId: userId,
          isActive: true,
        },
        include: {
          prescriptionFiles: true,
        },
      });
      if (!oldPrescription) {
        throw new NotFoundException('Prescription not found');
      }
      if (!oldPrescription.reuploadRequestedAt) {
        throw new BadRequestException('Re-upload not requested');
      }
      await prisma.prescription.update({
        where: { id: oldPrescription.id },
        data: { isActive: false },
      });
      const newPrescription = await prisma.prescription.create({
        data: {
          patientId: oldPrescription.patientId,
          pharmacyId: oldPrescription.pharmacyId,
          pharmacyOrderId: oldPrescription.pharmacyOrderId,
          status: PrescriptionStatus.UNDER_REVIEW,
          isActive: true,
          prescriptionFiles: {
            create: dto.fileUrls.map((url, index) => ({
              url,
              sortOrder: index + 1,
            })),
          },
        },
        include: {
          prescriptionFiles: true,
        },
      });

      return mapToPrescriptionResponse(newPrescription);
    });
  }
}
