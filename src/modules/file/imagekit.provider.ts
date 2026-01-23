import ImageKit from 'imagekit';
import { env } from 'src/config/env';

export const IMAGEKIT = Symbol('IMAGEKIT');

export const ImageKitProvider = {
  provide: IMAGEKIT,
  useFactory: () =>
    new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    }),
};
