import React from 'react';

import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import BadgeApplication from './badge-application';

export default function CardProject({ project }: { project: any }) {
  return (
    <Link
      prefetch
      href={`/projects/${project.username}`}
      className={cn(
        'bg-surface-10 border-surface group relative flex max-h-28 cursor-pointer flex-row rounded-md border p-5 !px-0 text-left transition duration-150 ease-in-out hover:bg-primary-foreground',
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col justify-between gap-y-2 px-5',
        )}
      >
        <div className="flex flex-col gap-0.5">
          <p className="flex-shrink truncate pr-4 text-sm">
            {project.name}
          </p>
          <span className="text-sm text-muted-foreground">
            zoho.{project.domain}
          </span>
        </div>
        <div className="flex items-center gap-x-1.5">
          {!!project.crm && (
            <BadgeApplication
              href={`/projects/${project.username}/crm`}
              application="crm"
            />
          )}
          {!!project.creator?.creatorApps?.length && (
            <BadgeApplication
              href={`/projects/${project.username}/creator`}
              application="creator"
            />
          )}
          {!!project.recruit && (
            <BadgeApplication
              href={`/projects/${project.username}/recruit`}
              application="recruit"
            />
          )}
        </div>
      </div>
      <div className="text-foreground-lighter absolute right-4 top-4 transition-all duration-200 group-hover:right-2 group-hover:text-foreground">
        <ChevronRight strokeWidth={1} />
      </div>
    </Link>
  );
}
