import {
  CanActivate,
  ExecutionContext,
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
    const authHeader = req.headers.authorization;

    const jwt = authHeader?.split(' ')[1];
    if (!jwt) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify<JWT_Payload>(jwt);
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: BigInt(payload.sub) },
      });
      req.user = { id: String(user.id), role: user.role };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
    return true;
  }
}
