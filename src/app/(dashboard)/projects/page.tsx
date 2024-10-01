"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { APPLICATIONS } from "@/utils/constants";
import { SlidersHorizontal, X } from "lucide-react";
import DialogCreateProject from "@/components/shared/dialog-create-project";
import CardProject from "@/components/shared/card-project";
import { useGlobalStore } from "@/stores/global";
import { PopoverClose } from "@radix-ui/react-popover";
import { useFilters } from "@/hooks/useFilters";
import PopoverFilters from "@/components/shared/popover-filters";

export default function Page() {
  const { projects, departments } = useGlobalStore();

  const { count, data, search, setSearch, filters, setFilters } = useFilters({
    data: projects,
    filterConfig: [
      {
        key: "departments",
        type: "array",
        transformParams: (e) => e.map(Number),
        matchFn: (project: any, filterValue: number[]) => {
          return filterValue.includes(project.departments.id);
        },
      },
      {
        key: "applications",
        type: "array",
        matchFn: (project: any, filterValue: string[]) =>
          filterValue.some((app: string) => project[app]),
      },
    ],
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <DialogCreateProject />
        <Input
          placeholder="Search Project"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <PopoverFilters count={count}>
          <div className="space-y-1.5">
            <Label>Departments</Label>
            <MultiSelect
              defaultValue={filters.departments}
              options={departments.map((el: any) => ({
                label: el.name,
                value: el.id,
              }))}
              onValueChange={(selected: any) =>
                setFilters((prev: any) => ({
                  ...prev,
                  departments: selected,
                }))
              }
              placeholder="Select departments"
              maxCount={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Applications</Label>
            <MultiSelect
              defaultValue={filters.applications}
              options={APPLICATIONS}
              onValueChange={(selected) =>
                setFilters((prev: any) => ({
                  ...prev,
                  applications: selected,
                }))
              }
              placeholder="Select applications"
              maxCount={3}
            />
          </div>
        </PopoverFilters>
      </div>
      <div className="my-6 space-y-4">
        {data?.map((project, index) => (
          <CardProject key={index} project={project} />
        ))}
      </div>
    </div>
  );
}
