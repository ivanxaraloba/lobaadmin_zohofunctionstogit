"use client";

import { useProjectStore } from "@/stores/project";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Combobox } from "../ui/combobox";
import { useGlobalStore } from "@/stores/global";
import { useRouter } from "next/navigation";

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

  return (
    <div className="h-12 px-10 w-full gap-1 flex items-center border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          router.push(`/projects?departments=${project?.departments.id}`)
        }
      >
        {project?.departments?.name}
      </Button>
      <Slash />
      <Combobox
        size="sm"
        variant="ghost"
        className="w-fit"
        items={projects.map((i) => ({ label: i.name, value: i.username }))}
        value={project?.username}
        onChange={(username: string) => router.push(`/projects/${username}`)}
      />
    </div>
  );
}
