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


import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { StageGuard } from 'src/guards/stage.guard';

import { Roles } from 'src/decorators/roles.decorator';
import { AuthStage, RequireStage } from 'src/decorators/stage.decorator';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { MedicineService } from './medicine.service';
import { MedicinePharmacyService } from './medicine.pharmacy.service';
import { MedicineListResponseDto, MedicineResponseDto } from './swagger/response.medicine.dto';
import { PharmacyMedicineListQueryDto, PharmacyRequestsListQueryDto } from './swagger/query.medicine.dto';
import { CreateMedicinePharmacyRequestDto } from './swagger/create.medicine.dto';
import { CreateMedicinePharmacyRequestSchema } from './schema/create.medicine.schema';
import { IdParamSchema, PharmacyRequestsListQuerySchema, SearchQuerySchema } from './schema/query.medicine.shcema';



@ApiTags('Medicine (Pharmacy)')
@ApiBearerAuth()
@UseGuards(AuthGuard, StageGuard, RolesGuard)
@Roles(UserRole.PHARMACY)
@RequireStage(AuthStage.FULL)
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
    ) {
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
    ) {
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
    ) {
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
    ) {
        const myPharmacyId = await this.pharmacyMedicneService.verifiedPharmacyIdOrThrow(pharmacyUser.id);
        return await this.pharmacyMedicneService.pharmacyGetMyRequestById(myPharmacyId, params.id);
    }



    // @Patch('requests/:id')
    // @ApiOperation({ summary: 'Update my PENDING request (replace images if provided)' })
    // @ApiParam({ name: 'id', type: Number })
    // @ApiBody({ type: UpdateMedicineDto })
    // @ApiResponse({ status: 200, type: MedicineResponseDto })
    // async updateMyRequest(
    //     @AuthedUser() pharmacyUser: authedUserType,
    //     @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
    //     @Body(new ZodValidationPipe(UpdateMedicinePharmacyRequestSchema))
    //     body: UpdateMedicineDto,
    // ) {
    //     const myPharmacyId = await this.pharmacyMedicneService.getMyVerifiedPharmacyIdOrThrow(pharmacyUser.id);
    //     return await this.pharmacyMedicneService.pharmacyUpdateMyPendingRequest(myPharmacyId, params.id, body);
    // }
}
