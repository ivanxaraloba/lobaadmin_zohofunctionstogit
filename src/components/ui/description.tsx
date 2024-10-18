import React from 'react';

import { cn } from '@/lib/utils';

export default function Description({ children, className }: any) {
  return <div className={cn('text-xs text-muted-foreground', className)}>{children}</div>;
}
