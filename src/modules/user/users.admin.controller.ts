import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole, UserStatus } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserService } from './user.service';
import z from 'zod';
import { adminUserListQuerySchema } from './schema/admin-user.schema';
import { AdminUserListQueryDto } from './dto/request.dto/admin-user.query.dto';

@ApiBearerAuth('access-token')
@ApiTags('Patients - Admin')
@Roles(UserRole.ADMIN)
@Controller('users/admin')
export class UsersAdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'q', required: false })
  async findAllAdmin(
    @Query(new ZodValidationPipe(adminUserListQuerySchema))
    query: AdminUserListQueryDto,
  ) {
    return this.userService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneAdmin(id);
  }
}
