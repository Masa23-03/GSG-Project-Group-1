import { DefaultAddressDto } from 'src/modules/user/dto/response.dto/profile.dto';
import {
  AddressListItemWithCity,
  addressWithCity,
} from '../types/address.type';
import { PatientAddressListItemResponseDto } from '../dto/response/list.response.dto';

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
export function mapPatientAddressListItem(
  payload: AddressListItemWithCity,
): PatientAddressListItemResponseDto {
  return {
    id: payload.id,
    addressLine1: payload.addressLine1,
    label: payload.label,
    latitude: payload.latitude ? payload.latitude.toNumber() : null,
    longitude: payload.longitude ? payload.longitude.toNumber() : null,
    cityName: payload.city?.name ?? '',
    cityId: payload.cityId,
    isDefault: payload.isDefault,
  };
}
