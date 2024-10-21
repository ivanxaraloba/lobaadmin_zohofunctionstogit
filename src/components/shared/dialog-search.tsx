'use client';

import React, { useState } from 'react';

import { Project } from '@/types/types';
import { useHotkeys } from '@mantine/hooks';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useGlobalStore } from '@/stores/global';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import BadgeApplication from './badge-application';
import DialogCreateProject from './dialog-create-project';

export default function DialogSearch({ children }: any) {
  const [open, setOpen] = useState(false);
  const [openCreateProject, setOpenCreateProject] = useState(false);

  const { projects } = useGlobalStore();
  const router = useRouter();

  useHotkeys([['mod+K', () => setOpen((open) => !open)]]);
  const redirect = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>{children}</button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setOpenCreateProject(true);
                setOpen(false);
              }}
            >
              <div className="flex w-full flex-row items-center justify-between gap-y-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-shrink items-center gap-2 truncate text-xs">
                    <PlusCircle strokeWidth={1} className="size-4" />
                    <p>New Project</p>
                  </div>
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((project: Project, index: number) => (
              <CommandItem
                key={index}
                onSelect={() => redirect(`/projects/${project.username}`)}
              >
                <div className="flex w-full flex-row items-center justify-between gap-y-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="flex-shrink truncate pr-4 text-xs">{project.name}</p>
                  </div>
                  <div className="flex h-fit items-center gap-x-1.5">
                    {!!project.crm && <BadgeApplication application="crm" />}
                    {!!project.creator?.creatorApps?.length && (
                      <BadgeApplication application="creator" />
                    )}
                    {!!project.recruit && <BadgeApplication application="recruit" />}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <DialogCreateProject open={openCreateProject} onOpenChange={setOpenCreateProject} />
    </>
  );
}
