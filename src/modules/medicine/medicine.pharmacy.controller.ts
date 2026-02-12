import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
    ApiPaginationSuccessResponse,
    ApiSuccessResponse,
} from 'src/types/unifiedType.types';


import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

import { Roles } from 'src/decorators/roles.decorator';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { MedicineService } from './medicine.service';
import { MedicinePharmacyService } from './medicine.pharmacy.service';
import {
    ApiErrorResponseDto,
    MedicineListResponseDto,
    MedicineResponseDto,
} from './swagger/response.medicine.dto';
import { PharmacyMedicineListQueryDto, PharmacyRequestsListQueryDto } from './swagger/query.medicine.dto';
import { CreateMedicinePharmacyRequestDto } from './swagger/create.medicine.dto';
import { UpdateMedicineDto } from './swagger/update.medicine.dto';
import { CreateMedicinePharmacyRequestSchema } from './schema/create.medicine.schema';
import { IdParamSchema, PharmacyRequestsListQuerySchema, SearchQuerySchema } from './schema/query.medicine.shcema';
import { UpdateMedicinePharmacyRequestSchema } from './schema/update.medicine.schema';
import { MedicineWithImages } from './util/medicine.shared';



@ApiTags('Medicine (Pharmacy)')
@ApiBearerAuth()
@ApiResponse({ status: 400, type: ApiErrorResponseDto })
@ApiResponse({ status: 401, type: ApiErrorResponseDto })
@ApiResponse({ status: 403, type: ApiErrorResponseDto })
@ApiResponse({ status: 404, type: ApiErrorResponseDto })
@ApiResponse({ status: 409, type: ApiErrorResponseDto })
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.PHARMACY)
@Controller('medicines/pharmacy')
export class MedicinePharmacyController {
    constructor(
        private readonly medicineService: MedicineService,
        private readonly pharmacyMedicneService: MedicinePharmacyService,
    ) { }




    @Get()
    @ApiOperation({ summary: 'Browse approved + active medicines (verified pharmacy only)' })
    @ApiQuery({ name: 'q', required: false, type: String })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, type: MedicineListResponseDto })
    async browse(
        @AuthedUser() pharmacyUser: authedUserType,
        @Query(new ZodValidationPipe(SearchQuerySchema))
        query: PharmacyMedicineListQueryDto,
    ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
        //! enforce VERIFIED
        await this.pharmacyMedicneService.verifiedPharmacyIdOrThrow(pharmacyUser.id);

        return await this.medicineService.browseMedicines({
            q: query.q,
            categoryId: query.categoryId,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        });
    }




    @Post('requests')
    @ApiOperation({ summary: 'Create medicine request (PENDING) + images (verified only)' })
    @ApiBody({ type: CreateMedicinePharmacyRequestDto })
    @ApiResponse({ status: 201, type: MedicineResponseDto })
    async createRequest(
        @AuthedUser() pharmacyUser: authedUserType,
        @Body(new ZodValidationPipe(CreateMedicinePharmacyRequestSchema))
        body: CreateMedicinePharmacyRequestDto,
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        const myPharmacyId = await this.pharmacyMedicneService.verifiedPharmacyIdOrThrow(pharmacyUser.id);
        return await this.pharmacyMedicneService.pharmacyRequestCreate(pharmacyUser.id, myPharmacyId, body);
    }





    @Get('requests')
    @ApiOperation({ summary: 'List my requests (ownership enforced)' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, type: MedicineListResponseDto })
    async listMyRequests(
        @AuthedUser() pharmacyUser: authedUserType,
        @Query(new ZodValidationPipe(PharmacyRequestsListQuerySchema))
        query: PharmacyRequestsListQueryDto,
    ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
        const myPharmacyId = await this.pharmacyMedicneService.verifiedPharmacyIdOrThrow(pharmacyUser.id);

        return await this.pharmacyMedicneService.pharmacyListMyRequests({
            myPharmacyId,
            status: query.status,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        });
    }





    @Get('requests/:id')
    @ApiOperation({ summary: 'Request details (404 if not owned)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: MedicineResponseDto })
    async getMyRequest(
        @AuthedUser() pharmacyUser: authedUserType,
        @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        const myPharmacyId = await this.pharmacyMedicneService.verifiedPharmacyIdOrThrow(pharmacyUser.id);
        return await this.pharmacyMedicneService.pharmacyGetMyRequestById(myPharmacyId, params.id);
    }



    @Patch('requests/:id')
    @ApiOperation({ summary: 'Update my PENDING request (replace images if provided)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateMedicineDto })
    @ApiResponse({ status: 200, type: MedicineResponseDto })
    async updateMyRequest(
        @AuthedUser() pharmacyUser: authedUserType,
        @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
        @Body(new ZodValidationPipe(UpdateMedicinePharmacyRequestSchema))
        body: UpdateMedicineDto,
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        const myPharmacyId = await this.pharmacyMedicneService.verifiedPharmacyIdOrThrow(pharmacyUser.id);
        return await this.pharmacyMedicneService.pharmacyUpdateMyPendingRequest(myPharmacyId, params.id, body);
    }
}
