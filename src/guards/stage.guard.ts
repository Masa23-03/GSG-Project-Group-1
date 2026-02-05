import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_STAGE_KEY, AuthStage } from '../decorators/stage.decorator'

@Injectable()
export class StageGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredStage = this.reflector.getAllAndOverride<AuthStage>(
      REQUIRE_STAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredStage) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user 


    if (!user?.stage) {
      throw new ForbiddenException('Stage not found on request');
    }


    if (requiredStage === 'FULL' && user.stage !== 'FULL') {
      throw new ForbiddenException(
        'Your account is under review. Profile access only.',
      );
    }

    return true;
  }
}