import React from 'react';

import { cn } from '@/lib/utils';
import { Frown, LucideProps } from 'lucide-react';

import { TypographyH2 } from '../typography/typography-h2';
import { TypographyH3 } from '../typography/typography-h3';
import CardContainer from './card-container';

export default function SectionMissing({
  icon: Icon, // Capitalize the prop name when using it as a component
  message,
  className,
}: {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  message: string;
  className?: string;
}) {
  return (
    <CardContainer
      className={cn('flex h-52 w-full items-center justify-center gap-4', className)}
    >
      <Icon className="size-5" />
      <TypographyH3>{message}</TypographyH3>
    </CardContainer>
  );
}
