import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory.dto';
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
import { CreateInventoryItemSchema } from './schema/inventory.schema';
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
  //   return this.inventoryService.update(+id, updateInventoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.inventoryService.remove(+id);
  // }
}
