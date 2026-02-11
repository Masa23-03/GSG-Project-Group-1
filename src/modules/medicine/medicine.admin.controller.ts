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
import { MedicineAdminService } from './medicine.admin.service';
import { AdminMedicineListQueryDto } from './swagger/query.medicine.dto';
import {
    ApiErrorResponseDto,
    MedicineListResponseDto,
    MedicineResponseDto,
} from './swagger/response.medicine.dto';
import { ToggleActiveDto, AdminReviewDto } from './swagger/status.medicine.dto';
import { CreateMedicineAdminDto } from './swagger/create.medicine.dto';
import { AdminListQuerySchema, IdParamSchema } from './schema/query.medicine.shcema';
import { UpdateMedicineAdminSchema } from './schema/update.medicine.schema';
import { CreateMedicineAdminSchema } from './schema/create.medicine.schema';
import { UpdateMedicineDto } from './swagger/update.medicine.dto';
import { AdminReviewSchema, ToggleActiveSchema } from './schema/status.medicine.schema';
import { MedicineWithImages } from './util/medicine.shared';


@ApiTags('Medicine - Admin')
@ApiBearerAuth()
@ApiResponse({ status: 400, type: ApiErrorResponseDto })
@ApiResponse({ status: 401, type: ApiErrorResponseDto })
@ApiResponse({ status: 403, type: ApiErrorResponseDto })
@ApiResponse({ status: 404, type: ApiErrorResponseDto })
@ApiResponse({ status: 409, type: ApiErrorResponseDto })
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('medicines/admin')
export class MedicineAdminController {
    constructor(private readonly adminMedicineService: MedicineAdminService) { }


    @Get()
    @ApiOperation({ summary: 'Admin list/search can view all statuses' })
    @ApiQuery({ name: 'q', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, type: MedicineListResponseDto })
    async list(
        @Query(new ZodValidationPipe(AdminListQuerySchema))
        query: AdminMedicineListQueryDto,
    ): Promise<ApiPaginationSuccessResponse<MedicineWithImages>> {
        return await this.adminMedicineService.adminList({
            q: query.q,
            status: query.status,
            isActive: query.isActive,
            categoryId: query.categoryId,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        });
    }


    @Get(':id')
    @ApiOperation({ summary: 'Admin details (any status)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: MedicineResponseDto })
    async getById(
        @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        return await this.adminMedicineService.adminGetById(params.id);
    }


    @Post()
    @ApiOperation({ summary: 'Admin create medicine (APPROVED + active) + images' })
    @ApiBody({ type: CreateMedicineAdminDto })
    @ApiResponse({ status: 201, type: MedicineResponseDto })
    async create(
        @AuthedUser() admin: authedUserType,
        @Body(new ZodValidationPipe(CreateMedicineAdminSchema)) payload: CreateMedicineAdminDto,
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        return await this.adminMedicineService.adminCreate(admin.id, payload);
    }



    @Patch(':id')
    @ApiOperation({ summary: 'Admin update core fields' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: CreateMedicineAdminDto })
    @ApiResponse({ status: 200, type: MedicineResponseDto })
    async update(
        @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
        @Body(new ZodValidationPipe(UpdateMedicineAdminSchema)) payload: UpdateMedicineDto,
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        console.log('PATCH payload:', payload);
        return await this.adminMedicineService.updateMedicineAdmin(params.id, payload);
    }



    @Patch(':id/active')
    @ApiOperation({ summary: 'Admin toggle isActive' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: ToggleActiveDto })
    @ApiResponse({ status: 200, type: MedicineResponseDto })
    async toggleActive(
        @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
        @Body(new ZodValidationPipe(ToggleActiveSchema)) payload: ToggleActiveDto,
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        return await this.adminMedicineService.activateMedicineAdmin(params.id, payload.isActive);
    }




    @Patch(':id/status')
    @ApiOperation({ summary: 'Admin approve/reject (review)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: AdminReviewDto })
    @ApiResponse({ status: 200, type: MedicineResponseDto })
    async review(
        @AuthedUser() admin: authedUserType,
        @Param(new ZodValidationPipe(IdParamSchema)) params: { id: number },
        @Body(new ZodValidationPipe(AdminReviewSchema)) payload: AdminReviewDto,
    ): Promise<ApiSuccessResponse<MedicineWithImages>> {
        return await this.adminMedicineService.adminReview(admin.id, params.id, payload);
    }
}
