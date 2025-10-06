import type { SVGProps } from 'react';

import { cn } from '@/lib/tailwind/utils';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <p className={cn('font-black text-primary', props.className)}>
    From Zero To Live
  </p>
);
