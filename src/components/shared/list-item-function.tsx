'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Commit } from '@/types/types';
import {
  ArrowUpFromLine,
  Ban,
  CircleAlert,
  CircleFadingArrowUp,
  CircleSlash,
  GitCommitHorizontal,
  RefreshCcw,
  TriangleAlert,
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { str } from '@/utils/generic';

import { Button } from '../ui/button';

const TooltipIcon = ({ icon: Icon, text, className }: any) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Icon className={cn('size-3.5', className)} />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function ListItemFunction({
  activeFn,
  setActiveFn,
  functionInfo,
  functionName,
  functionId,
  functionCode,
  commitsObj = {},
  toCommit,
}: {
  activeFn: any;
  setActiveFn: any;
  functionInfo: any;
  functionName: string;
  functionId: string;
  functionCode: string;
  commitsObj: any;
  toCommit?: any;
}) {
  const commits = commitsObj[functionId] || [];
  const commitsPending = commits.filter((c: Commit) => c.status === 'pending');

  return (
    <Button
      variant={functionId === activeFn?.id ? 'outline' : 'ghost'}
      className="justify-start truncate border border-transparent text-xs"
      onClick={() => setActiveFn(functionInfo)}
    >
      <span>{str.decodeHtmlSpecialChars(functionName)}</span>
      <div className="ml-auto flex items-center gap-2">
        {!functionCode && (
          <TooltipIcon
            icon={TriangleAlert}
            text="Function is empty"
            className="text-red-400"
          />
        )}

        {!!commitsPending?.length ? (
          <TooltipIcon
            icon={ArrowUpFromLine}
            text={`${commitsPending.length} ready to push`}
            className="text-amber-500"
          />
        ) : (
          !!commits?.length && (
            <TooltipIcon
              icon={ArrowUpFromLine}
              text={`${commits.length} pushed commits`}
              className="text-green-500"
            />
          )
        )}

        {!!toCommit && (
          <TooltipIcon
            icon={CircleFadingArrowUp}
            text="To be committed"
            className="text-yellow-400"
          />
        )}
      </div>
    </Button>
  );
}
