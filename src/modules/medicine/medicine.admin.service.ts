import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { MedicineStatus, Prisma } from '@prisma/client'
import { medicineInclude, toMeta } from './util/medicine.shared'
import { CreateMedicineAdminDto } from './swagger/create.medicine.dto'
import { UpdateMedicineDto } from './swagger/update.medicine.dto'
import { AdminReviewDto } from './swagger/status.medicine.dto'
import { Params } from './medicine.service'




@Injectable()
export class MedicineAdminService {
    constructor(private readonly prisma: DatabaseService) { }



    private async CategoryExists(categoryId: number) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        })
        if (!category) throw new NotFoundException('Category not found')
    }



    async adminList(params: Params) {

        const qTrim = params.q?.trim()
        const { status, isActive, categoryId, page, limit } = params

        const where: Prisma.MedicineWhereInput = {
            ...(status ? { status } : {}),
            ...(typeof isActive === 'boolean' ? { isActive } : {}),
            ...(categoryId ? { categoryId } : {}),
            ...(qTrim
                ? {
                    OR: [
                        { genericName: { contains: qTrim } },
                        { brandName: { contains: qTrim } },
                    ],
                }
                : {}),
        }

        const total = await this.prisma.medicine.count({ where })
        const items = await this.prisma.medicine.findMany({
            where,
            orderBy: { id: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: medicineInclude,
        })

        return {
            items,
            meta: toMeta(page, limit, total)
        }
    }




    async adminGetById(id: number) {
        const medicine = await this.prisma.medicine.findUnique({
            where: { id },
            include: medicineInclude,
        })
        if (!medicine) throw new NotFoundException('Medicine not found')
        return medicine
    }




    async adminCreate(adminId: number, payload: CreateMedicineAdminDto) {
        const genericName = payload.genericName.trim()

        await this.CategoryExists(payload.categoryId)

        const dup = await this.prisma.medicine.findFirst({
            where: { genericName, categoryId: payload.categoryId },
            select: { id: true },
        })
        if (dup) throw new ConflictException('Medicine already exists')

        if (Number(payload.minPrice) > Number(payload.maxPrice)) {
            throw new ConflictException('minPrice must be <= maxPrice')
        }

        return await this.prisma.medicine.create({
            data: {
                categoryId: payload.categoryId,
                genericName,
                brandName: payload.brandName?.trim(),
                manufacturer: payload.manufacturer?.trim(),
                dosageForm: payload.dosageForm?.trim(),
                strengthValue: payload.strengthValue ? new Prisma.Decimal(payload.strengthValue) : undefined,
                strengthUnit: payload.strengthUnit?.trim(),
                packSize: payload.packSize,
                packUnit: payload.packUnit?.trim(),
                requiresPrescription: payload.requiresPrescription ?? false,
                activeIngredients: payload.activeIngredients?.trim(),
                dosageInstructions: payload.dosageInstructions?.trim(),
                storageInstructions: payload.storageInstructions?.trim(),
                warnings: payload.warnings?.trim(),
                description: payload.description.trim(),

                status: MedicineStatus.APPROVED,
                isActive: true,

                minPrice: new Prisma.Decimal(payload.minPrice),
                maxPrice: new Prisma.Decimal(payload.maxPrice),

                createdByUserId: adminId,

                medicineImages: payload.images?.length
                    ? {
                        create: payload.images.map((img: any) => ({
                            url: img.url.trim(),
                            sortOrder: img.sortOrder,
                        })),
                    }
                    : undefined,
            },
            include: medicineInclude,
        })
    }




    async updateMedicineAdmin(id: number, payload: UpdateMedicineDto) {

        const existing = await this.prisma.medicine.findUnique({
            where: { id },
            select: { id: true, minPrice: true, maxPrice: true },
        })
        if (!existing) throw new NotFoundException('Medicine not found')

        const nextMin =
            payload.minPrice !== undefined ? new Prisma.Decimal(payload.minPrice) : existing.minPrice ?? null
        const nextMax =
            payload.maxPrice !== undefined ? new Prisma.Decimal(payload.maxPrice) : existing.maxPrice ?? null

        if (nextMin !== null && nextMax !== null) {
            if (Number(nextMin.toString()) > Number(nextMax.toString())) {
                throw new ConflictException('minPrice must be <= maxPrice')
            }
        }

        return await this.prisma.medicine.update({
            where: { id },
            data: {
                categoryId: payload.categoryId,
                genericName: payload.genericName?.trim(),
                brandName: payload.brandName?.trim(),
                manufacturer: payload.manufacturer?.trim(),
                dosageForm: payload.dosageForm?.trim(),
                strengthValue: payload.strengthValue ? new Prisma.Decimal(payload.strengthValue) : undefined,
                strengthUnit: payload.strengthUnit?.trim(),
                packSize: payload.packSize,
                packUnit: payload.packUnit?.trim(),
                requiresPrescription: payload.requiresPrescription,
                activeIngredients: payload.activeIngredients?.trim(),
                dosageInstructions: payload.dosageInstructions?.trim(),
                storageInstructions: payload.storageInstructions?.trim(),
                warnings: payload.warnings?.trim(),
                description: payload.description?.trim(),
                minPrice: payload.minPrice !== undefined ? new Prisma.Decimal(payload.minPrice) : undefined,
                maxPrice: payload.maxPrice !== undefined ? new Prisma.Decimal(payload.maxPrice) : undefined,
            },
            include: medicineInclude,
        })
    }





    async activateMedicineAdmin(id: number, isActive: boolean) {
        const exists = await this.prisma.medicine.findUnique({ where: { id }, select: { id: true } })
        if (!exists) throw new NotFoundException('Medicine not found')

        return await this.prisma.medicine.update({
            where: { id },
            data: { isActive },
            include: medicineInclude,
        })
    }




    async adminReview(adminId: number, id: number, payload: AdminReviewDto) {

        const medicine = await this.prisma.medicine.findUnique({
            where: { id },
            select: { id: true, minPrice: true, maxPrice: true },
        })
        if (!medicine) throw new NotFoundException('Medicine not found')

        const status = payload.status

        if (status === 'APPROVED') {
            const finalMin = payload.minPrice !== undefined ? new Prisma.Decimal(payload.minPrice) : medicine.minPrice
            const finalMax = payload.maxPrice !== undefined ? new Prisma.Decimal(payload.maxPrice) : medicine.maxPrice

            if (!finalMin || !finalMax) {
                throw new ConflictException('minPrice and maxPrice must be set to approve')
            }
            if (Number(finalMin.toString()) > Number(finalMax.toString())) {
                throw new ConflictException('minPrice must be <= maxPrice')
            }

            return await this.prisma.medicine.update({
                where: { id },
                data: {
                    status: MedicineStatus.APPROVED,
                    isActive: true,
                    createdByUserId: adminId,
                    reviewedBy: adminId,
                    reviewedAt: new Date(),
                    rejectionReason: null,
                    minPrice: payload.minPrice !== undefined ? new Prisma.Decimal(payload.minPrice) : undefined,
                    maxPrice: payload.maxPrice !== undefined ? new Prisma.Decimal(payload.maxPrice) : undefined,
                },
                include: medicineInclude,
            })
        }

        return await this.prisma.medicine.update({
            where: { id },
            data: {
                status: MedicineStatus.REJECTED,
                isActive: false,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                rejectionReason: payload.rejectionReason?.trim() ?? null,
            },
            include: medicineInclude,
        })
    }
}
