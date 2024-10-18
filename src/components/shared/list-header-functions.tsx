import React from 'react';

import { ChevronsUpDown, Parentheses } from 'lucide-react';

import { CollapsibleTrigger } from '../ui/collapsible';

export default function ListHeaderFunction({ label, length }: { label: string; length: number }) {
  return (
    <div className="flex w-full items-center gap-2">
      <Parentheses className="size-4" />
      <span className="text-base">{label}</span>
      <span className="mt-[4px] text-xs text-muted-foreground">( {length} )</span>

      <div className="ml-auto">
        <CollapsibleTrigger className="[data-state=open]:hidden">
          <ChevronsUpDown className="size-4" />{' '}
        </CollapsibleTrigger>
      </div>
    </div>
  );
}
