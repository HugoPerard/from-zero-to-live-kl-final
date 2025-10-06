import { createFileRoute } from '@tanstack/react-router';

import { PageTalks } from '@/features/talks/app/page-talks';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageTalks />;
}
