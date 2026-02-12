import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/request.dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/request.dto/update-inventory.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import {
  CreateInventoryItemSchema,
  UpdateInventoryItemSchema,
} from './schema/inventory.schema';
import { RequireVerified } from 'src/decorators/requireVerified.decorator';
import { GetInventoryQueryDto } from './dto/query.dto/get-inventory-query.dto';
import { GetInventoryQuerySchema } from './schema/get-inventory-query.schema';
import { PaginationQueryDto } from 'src/types/pagination.query';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { GetInventoryAdminQueryDto } from './dto/query.dto/get-inventory-admin-query.dto';
import { GetInventoryAdminQuerySchema } from './schema/inventory-admin.schema';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  // Pharmacy endpoints
  @RequireVerified('PHARMACY')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({ summary: 'Add a new medicine to pharmacy inventory' })
  @ApiBody({ type: CreateInventoryItemDto })
  @Post()
  async create(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(CreateInventoryItemSchema))
    createDto: CreateInventoryItemDto,
  ) {
    return await this.inventoryService.create(user.id, createDto);
  }

  @RequireVerified('PHARMACY')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({ summary: 'List pharmacy inventory items' })
  @Get()
  async findAll(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(GetInventoryQuerySchema))
    query: GetInventoryQueryDto,
  ) {
    return this.inventoryService.findAll(user.id, query);
  }

  @RequireVerified('PHARMACY')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({ summary: 'Get details of a single inventory item' })
  @Get(':id')
  async findOne(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inventoryService.findOne(user.id, id);
  }

  @RequireVerified('PHARMACY')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({
    summary: 'Update inventory item',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(UpdateInventoryItemSchema))
    dto: UpdateInventoryItemDto,
  ) {
    return await this.inventoryService.update(id, user.id, dto);
  }

  @RequireVerified('PHARMACY')
  @Roles(UserRole.PHARMACY)
  @ApiOperation({
    summary: 'Soft delete inventory item',
    description: 'Marks an item as deleted and sets availability to false.',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthedUser() user: authedUserType,
  ) {
    return await this.inventoryService.remove(id, user.id);
  }
  // Patient endpoints
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'List all available inventory items for a specific medicine',
  })
  @Get('patient/:pharmacyId')
  async findAllForPatient(
    @Param('pharmacyId', ParseIntPipe) pharmacyId: number,
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQueryDto,
  ) {
    return this.inventoryService.findAllForPatient(pharmacyId, query);
  }
  // Admin endpoints
  @Roles(UserRole.ADMIN)
  @Get('admin')
  @ApiOperation({
    summary: 'Admin: List all inventory items with advanced filters',
  })
  async findAllAdmin(
    @Query(new ZodValidationPipe(GetInventoryAdminQuerySchema))
    query: GetInventoryAdminQueryDto,
  ) {
    return this.inventoryService.findAllAdmin(query);
  }

  @ApiOperation({ summary: 'Admin: View specific inventory item details' })
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return await this.inventoryService.findOneAdmin(id);
  }
}
