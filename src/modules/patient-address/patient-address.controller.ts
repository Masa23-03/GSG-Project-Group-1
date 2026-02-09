import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PatientAddressService } from './patient-address.service';

@Controller('patient/addresses')
export class PatientAddressController {
  constructor(private readonly patientAddressService: PatientAddressService) {}

  // @Post()
  // create(@Body() createPatientAddressDto) {
  //   return this.patientAddressService.create(createPatientAddressDto);
  // }

  // @Get()
  // findAll() {
  //   return this.patientAddressService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.patientAddressService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePatientAddressDto) {
  //   return this.patientAddressService.update(+id, updatePatientAddressDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.patientAddressService.remove(+id);
  // }
}
