import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import {
  CreatePrescriptionDto,
  ReuploadPrescriptionDto,
} from './dto/create-prescription.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  createPrescriptionSchema,
  requestNewPrescriptionSchema,
  reuploadPrescriptionSchema,
} from './schema/prescription.schema';
import { RequestNewPrescriptionDto } from './dto/update-prescription.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PrescriptionResponseDto } from './dto/response/response.dto';

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Create prescription (Patient)',
    description: 'Creates a new prescription for the authenticated patient.',
  })
  @ApiBody({
    type: CreatePrescriptionDto,
    description: 'Prescription payload (file URLs only).',
    examples: {
      example: {
        value: {
          pharmacyId: 12,
          fileUrls: [
            'https://cdn.example.com/prescriptions/p1.png',
            'https://cdn.example.com/prescriptions/p2.png',
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Prescription created successfully.',
    type: PrescriptionResponseDto,
  })
  async create(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(createPrescriptionSchema))
    dto: CreatePrescriptionDto,
  ) {
    return this.prescriptionService.create(user.id, dto);
  }

  @Get('my/:id')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Get my prescription by ID (Patient)',
    description:
      'Returns prescription details (including files) for the authenticated patient.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Prescription ID',
    example: 13,
  })
  @ApiOkResponse({
    description: 'Prescription fetched successfully.',
    type: PrescriptionResponseDto,
  })
  async getMyPrescription(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.prescriptionService.getMyPrescription(user.id, id);
  }

  @Patch('my/:id/reupload')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Re-upload prescription (Patient)',
    description:
      'Re-upload is allowed only if pharmacy requested it. This creates a new active prescription row and deactivates the old one.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Old prescription ID (active one)',
    example: 13,
  })
  @ApiBody({
    type: ReuploadPrescriptionDto,
    description: 'New file URLs to attach to the new prescription version.',
    examples: {
      example: {
        value: {
          fileUrls: [
            'https://cdn.example.com/prescriptions/new1.png',
            'https://cdn.example.com/prescriptions/new2.png',
          ],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Prescription re-uploaded; new active version returned.',
    type: PrescriptionResponseDto,
  })
  reupload(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(reuploadPrescriptionSchema))
    dto: ReuploadPrescriptionDto,
  ) {
    return this.prescriptionService.reupload(user.id, id, dto);
  }

  @Patch(':id/request-reupload')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({
    summary: 'Request prescription re-upload (Pharmacy)',
    description: 'Requests a re-upload for the active prescription.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Prescription ID (active one)',
    example: 13,
  })
  @ApiBody({
    type: RequestNewPrescriptionDto,
    description: 'Reason for requesting re-upload.',
    examples: {
      example: {
        value: {
          reuploadReason: 'Image is blurry.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Re-upload requested successfully.',
    type: PrescriptionResponseDto,
  })
  requestReupload(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(requestNewPrescriptionSchema))
    dto: RequestNewPrescriptionDto,
  ) {
    return this.prescriptionService.requestNewPrescription(user.id, id, dto);
  }

  @Get(':id')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({
    summary: 'Get prescription by ID (Pharmacy)',
    description: 'Returns prescription details (including files).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Prescription ID',
    example: 13,
  })
  @ApiOkResponse({
    description: 'Prescription fetched successfully.',
    type: PrescriptionResponseDto,
  })
  async getPrescription(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.prescriptionService.getPharmacyPrescription(user.id, id);
  }
}
