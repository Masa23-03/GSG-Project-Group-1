import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import {
  CreateInventoryItemSchema,
  UpdateInventoryItemSchema,
} from './schema/inventory.schema';
import { RequireVerified } from 'src/decorators/requireVerified.decorator';

@ApiTags('Inventory')
@RequireVerified('PHARMACY')
@Roles(UserRole.PHARMACY)
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

  // @Get()
  // findAll() {
  //   return this.inventoryService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.inventoryService.findOne(+id);
  // }
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
