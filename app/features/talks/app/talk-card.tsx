import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon, HeartPlusIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';

import { Talk } from '@/features/talks/schemas';

export const TalkCard = (props: { talk: Talk }) => {
  const queryClient = useQueryClient();

  const toggleLike = useMutation(
    orpc.talk.toggleFavorite.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.talk.getAll.key(),
        });
      },
    })
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p>{props.talk.name}</p>
          <p className="text-muted-foreground">{props.talk.speaker}</p>
        </div>
        <Button
          size="icon-sm"
          onClick={() => toggleLike.mutate({ id: props.talk.id })}
          loading={toggleLike.isPending}
        >
          {props.talk.isFavorite ? (
            <HeartIcon className="fill-negative-500 text-negative-500" />
          ) : (
            <HeartPlusIcon />
          )}
        </Button>
      </CardHeader>
    </Card>
  );
};
