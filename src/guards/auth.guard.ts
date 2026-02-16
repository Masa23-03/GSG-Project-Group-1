import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { IsPublic } from 'src/decorators/isPublic.decorator';
import { DatabaseService } from 'src/modules/database/database.service';
import { Request } from 'express';
import { JWT_Payload } from 'src/modules/auth/types/auth.types';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: DatabaseService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublic, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(req.headers.authorization);
    if (!token) throw new UnauthorizedException('Invalid Auth Header');

    try {
      const payload = this.jwtService.verify<JWT_Payload>(token);
      const userId = Number(payload.sub);
      if (!Number.isInteger(userId))
        throw new UnauthorizedException('Invalid token');
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, role: true, status: true },
      });
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('Account is inactive');
      }

      req.user = {
        id: user.id,
        role: user.role,
      };
    } catch (err: any) {
      console.warn('[AuthGuard] token rejected', {
        path: req.originalUrl,
        reason: err?.name || err?.message || 'unknown',
      });
      if (err instanceof ForbiddenException) throw err;

      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }
  private extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null;

    const match = authHeader.trim().match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() ?? null;
  }
}
