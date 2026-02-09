import {
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
