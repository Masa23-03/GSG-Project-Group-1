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
import { requirePharmacyId } from 'src/utils/getPharmacyAndDriverFromUserId';
import { RequestNewPrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(private readonly prismaService: DatabaseService) {}
  //! patient methods
  async create(
    userId: number,
    dto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      if (!dto.fileUrls?.length) {
        throw new BadRequestException('At least one file is required');
      }
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

  async reupload(
    userId: number,
    prescriptionId: number,
    dto: ReuploadPrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      if (!dto.fileUrls?.length) {
        throw new BadRequestException('At least one file is required');
      }
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
      if (!oldPrescription.pharmacyOrderId) {
        throw new BadRequestException('Prescription is not linked to an order');
      }
      const locked = await prisma.prescription.updateMany({
        where: { id: oldPrescription.id, isActive: true },
        data: { isActive: false },
      });

      if (locked.count !== 1) {
        throw new BadRequestException('Prescription was updated, try again');
      }
      const newPrescription = await prisma.prescription.create({
        data: {
          patientId: oldPrescription.patientId,
          pharmacyId: oldPrescription.pharmacyId,
          pharmacyOrderId: oldPrescription.pharmacyOrderId,
          status: PrescriptionStatus.UNDER_REVIEW,
          isActive: true,
          reuploadReason: null,
          reuploadRequestedAt: null,
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
  async getMyPrescription(
    userId: number,
    prescriptionId: number,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.prismaService.prescription.findFirst({
      where: { id: prescriptionId, patientId: userId },
      include: { prescriptionFiles: true },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return mapToPrescriptionResponse(prescription);
  }

  //!pharmacy methods
  async getPharmacyPrescription(
    userId: number,
    prescriptionId: number,
  ): Promise<PrescriptionResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacyId = await requirePharmacyId(prisma, userId);
      const prescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          pharmacyId: pharmacyId,
          isActive: true,
        },
        include: {
          prescriptionFiles: true,
        },
      });
      if (!prescription) throw new NotFoundException('Prescription not found');
      return mapToPrescriptionResponse(prescription);
    });
  }

  async requestNewPrescription(
    userId: number,
    prescriptionId: number,
    dto: RequestNewPrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const pharmacyId = await requirePharmacyId(prisma, userId);
      const prescription = await prisma.prescription.findFirst({
        where: { id: prescriptionId, pharmacyId: pharmacyId, isActive: true },
        include: { prescriptionFiles: true },
      });
      if (!prescription) throw new NotFoundException('Prescription not found');
      if (prescription.reuploadRequestedAt) {
        throw new BadRequestException('Re-upload already requested');
      }
      if (prescription.status === PrescriptionStatus.APPROVED) {
        throw new BadRequestException(
          'Cannot request re-upload for approved prescription',
        );
      }

      const updated = await prisma.prescription.update({
        where: { id: prescription.id },
        data: {
          reuploadReason: dto.reuploadReason,
          reuploadRequestedAt: new Date(),
          status: PrescriptionStatus.UNDER_REVIEW,
        },
        include: { prescriptionFiles: true },
      });
      return mapToPrescriptionResponse(updated);
    });
  }
}
