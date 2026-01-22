// import ImageKit from '@imagekit/nodejs';

import ImageKit from '@imagekit/nodejs';
import { ConfigService } from '@nestjs/config';
import { env } from 'src/config/env';

export const IMAGEKIT = Symbol('IMAGEKIT');

export const imageKitProvider = {
  provide: IMAGEKIT,

  useFactory: () => {
    return new ImageKit({
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
    });
  },
};
