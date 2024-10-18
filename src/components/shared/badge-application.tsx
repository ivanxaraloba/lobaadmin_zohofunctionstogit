import React, { HTMLAttributeAnchorTarget } from 'react';

import { cn } from '@/lib/utils';
import Link from 'next/link';

import { Badge } from '../ui/badge';

interface Props {
  application: 'crm' | 'creator' | 'recruit';
  onClick?: () => void;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  className?: string;
}

export default function BadgeApplication({ application, onClick, target, href, className }: Props) {
  const badgeContent = (
    <>
      <div
        className={cn(
          'size-1 rounded-full',
          application === 'crm' && 'bg-crm',
          application === 'creator' && 'bg-creator',
          application === 'recruit' && 'bg-recruit',
        )}
      />
      <span className="text-[10px] uppercase">{application}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} onClick={onClick}>
        <Badge variant="outline" className={cn('gap-2 rounded-full hover:bg-secondary', className)}>
          {badgeContent}
        </Badge>
      </Link>
    );
  }

  return (
    <Badge
      onClick={onClick}
      variant="outline"
      className={cn('gap-2 rounded-full', onClick && 'hover:bg-secondary', className)}
    >
      {badgeContent}
    </Badge>
  );
}
