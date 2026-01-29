import { DefaultAddressDto } from 'src/modules/user/dto/response.dto/profile.dto';
import { addressWithCity } from '../types/address.type';

export function mapPatientAddress(payload: addressWithCity): DefaultAddressDto {
  return {
    id: payload.id,
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2,
    label: payload.label,
    latitude: payload.latitude ? payload.latitude.toNumber() : null,
    longitude: payload.longitude ? payload.longitude.toNumber() : null,
    cityName: payload.city?.name ?? '',
    cityId: payload.cityId,
    area: payload.area,
    region: payload.region,
  };
}
