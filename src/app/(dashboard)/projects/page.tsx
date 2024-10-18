'use client';

import { useState } from 'react';

import { PopoverClose } from '@radix-ui/react-popover';
import { PlusIcon, SlidersHorizontal, X } from 'lucide-react';

import CardProject from '@/components/shared/card-project';
import DialogCreateProject from '@/components/shared/dialog-create-project';
import PopoverFilters from '@/components/shared/popover-filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputSearch from '@/components/ui/input-search';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGlobalStore } from '@/stores/global';
import { useFilters } from '@/hooks/useFilters';
import { APPLICATIONS } from '@/utils/constants';
import { matchByWords } from '@/utils/filters';

export default function Page() {
  const { projects, departments } = useGlobalStore();
  const [open, setOpen] = useState(false);
  const { data, search, setSearch, filters, setFilters, filtersCount, searchMatches, setSearchMatches } = useFilters({
    data: projects,
    filterConfig: [
      {
        key: 'departments',
        type: 'array',
        transformParams: (e) => e.map(Number),
        matchFn: (project: any, filterValue: number[]) => {
          return filterValue.includes(project.departments.id);
        },
      },
      {
        key: 'applications',
        type: 'array',
        matchFn: (project: any, filterValue: string[]) => filterValue.some((app: string) => project[app]),
      },
    ],
    searchMatchFn: (data: any, searchValue: string) => {
      return matchByWords(data, searchValue, ['name'], searchMatches);
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <DialogCreateProject open={open} onOpenChange={setOpen}>
          <Button className="text-start">
            <PlusIcon className="mr-2 size-4" />
            <span>New project</span>
          </Button>
        </DialogCreateProject>
        <InputSearch
          placeholder="Search Project"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          setSearchMatches={setSearchMatches}
          searchMatches={{
            caseSensitive: searchMatches.caseSensitive,
            wholeWord: searchMatches.wholeWord,
          }}
        />
        <PopoverFilters count={filtersCount}>
          <div className="space-y-1.5">
            <Label>Departments</Label>
            <MultiSelect
              defaultValue={filters.departments}
              options={departments.map((el: any) => ({
                label: el.name,
                value: el.id,
              }))}
              onValueChange={(e: any) => setFilters({ departments: e })}
              placeholder="Select departments"
              maxCount={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Applications</Label>
            <MultiSelect
              defaultValue={filters.applications}
              options={APPLICATIONS}
              onValueChange={(e) => setFilters({ applications: e })}
              placeholder="Select applications"
              maxCount={3}
            />
          </div>
        </PopoverFilters>
      </div>
      <div className="my-6 space-y-4">
        {data?.map((project, index) => <CardProject key={index} project={project} />)}
      </div>
    </div>
  );
}
