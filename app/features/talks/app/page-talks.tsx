import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { Logo } from '@/components/brand/logo';
import { Spinner } from '@/components/ui/spinner';

import { TalkCard } from '@/features/talks/app/talk-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageTalks = () => {
  const talksQuery = useInfiniteQuery(
    orpc.talk.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const ui = getUiState((set) => {
    if (talksQuery.status === 'pending') return set('pending');
    if (talksQuery.status === 'error') return set('error');

    const items = talksQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-2">
          <p>Talks</p>
          {ui
            .match('pending', () => <Spinner />)
            .match('error', () => <></>)
            .match('empty', () => <></>)
            .match('default', ({ items }) =>
              items.map((item) => <TalkCard key={item.id} talk={item} />)
            )
            .exhaustive()}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
