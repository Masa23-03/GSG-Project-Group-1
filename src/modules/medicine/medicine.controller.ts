import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import {
  PatientListQuerySchema,
  SearchQuerySchema,
} from './schema/query.medicine.shcema';
import {
  MedicineListQueryDto,
  PatientMedicineListQueryDto,
} from './swagger/query.medicine.dto';
import * as unifiedTypeTypes from 'src/types/unifiedType.types';
import { MedicineWithImages } from './util/medicine.shared';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MedicineService } from './medicine.service';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import { patientMedicinePharmaciesQueryDtoSchema } from './schema/medicine-pahrmacies.schema';
import {
  PatientMedicinePharmaciesQueryDto,
  PatientMedicinePharmacyItemDto,
} from './dto/medicine-pahrmacies.dto';
import { ApiPaginatedOkResponse } from 'src/utils/api-paginated-ok-response';
import { PatientMedicineListItemDto } from './dto/patient-medicine-list.dto';

@ApiTags('Medicines - Patient')
@ApiBearerAuth('access-token')
@Roles(UserRole.PATIENT)
@Controller('medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Get()
  @ApiOperation({ summary: 'Search medicines (APPROVED + active only)' })
  @ApiPaginatedOkResponse(PatientMedicineListItemDto)
  async list(
    @Query(new ZodValidationPipe(PatientListQuerySchema))
    query: PatientMedicineListQueryDto,
  ) {
    return await this.medicineService.browseMedicines({
      q: query.q,
      categoryId: query.categoryId,
      requiresPrescription: query.requiresPrescription,
      onlyAvailable: query.onlyAvailable,
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
    id: number,
  ) {
    return await this.medicineService.getApprovedActiveById(id);
  }
  @Get(':medicineId/pharmacies')
  @ApiOperation({
    summary: 'List pharmacies that have this medicine',
  })
  @ApiParam({
    name: 'medicineId',
    type: Number,
    example: 15,
    description: 'Medicine ID',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiPaginatedOkResponse(PatientMedicinePharmacyItemDto)
  async getPharmaciesByMedicine(
    @AuthedUser() user: unifiedTypeTypes.authedUserType,
    @Param('medicineId', ParseIntPipe) medicineId: number,
    @Query(new ZodValidationPipe(patientMedicinePharmaciesQueryDtoSchema))
    query: PatientMedicinePharmaciesQueryDto,
  ) {
    return this.medicineService.getPharmaciesByMedicine(
      user.id,
      medicineId,
      query,
    );
  }
}
