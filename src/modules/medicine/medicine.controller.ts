import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import {
  ApiErrorResponseDto,
  MedicineListResponseDto,
  MedicineResponseDto,
} from './swagger/response.medicine.dto';
import { MedicineService } from './medicine.service';
import { IdParamSchema, SearchQuerySchema } from './schema/query.medicine.shcema';
import { PatientMedicineListQueryDto } from './swagger/query.medicine.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  ApiPaginationSuccessResponse,
  ApiSuccessResponse,
} from 'src/types/unifiedType.types';
import { MedicineWithImages } from './util/medicine.shared';



@ApiTags('Medicines (Patient)')
@ApiResponse({ status: 400, type: ApiErrorResponseDto })
@ApiResponse({ status: 404, type: ApiErrorResponseDto })
@Controller('medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) { }


  
  @Get()
  @ApiOperation({ summary: 'Search medicines (APPROVED + active only)' })
  @ApiOkResponse({ type: MedicineListResponseDto })
  async list(
    @Query(new ZodValidationPipe(SearchQuerySchema)) query: PatientMedicineListQueryDto,
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
  @ApiOkResponse({ type: MedicineResponseDto })
  async getById(
    @Param(new ZodValidationPipe(IdParamSchema)) params: z.infer<typeof IdParamSchema>,
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    return await this.medicineService.getApprovedActiveById(params.id);
  }



}
