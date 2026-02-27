import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UsersAdminController } from './users.admin.controller';

@Module({
  controllers: [UserController, UsersAdminController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
