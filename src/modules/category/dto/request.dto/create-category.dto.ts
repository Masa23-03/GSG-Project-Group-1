import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
    @ApiProperty()
    name!: string;

    @ApiPropertyOptional({nullable: true})
    description?: string | null;

    @ApiPropertyOptional({nullable: true})
    categoryImageUrl?: string | null;
}
export type createCategoryDtoType = InstanceType<typeof CreateCategoryDto>;
