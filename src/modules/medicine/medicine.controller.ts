import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';

import { MedicineService } from './medicine.service';
import {
  PatientListQuerySchema,
  SearchQuerySchema,
} from './schema/query.medicine.shcema';
import {
  MedicineListQueryDto,
  PatientMedicineListQueryDto,
} from './swagger/query.medicine.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { MedicineWithImages } from './util/medicine.shared';

@ApiTags('Medicines (Patient)')
@ApiBearerAuth('access-token')
@Controller('medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Get()
  @ApiOperation({ summary: 'Search medicines (APPROVED + active only)' })
  async list(
    @Query(new ZodValidationPipe(PatientListQuerySchema))
    query: PatientMedicineListQueryDto,
  ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
    return await this.medicineService.browseMedicines({
      q: query.q,
      categoryId: query.categoryId,
      requiresPrescription: query.requiresPrescription,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Medicine details (APPROVED + active only)' })
  async getById(
    @Param('id', ParseIntPipe)
    params: number,
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    return await this.medicineService.getApprovedActiveById(params);
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type {
  ApiPaginationSuccessResponse,
  authedUserType,
} from 'src/types/unifiedType.types';
import {
  PatientMedicinePharmaciesQueryDto,
  PatientMedicinePharmacyItemDto,
} from './dto/medicine-pahrmacies.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { patientMedicinePharmaciesQueryDtoSchema } from './schema/medicine-pahrmacies.schema';

@ApiBearerAuth('access-token')
@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Roles(UserRole.PATIENT)
  @Get(':id/pharmacies')
  @ApiOperation({
    summary: 'List pharmacies that have this medicine (patient)',
  })
  @ApiParam({
    name: 'medicineId',
    type: Number,
    example: 15,
    description: 'Medicine ID',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: [],
        meta: {
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  async getPharmaciesByMedicine(
    @AuthedUser() user: authedUserType,
    @Param('medicineId', ParseIntPipe) medicineId: number,
    @Query(new ZodValidationPipe(patientMedicinePharmaciesQueryDtoSchema))
    query: PatientMedicinePharmaciesQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientMedicinePharmacyItemDto>> {
    return this.medicineService.getPharmaciesByMedicine(
      user.id,
      medicineId,
      query,
    );
  }
}
