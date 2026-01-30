import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../modules/database/database.service'; 

@Injectable()
export class VerifiedPharmacyGuard implements CanActivate {
  constructor(private prisma: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
      return false;
    }
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { userId: user.id },
      select: { verificationStatus: true },
    });
    if (!pharmacy) {
      throw new ForbiddenException('Pharmacy profile not found.');
    }
    if (pharmacy.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenException(
        `Access denied. Your pharmacy status is currently: ${pharmacy.verificationStatus}`,
      );
    }
    return true;
  }
}
