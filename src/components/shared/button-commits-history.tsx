import React from 'react';

import { Commit } from '@/types/types';
import { History, Meh } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '../ui/button';
import CardCommit from './card-commit';
import SectionMissing from './section-missing';

export default function ButtonCommitsHistory({ commits = [] }: { commits: Commit[] }) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <History className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Commits</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-80 flex-col gap-4 overflow-auto pr-2">
          {commits.length ? (
            <div className="flex flex-col divide-y rounded-md border">
              {commits.map((commit: Commit) => (
                <CardCommit key={commit.id} commit={commit} />
              ))}
            </div>
          ) : (
            <SectionMissing
              className="h-fit"
              icon={Meh}
              message="No commits have been made yet"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
