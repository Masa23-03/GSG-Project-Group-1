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

@ApiTags('Inventory')
@RequireVerified('PHARMACY')
@Roles(UserRole.PHARMACY)
@ApiBearerAuth('access-token')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

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

  @ApiOperation({ summary: 'List pharmacy inventory items' })
  @Get()
  async findAll(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(GetInventoryQuerySchema))
    query: GetInventoryQueryDto,
  ) {
    return this.inventoryService.findAll(user.id, query);
  }

  @ApiOperation({ summary: 'Get details of a single inventory item' })
  @Get(':id')
  async findOne(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inventoryService.findOne(user.id, id);
  }

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
}
