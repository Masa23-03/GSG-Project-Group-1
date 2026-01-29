import { v2 as cloudinary } from 'cloudinary';
import { env } from 'src/config/env';

export const CLOUDINARY = Symbol('CLOUDINARY');

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  },
};
