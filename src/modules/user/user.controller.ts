import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';

import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { updatePatientProfileSchema } from './schema/profile.schema';
import { UpdateMyPatientDto } from './dto/request.dto/profile.dto';

@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //TODO:PATCH /me/password  -- optional
  //@Patch('/me/password')

  @Roles(UserRole.PATIENT)
  @Get('me')
  async getMe(@AuthedUser() user: authedUserType) {
    return await this.userService.findMyProfile(user.id);
  }
  //profile endpoint for update pharmacy profile

  @Roles(UserRole.PATIENT)
  @ApiBody({ type: UpdateMyPatientDto })
  @Patch('me')
  async updateMe(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(updatePatientProfileSchema))
    updateUserDto: UpdateMyPatientDto,
  ) {
    return await this.userService.updateMyProfile(user.id, updateUserDto);
  }
}
