import { ALargeSmall, WholeWord } from "lucide-react";
import React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  search: {
    text: string;
    caseSensitive: boolean;
    wholeWord: boolean;
  };
  setSearch: React.Dispatch<React.SetStateAction<any>>;
  className?: string;
  [key: string]: any;
}

export default function SearchInput({
  search = {
    text: "",
    caseSensitive: false,
    wholeWord: false,
  },
  setSearch,
  className = "",
  ...props
}: SearchInputProps) {
  return (
    <div className="flex items-center w-full">
      <div className={cn("relative flex items-center w-full", className)}>
        <Input
          value={search?.text}
          onChange={(e) =>
            setSearch((prev: any) => ({ ...prev, text: e.target.value }))
          }
          {...props}
        />
        <div className="absolute right-3 flex items-center gap-1">
          <Button
            variant={search.caseSensitive ? "secondary" : "ghost"}
            size="icon"
            className="size-6 rounded-sm"
            onClick={() =>
              setSearch((prev: any) => ({
                ...prev,
                caseSensitive: !prev.caseSensitive,
              }))
            }
          >
            <ALargeSmall className="size-4" />
          </Button>
          <Button
            variant={search.wholeWord ? "secondary" : "ghost"}
            size="icon"
            className="size-6 rounded-sm"
            onClick={() =>
              setSearch((prev: any) => ({
                ...prev,
                wholeWord: !prev.wholeWord,
              }))
            }
          >
            <WholeWord className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
