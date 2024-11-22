'use client';

import { useState } from 'react';

import { ChevronsUpDown, Command, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';

import DialogSearch from '../shared/dialog-search';
import { Combobox } from '../ui/combobox';

const Slash = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      shapeRendering="geometricPrecision"
      className="text-muted-foreground/80"
    >
      <path d="M16 3.549L7.12 20.600"></path>
    </svg>
  );
};

export default function HeaderProject() {
  const router = useRouter();
  const { projects } = useGlobalStore();
  const { project } = useProjectStore();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex h-12 w-full items-center gap-1 border-b px-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          router.push(
            `/projects?departments=${project?.departments.id}`,
          )
        }
      >
        {project?.departments?.name}
      </Button>
      <Slash />
      <Combobox
        size="sm"
        variant="ghost"
        className="w-fit"
        items={projects.map((i) => ({
          label: i.name,
          value: i.username,
        }))}
        value={project?.username}
        onChange={(username: string) =>
          router.push(`/projects/${username}`)
        }
      />
    </div>
  );
}
