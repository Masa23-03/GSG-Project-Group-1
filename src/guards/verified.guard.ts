import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import {
  REQUIRE_VERIFIED_KEY,
  RequireVerifiedTarget,
} from 'src/decorators/requireVerified.decorator';
import { DatabaseService } from 'src/modules/database/database.service';

export class VerifiedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const target = this.reflector.getAllAndOverride<RequireVerifiedTarget>(
      REQUIRE_VERIFIED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!target) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user as { id: number; role: UserRole } | undefined;
    if (!user?.id) throw new UnauthorizedException('Unauthorized');

    const base = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        status: true,
        pharmacy: { select: { verificationStatus: true } },
        driver: { select: { verificationStatus: true } },
      },
    });
    if (!base) throw new UnauthorizedException('Unauthorized');
    if (base.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is inactive');
    }
    if (target === 'PHARMACY') {
      if (user.role !== UserRole.PHARMACY) {
        throw new ForbiddenException('Pharmacy role required');
      }
      const s = base.pharmacy?.verificationStatus;
      if (!s) throw new ForbiddenException('Pharmacy profile not found');
      if (s !== VerificationStatus.VERIFIED) {
        throw new ForbiddenException('Pharmacy is under review');
      }
      return true;
    }

    if (user.role !== UserRole.DRIVER) {
      throw new ForbiddenException('Driver role required');
    }
    const s = base.driver?.verificationStatus;
    if (!s) throw new ForbiddenException('Driver profile not found');
    if (s !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('Driver is under review');
    }
    return true;
  }
}
