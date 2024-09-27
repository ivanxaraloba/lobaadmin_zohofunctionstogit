import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Ban, ChevronsUpDown, Parentheses } from "lucide-react";
import { Button } from "../ui/button";
import { str } from "@/utils/generic";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Props {
  label: string;
  items: [];
  activeFunction: any;
  setActiveFunction: any;
  functionKeys: {
    id: string;
    name: string;
    code: string;
    updateTime?: string;
    createTime?: string;
  };
}

export default function CollapsibleGroupFunctions({
  label,
  items,
  activeFunction,
  setActiveFunction,
  functionKeys,
}: Props) {
  return (
    <Collapsible
      defaultOpen={true}
      className="bg-primary-foreground p-6 rounded-2xl"
    >
      <div className="flex items-center w-full gap-2">
        <Parentheses className="size-4" />
        <span className="text-base">{label}</span>
        <span className="text-xs mt-[4px] text-muted-foreground">
          ( {items.length} )
        </span>

        <div className="ml-auto">
          <CollapsibleTrigger className="[data-state=open]:hidden">
            <ChevronsUpDown className="size-4" />{" "}
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent className="mt-4">
        {items?.length > 0 && (
          <div className="flex flex-col gap-2">
            {items.map((func: any, index: number) => (
              <Button
                key={index}
                variant={
                  func[functionKeys.id] === activeFunction?.[functionKeys.id]
                    ? "outline"
                    : "ghost"
                }
                className="text-xs justify-start truncate border border-transparent"
                onClick={() => setActiveFunction(func)}
              >
                <span>
                  {str.decodeHtmlSpecialChars(func[functionKeys.name])}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {!func[functionKeys.code]?.length && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Ban className="size-3 text-red-400" />
                        </TooltipTrigger>
                        <TooltipContent>No Code</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
