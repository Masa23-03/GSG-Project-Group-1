import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { CreateInventoryItemSchema } from './schema/inventory.schema';
import { VerifiedPharmacyGuard } from 'src/guards/verified-pharmacy.guard';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth('JWT-auth')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  @ApiOperation({ summary: 'Add a new medicine to pharmacy inventory' })
  @ApiBody({ type: CreateInventoryItemDto })
  
  @ApiResponse({ status: 201, description: 'Successfully created or restored inventory item.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Price range violation or inactive medicine.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Pharmacy not verified.' })
  @ApiResponse({ status: 409, description: 'Conflict: Item already exists in inventory.' })

  @UseGuards(AuthGuard, RolesGuard, VerifiedPharmacyGuard)
  @Roles(UserRole.PHARMACY)
  @Post()
  async create(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(CreateInventoryItemSchema))
    createDto: CreateInventoryItemDto,
  ) {
    /**
     * The service will handle:
     * 1. Verifying pharmacy ownership/verification status
     * 2. Medicine existence and status (APPROVED & ACTIVE)
     * 3. Price range validation (minPrice <= sellPrice <= maxPrice)
     * 4. Restore logic (if isDeleted is true)
     */
    return await this.inventoryService.create(user.id, createDto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
