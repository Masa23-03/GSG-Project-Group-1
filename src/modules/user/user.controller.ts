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
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { updatePatientProfileSchema } from './schema/profile.schema';
import { UpdateMyPatientDto } from './dto/request.dto/profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  //TODO:PATCH /me/password  -- optional
  @Patch('/me/password')
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
