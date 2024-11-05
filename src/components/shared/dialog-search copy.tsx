'use client';

import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import { CRMFunctions } from '@/types/applications';
import { Project } from '@/types/types';
import { useHotkeys } from '@mantine/hooks';
import { ChevronsUpDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGlobalStore } from '@/stores/global';
import { useFilters } from '@/hooks/use-filters';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import BadgeApplication from './badge-application';

export default function DialogSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const { projects } = useGlobalStore();
  const router = useRouter();

  useHotkeys([['mod+K', () => setIsOpen((prev) => !prev)]]);

  const { data, search, setSearch } = useFilters({
    data: projects,
    filterConfig: [],
    searchMatchFn: (project, searchValue) => {
      if (!searchValue) return false;

      const lowerSearchValue = searchValue.toLowerCase();
      const functionsMatch = project.crm?.functions?.some((func: CRMFunctions) =>
        func?.workflow?.toLowerCase().includes(lowerSearchValue),
      );
      const nameMatch = project.name?.toLowerCase().includes(lowerSearchValue);

      return nameMatch || functionsMatch;
    },
  });

  const filterProjectFunctions = (project: Project) => {
    return project.crm?.functions?.filter(
      (func: CRMFunctions) =>
        func.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        func.workflow?.toLowerCase().includes(search.toLowerCase()),
    );
  };

  const redirect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-6/12 gap-0 p-0 sm:max-w-full">
        <DialogHeader className="border-b bg-primary-foreground p-3 pb-0">
          <DialogTitle>
            <div className="flex items-center pb-3">
              <Search className="mr-2 size-4 text-muted-foreground" />
              <div className="relative w-full">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a project or CRM function..."
                  className="border-none bg-primary-foreground font-normal !ring-0"
                />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-[400px] flex-col gap-2 overflow-auto p-3">
          {data?.map((project: Project) => {
            const functions = filterProjectFunctions(project);
            return (
              <Collapsible key={project.id}>
                <button
                  onClick={() => redirect(`/projects/${project.username}`)}
                  className="group flex w-full flex-row rounded-md border p-3 text-left text-xs hover:bg-primary-foreground"
                >
                  <div className="flex w-full flex-row items-center justify-between gap-y-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="flex-shrink truncate pr-4 text-xs">{project.name}</p>
                    </div>
                    <div className="flex h-fit items-center gap-x-1.5">
                      {!!project.crm && (
                        <BadgeApplication
                          className={cn(!functions?.length && 'opacity-50')}
                          application="crm"
                        />
                      )}
                      {!!project.creator?.creatorApps?.length && (
                        <BadgeApplication application="creator" className="opacity-50" />
                      )}
                      {!!project.recruit && (
                        <BadgeApplication application="recruit" className="opacity-50" />
                      )}
                      <CollapsibleTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="[data-state=open]:hidden"
                      >
                        <ChevronsUpDown className="size-4" />
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </button>
                <CollapsibleContent>
                  <div className="mt-1 flex h-full w-full flex-col gap-1 rounded-md bg-primary-foreground p-3">
                    {functions?.map((functionInfo: CRMFunctions, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full border text-xs"
                        onClick={() =>
                          redirect(
                            `/projects/${project.username}/crm?function=${functionInfo.name}&search=${search}`,
                          )
                        }
                      >
                        {functionInfo.display_name}
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
