import React from 'react';

import { PopoverClose } from '@radix-ui/react-popover';
import { SlidersHorizontal, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function PopoverFilters({ children, count }: { children: any; count?: number }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="icon" className="relative">
          {!!count && count > 0 && (
            <Badge className="absolute -bottom-1 -left-1 flex size-4 items-center justify-center rounded-full p-0 text-[8px]">
              {count}
            </Badge>
          )}
          <SlidersHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <div className="flex w-full items-center border-b bg-primary-foreground p-3 px-4">
          <span className="text-sm">Filters</span>
          <PopoverClose className="ml-auto">
            <X className="size-4" />
          </PopoverClose>
        </div>
        <div className="space-y-4 p-4">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
