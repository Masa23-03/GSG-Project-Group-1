import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { RegisterPharmacyDTO } from '../auth/dto/auth.register.dto';

@Injectable()
export class PharmacyService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly userService: UserService,
    ) { }

    async create(payload: RegisterPharmacyDTO, role: UserRole) {
        try {
            return this.prisma.$transaction(async (tx) => {
                const user = await this.userService.create(
                    payload,
                    UserRole.PHARMACY,
                    UserStatus.INACTIVE,
                    tx,
                );

                const pharmacy = await tx.pharmacy.create({
                    data: {
                        userId: user.id,
                        pharmacyName: payload.pharmacyName,
                        licenseNumber: payload.licenseNumber,
                        city: payload.city,
                        address: payload.address ?? null,
                        licenseDocumentUrl: payload.licenseDocUrl ?? null,
                        latitude:
                            payload.lat != null ? new Prisma.Decimal(payload.lat) : null,
                        longitude:
                            payload.lng != null ? new Prisma.Decimal(payload.lng) : null,
                    },
                });

                return {
                    user,
                    pharmacy,
                    message:
                        'Registered successfully. Your pharmacy license is under review.',
                };
            });
        } catch (e) {
            throw e;
        }
    }

    findAll() {
        return `This action returns all pharmacy`;
    }

    findOne(id: number) {
        return `This action returns a #${id} pharmacy`;
    }

    update(id: number) {
        return `This action updates a #${id} pharmacy`;
    }

    remove(id: number) {
        return `This action removes a #${id} pharmacy`;
    }
}
