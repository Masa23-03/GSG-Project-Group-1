import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
    @ApiProperty()
    name!: string;

    @ApiPropertyOptional({nullable: true, type: String})
    description?: string | null;

    @ApiPropertyOptional({nullable: true, type: String})
    categoryImageUrl?: string | null;
}
export type createCategoryDtoType = InstanceType<typeof CreateCategoryDto>;
