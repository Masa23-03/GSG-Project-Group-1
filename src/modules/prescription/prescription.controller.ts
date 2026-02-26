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
import { RequireVerified } from 'src/decorators/requireVerified.decorator';

@ApiTags('Prescriptions')
@ApiBearerAuth('access-token')
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

  @Get('patient/:id')
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

  @Patch('patient/:id')
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
  @ApiBody({ type: ReuploadPrescriptionDto })
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

  @Patch('pharmacy/:id')
  @RequireVerified('PHARMACY')
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
  @ApiBody({ type: RequestNewPrescriptionDto })
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

  @Get('pharmacy/:id')
  @RequireVerified('PHARMACY')
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
