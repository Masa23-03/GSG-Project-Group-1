export enum UploadPurpose {
  USER_PROFILE_IMAGE = 'USER_PROFILE_IMAGE',
  LICENSE_DOC = 'LICENSE_DOC',
  PHARMACY_COVER_IMAGE = 'PHARMACY_COVER_IMAGE',
  CATEGORY_IMAGE = 'CATEGORY_IMAGE',
  MEDICINE_IMAGE = 'MEDICINE_IMAGE',
  PRESCRIPTION_FILE = 'PRESCRIPTION_FILE',
  DELIVERY_CONFIRM_PHOTO = 'DELIVERY_CONFIRM_PHOTO',
}

export type UploadRule = {
  maxBytes: number;
  allowedMime: readonly string[];
  folder: string;
};
export const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const DOC_MIME = ['image/jpeg', 'image/png', 'application/pdf'] as const;
