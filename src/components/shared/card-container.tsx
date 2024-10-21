import React from 'react';

import { cn } from '@/lib/utils';

export default function CardContainer({
  children,
  className,
}: {
  children: any;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border bg-primary-foreground p-6', className)}>
      {children}
    </div>
  );
}
