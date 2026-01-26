import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientAddressService } from './patient-address.service';
import { CreatePatientAddressDto } from './dto/create-patient-address.dto';
import { UpdatePatientAddressDto } from './dto/update-patient-address.dto';

@Controller('patient-address')
export class PatientAddressController {
  constructor(private readonly patientAddressService: PatientAddressService) {}

  @Post()
  create(@Body() createPatientAddressDto: CreatePatientAddressDto) {
    return this.patientAddressService.create(createPatientAddressDto);
  }

  @Get()
  findAll() {
    return this.patientAddressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientAddressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientAddressDto: UpdatePatientAddressDto) {
    return this.patientAddressService.update(+id, updatePatientAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientAddressService.remove(+id);
  }
}
