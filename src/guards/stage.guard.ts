import {
  Injectable,
  ForbiddenException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_ONBOARDING_KEY } from '../decorators/stage.decorator';

@Injectable()
export class StageGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const allowOnboarding = this.reflector.getAllAndOverride(
      ALLOW_ONBOARDING_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user?.stage) return true;

    if (user.stage === 'FULL') return true;

    if (user.stage === 'ONBOARDING' && allowOnboarding) return true;

    throw new ForbiddenException('Onboarding access: profile only');
  }
}
