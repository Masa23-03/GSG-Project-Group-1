import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { MedicineStatus, Prisma, VerificationStatus } from '@prisma/client'
import { medicineInclude, toMeta } from './util/medicine.shared'

@Injectable()
export class MedicinePharmacyService {
    constructor(private readonly prisma: DatabaseService) { }



    private async CategoryExists(categoryId: number) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        })
        if (!category) throw new NotFoundException('Category not found')
    }



    async verifiedPharmacyIdOrThrow(userId: number): Promise<number> {
        const pharmacy = await this.prisma.pharmacy.findFirst({
            where: { userId },
            select: { id: true, verificationStatus: true },
        })

        if (!pharmacy) throw new ForbiddenException('Pharmacy profile not found')
        if (pharmacy.verificationStatus !== VerificationStatus.VERIFIED) {
            throw new ForbiddenException('Pharmacy must be VERIFIED')
        }
        return pharmacy.id
    }





    async pharmacyRequestCreate(userId: number, myPharmacyId: number, body: any) {

        const genericName = body.genericName.trim()

        await this.CategoryExists(body.categoryId)

        const existingApproved = await this.prisma.medicine.findFirst({
            where: {
                status: MedicineStatus.APPROVED,
                isActive: true,
                genericName,
                categoryId: body.categoryId,
            },
            select: { id: true },
        })
        if (existingApproved) throw new ConflictException('Medicine already exists')

        return await this.prisma.medicine.create({
            data: {
                categoryId: body.categoryId,
                genericName,
                brandName: body.brandName?.trim(),
                manufacturer: body.manufacturer?.trim(),
                dosageForm: body.dosageForm?.trim(),
                strengthValue: body.strengthValue ? new Prisma.Decimal(body.strengthValue) : undefined,
                strengthUnit: body.strengthUnit?.trim(),
                packSize: body.packSize,
                packUnit: body.packUnit?.trim(),
                requiresPrescription: body.requiresPrescription ?? false,
                activeIngredients: body.activeIngredients?.trim(),
                dosageInstructions: body.dosageInstructions?.trim(),
                storageInstructions: body.storageInstructions?.trim(),
                warnings: body.warnings?.trim(),
                description: body.description.trim(),

                status: MedicineStatus.PENDING,
                isActive: false,
                requestedByPharmacyId: myPharmacyId,

                medicineImages: body.images?.length
                    ? { create: body.images.map((img: any) => ({ url: img.url.trim(), sortOrder: img.sortOrder })) }
                    : undefined,
            },
            include: medicineInclude,
        })
    }





    async pharmacyListMyRequests(params: {
        myPharmacyId: number;
        status?: MedicineStatus;
        page: number;
        limit: number;
    }) {
        const { myPharmacyId, status, page, limit } = params;

        const where: Prisma.MedicineWhereInput = {
            requestedByPharmacyId: myPharmacyId,
            ...(status ? { status } : {}),
        };

        const total = await this.prisma.medicine.count({ where });

        const items = await this.prisma.medicine.findMany({
            where,
            orderBy: { id: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: medicineInclude,
        });

        return { items, meta: toMeta(page, limit, total) };
    }





    async pharmacyGetMyRequestById(myPharmacyId: number, id: number) {
        const medicine = await this.prisma.medicine.findFirst({
            where: { id, requestedByPharmacyId: myPharmacyId },
            include: medicineInclude,
        })
        if (!medicine) throw new NotFoundException('Medicine request not found')
        return medicine
    }





    async pharmacyUpdateMyPendingRequest(myPharmacyId: number, id: number, body: any) {
        const owned = await this.prisma.medicine.findFirst({
            where: { id, requestedByPharmacyId: myPharmacyId },
            select: { id: true, status: true, genericName: true, categoryId: true },
        })
        if (!owned) throw new NotFoundException('Medicine request not found')

        if (owned.status !== MedicineStatus.PENDING) {
            throw new ConflictException('Only PENDING requests can be updated')
        }

        const nextGenericName = (body.genericName ?? owned.genericName)?.trim()
        const nextCategoryId = body.categoryId ?? owned.categoryId

        if (body.genericName !== undefined || body.categoryId !== undefined) {
            const approvedDup = await this.prisma.medicine.findFirst({
                where: {
                    status: MedicineStatus.APPROVED,
                    isActive: true,
                    genericName: nextGenericName,
                    categoryId: nextCategoryId,
                },
                select: { id: true },
            })
            if (approvedDup) throw new ConflictException('Medicine already exists')
        }

        if (body.images !== undefined) {
            await this.prisma.medicineImage.deleteMany({ where: { medicineId: id } })
            if (body.images?.length) {
                await this.prisma.medicineImage.createMany({
                    data: body.images.map((img: any) => ({
                        medicineId: id,
                        url: img.url.trim(),
                        sortOrder: img.sortOrder,
                    })),
                })
            }
        }

        return await this.prisma.medicine.update({
            where: { id },
            data: {
                categoryId: body.categoryId,
                genericName: body.genericName?.trim(),
                brandName: body.brandName?.trim(),
                manufacturer: body.manufacturer?.trim(),
                dosageForm: body.dosageForm?.trim(),
                strengthValue: body.strengthValue ? new Prisma.Decimal(body.strengthValue) : undefined,
                strengthUnit: body.strengthUnit?.trim(),
                packSize: body.packSize,
                packUnit: body.packUnit?.trim(),
                requiresPrescription: body.requiresPrescription,
                activeIngredients: body.activeIngredients?.trim(),
                dosageInstructions: body.dosageInstructions?.trim(),
                storageInstructions: body.storageInstructions?.trim(),
                warnings: body.warnings?.trim(),
                description: body.description?.trim(),
            },
            include: medicineInclude,
        })
    }
}
