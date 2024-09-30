import React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal, X } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";

export default function PopoverFilters({
  children,
  count,
}: {
  children: any;
  count?: number;
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="icon" className="relative">
          {count && count > 0 && (
            <Badge className="size-4 p-0 flex items-center justify-center rounded-full absolute text-[8px] -bottom-1 -left-1">
              {count}
            </Badge>
          )}
          <SlidersHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <div className="flex items-center w-full border-b p-3 px-4 bg-primary-foreground">
          <span className="text-sm">Filters</span>
          <PopoverClose className="ml-auto">
            <X className="size-4" />
          </PopoverClose>
        </div>
        <div className="p-4 space-y-4">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
