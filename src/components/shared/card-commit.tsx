import React from 'react';

import { cn } from '@/lib/utils';
import { Commit, Project } from '@/types/types';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../ui/button';
import Description from '../ui/description';

export default function CardCommit({ commit }: { commit: Commit }) {
  return (
    <div key={commit.id} className="flex items-center p-4 py-3">
      <div
        className={cn(
          'mr-4 size-2 rounded-full',
          commit.status === 'committed' ? 'bg-green-400' : 'bg-amber-400',
        )}
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{commit.message}</span>
        <Description className="flex items-center gap-2 text-xs">
          <span>
            {commit.users.bbUsername} • {format(commit.created_at, 'dd-MM-yyyy HH:mm:ss')}
          </span>
        </Description>
      </div>
      <div className="ml-auto">
        <Link
          target="_blank"
          href={`/projects/${commit.projects?.username}/${commit.path.split('/')[0]}?commit=${commit.id}`}
        >
          <Button size="icon" variant="ghost">
            <Eye className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
