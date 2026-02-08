import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Category } from "@prisma/client";
import { create } from "domain";
import { createCategorySchema } from "../../schema/category.schema";

export class CreateCategoryDto {
    @ApiProperty()
    name!: string;

    @ApiPropertyOptional({nullable: true})
    description?: string | null;

    @ApiPropertyOptional({nullable: true})
    categoryImageUrl?: string | null;
}
export type createCategoryDtoType = InstanceType<typeof CreateCategoryDto>;
