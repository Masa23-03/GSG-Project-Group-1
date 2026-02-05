import { z } from 'zod';

export const DecimalLike = z.union(
    [
        z.string().trim(),
         z.number()
        ]
    ).transform((v) => String(v))



