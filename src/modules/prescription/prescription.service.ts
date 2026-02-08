import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
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

  update(id: number, updatePrescriptionDto) {
    return `This action updates a #${id} prescription`;
  }
}
