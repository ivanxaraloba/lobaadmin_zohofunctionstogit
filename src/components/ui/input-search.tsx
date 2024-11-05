import React from 'react';

import { cn } from '@/lib/utils';
import { ALargeSmall, WholeWord } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';

interface Props {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchMatches: { caseSensitive?: boolean; wholeWord?: boolean };
  setSearchMatches: any;
}

export default function InputSearch({
  searchMatches,
  setSearchMatches,
  ...inputProps
}: Props) {
  return (
    <div className="relative flex w-full items-center">
      <div className={cn('flex w-full items-center')}>
        <Input {...inputProps} />
      </div>
      <div className="absolute right-3 flex items-center gap-1">
        {searchMatches.hasOwnProperty('caseSensitive') && (
          <Button
            variant={searchMatches.caseSensitive ? 'secondary' : 'ghost'}
            size="icon"
            className="size-6 rounded-sm"
            onClick={() =>
              setSearchMatches({ caseSensitive: !searchMatches.caseSensitive })
            }
          >
            <ALargeSmall className="w-4" />
          </Button>
        )}
        {searchMatches.hasOwnProperty('wholeWord') && (
          <Button
            variant={searchMatches.wholeWord ? 'secondary' : 'ghost'}
            size="icon"
            className="size-6 rounded-sm"
            onClick={() => setSearchMatches({ wholeWord: !searchMatches.wholeWord })}
          >
            <WholeWord className="w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
