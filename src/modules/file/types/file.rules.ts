import { DOC_MIME, IMAGE_MIME, UploadPurpose, UploadRule } from './file.types';

export const UPLOAD_RULES: Record<UploadPurpose, UploadRule> = {
  [UploadPurpose.USER_PROFILE_IMAGE]: {
    maxBytes: 2 * 1024 * 1024,
    allowedMime: IMAGE_MIME,
    folder: '/users/profile',
  },
  [UploadPurpose.LICENSE_DOC]: {
    maxBytes: 10 * 1024 * 1024,
    allowedMime: DOC_MIME,
    folder: '/licenses',
  },
  [UploadPurpose.PHARMACY_COVER_IMAGE]: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: IMAGE_MIME,
    folder: '/pharmacies/cover',
  },
  [UploadPurpose.CATEGORY_IMAGE]: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: IMAGE_MIME,
    folder: '/categories',
  },
  [UploadPurpose.MEDICINE_IMAGE]: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: IMAGE_MIME,
    folder: '/medicines',
  },
  [UploadPurpose.PRESCRIPTION_FILE]: {
    maxBytes: 10 * 1024 * 1024,
    allowedMime: DOC_MIME,
    folder: '/prescriptions',
  },
  [UploadPurpose.DELIVERY_CONFIRM_PHOTO]: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: IMAGE_MIME,
    folder: '/deliveries/confirm',
  },
} as const;
