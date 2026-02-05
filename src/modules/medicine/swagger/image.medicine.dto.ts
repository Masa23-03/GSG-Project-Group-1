import { ApiProperty } from '@nestjs/swagger';

export class MedicineImageDto {
    @ApiProperty({ example: 10 }) 
    id!: number;

    @ApiProperty({ example: 55 }) 
    medicineId!: number;
    
    @ApiProperty({ example: 'https://cdn.example.com/meds/panadol-1.jpg' }) 
    url!: string;

    @ApiProperty({ example: 0, minimum: 0, maximum: 127 }) 
    sortOrder!: number;

    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;

}



export class MedicineImageInputDto {
    @ApiProperty({ example: 'https://cdn.example.com/meds/panadol-1.jpg' }) 
    url!: string;

    @ApiProperty({ example: 0, minimum: 0, maximum: 127 }) 
    sortOrder!: number;

}
