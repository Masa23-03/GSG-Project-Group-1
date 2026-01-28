import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { UserService } from '../user/user.service';
import { DatabaseService } from '../database/database.service';
import { RegisterDriverDTO } from '../auth/dto/auth.register.dto';

@Injectable()
export class DriverService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly userService: UserService,
    ) { }

    async create(payload: RegisterDriverDTO, role: UserRole) {
        try {
            return this.prisma.$transaction(async (tx) => {
                const user = await this.userService.create(
                    payload,
                    UserRole.DRIVER,
                    UserStatus.INACTIVE,
                    tx,
                );

                const driver = await tx.driver.create({
                    data: {
                        userId: user.id,
                        vehicleName: payload.vehicleName,
                        vehiclePlate: payload.vehiclePlate,
                        licenseDocumentUrl: payload.licenseDocUrl ?? null,
                    },
                });

                return {
                    user,
                    driver,
                    message: 'Registered successfully. Your driver license is under review.',
                };
            });
        } catch (e) {
            throw e;
        }
    }

    findAll() {
        return `This action returns all driver`;
    }

    findOne(id: number) {
        return `This action returns a #${id} driver`;
    }

    update(id: number, updateDriverDto: any) {
        return `This action updates a #${id} driver`;
    }

    remove(id: number) {
        return `This action removes a #${id} driver`;
    }
}
