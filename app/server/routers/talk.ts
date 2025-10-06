import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { zTalk } from '@/features/talks/schemas';
import { protectedProcedure } from '@/server/orpc';

const tags = ['talks'];

export default {
  getAll: protectedProcedure({
    permission: {
      talk: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/talks',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.coerce.number().int().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zTalk()),
        nextCursor: z.string().cuid().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting talks from database');

      const where = {
        name: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      } satisfies Prisma.TalkWhereInput;

      const [total, items] = await context.db.$transaction([
        context.db.talk.count({ where }),
        context.db.talk.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            name: 'asc',
          },
          include: { likes: { where: { userId: context.user.id } } },
          where,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: items.map((item) => ({
          ...item,
          isFavorite: !!item.likes.length,
        })),
        nextCursor,
        total,
      };
    }),

  toggleFavorite: protectedProcedure({ permission: { talk: ['read'] } })
    .route({
      method: 'POST',
      path: '/talks/{id}',
      tags,
    })
    .input(zTalk().pick({ id: true }))
    .output(zTalk())
    .handler(async ({ context, input }) => {
      context.logger.info('Toggling talk like');

      const talkLikeId = { userId: context.user.id, talkId: input.id };
      const isFavorite = await context.db.talkLike.findUnique({
        where: { userId_talkId: talkLikeId },
        include: { talk: true },
      });

      if (isFavorite) {
        context.logger.info('Deleting like');
        await context.db.talkLike.delete({
          where: { userId_talkId: talkLikeId },
        });
        return { ...isFavorite.talk, isFavorite: false };
      } else {
        context.logger.info('Adding like');
        const like = await context.db.talkLike.create({
          data: talkLikeId,
          include: { talk: true },
        });
        return { ...like.talk, isFavorite: true };
      }
    }),
};
