import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
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

import { AdminReviewDto } from './swagger/status.medicine.dto';
import { CreateMedicineAdminDto } from './swagger/create.medicine.dto';
import { AdminListQuerySchema } from './schema/query.medicine.shcema';
import { UpdateMedicineAdminSchema } from './schema/update.medicine.schema';
import { CreateMedicineAdminSchema } from './schema/create.medicine.schema';
import { UpdateMedicineDto } from './swagger/update.medicine.dto';
import { MedicineWithImages } from './util/medicine.shared';
import { AdminReviewSchema } from './schema/status.medicine.schema';

@ApiTags('Medicine - Admin')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('medicines/admin')
export class MedicineAdminController {
  constructor(private readonly adminMedicineService: MedicineAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Admin list/search can view all statuses' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
  async getById(
    @Param('id', ParseIntPipe) params: { id: number },
  ): Promise<ApiSuccessResponse<MedicineWithImages>> {
    return await this.adminMedicineService.adminGetById(params.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Admin create medicine (APPROVED + active) + images',
  })
  @ApiBody({ type: CreateMedicineAdminDto })
  async create(
    @AuthedUser() admin: authedUserType,
    @Body(new ZodValidationPipe(CreateMedicineAdminSchema))
    payload: CreateMedicineAdminDto,
  ) {
    return await this.adminMedicineService.adminCreate(admin.id, payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin update core fields' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateMedicineDto })
  async update(
    @Param('id', ParseIntPipe) params: { id: number },
    @Body(new ZodValidationPipe(UpdateMedicineAdminSchema))
    payload: UpdateMedicineDto,
  ) {
    return await this.adminMedicineService.updateMedicineAdmin(
      params.id,
      payload,
    );
  }
  @Patch(':id/activation')
  @ApiOperation({ summary: 'Activate / deactivate an APPROVED medicine' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 15,
    description: 'Medicine id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { isActive: { type: 'boolean', example: true } },
      required: ['isActive'],
    },
  })
  async activation(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.adminMedicineService.activateMedicineAdmin(id, isActive);
  }
  @Patch(':id/review')
  @ApiOperation({
    summary: 'Review a pharmacy-requested medicine (PENDING only)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 15,
    description: 'Medicine id',
  })
  @ApiBody({ type: AdminReviewDto })
  async review(
    @AuthedUser() admin: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AdminReviewSchema)) payload: AdminReviewDto,
  ) {
    return this.adminMedicineService.adminReview(admin.id, id, payload);
  }
}
