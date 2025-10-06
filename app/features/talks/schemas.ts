import { z } from 'zod';

export const zTalk = () =>
  z.object({
    id: z.string().cuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    name: z.string(),
    speaker: z.string(),
    isFavorite: z.boolean(),
  });

export type Talk = z.infer<ReturnType<typeof zTalk>>;
