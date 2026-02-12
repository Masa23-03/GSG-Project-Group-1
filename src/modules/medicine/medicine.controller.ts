import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
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
  }
}
