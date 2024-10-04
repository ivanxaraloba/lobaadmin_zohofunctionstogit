"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronsUpDown, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useHotkeys } from "@mantine/hooks";
import { useGlobalStore } from "@/stores/global";
import { useFilters } from "@/hooks/useFilters";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { CRMFunctions } from "@/types/applications";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function DialogSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const { projects } = useGlobalStore();
  const router = useRouter();

  useHotkeys([["mod+K", () => setIsOpen((prev) => !prev)]]);

  const { data, search, setSearch } = useFilters({
    data: projects,
    filterConfig: [],
    searchMatchFn: (project, searchValue) => {
      if (!searchValue) return false;

      searchValue = searchValue.toLowerCase();

      const functionsMatch = project.crm?.functions?.some(
        (func: any) =>
          func && func.workflow?.toLowerCase().includes(searchValue)
      );

      const nameMatch = project.name?.toLowerCase().includes(searchValue);

      // Keep the project if the name or any function matches
      return nameMatch || functionsMatch;
    },
  });

  const redirect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-full w-6/12 p-0 gap-0">
        <DialogHeader className="p-3 pb-0 border-b bg-primary-foreground">
          <DialogTitle>
            <div className="flex items-center pb-3">
              <Search className="size-4 text-muted-foreground mr-2" />
              <div className="relative w-full">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="border-none !ring-0 font-normal bg-primary-foreground"
                />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="p-3 flex flex-col gap-2 h-[400px] overflow-auto">
          {data?.map((project) => {
            const filteredFunctions = project?.crm?.functions?.filter(
              (func: CRMFunctions) =>
                func.display_name
                  ?.toLowerCase()
                  .includes(search.toLowerCase()) ||
                func.workflow?.toLowerCase().includes(search.toLowerCase())
            );

            return (
              <Collapsible key={project.id}>
                <button
                  onClick={() => redirect(`/projects/${project.username}`)}
                  className="text-left w-full hover:bg-primary-foreground border rounded-md rounded-b-none flex flex-row group p-3 text-xs"
                >
                  <div className="w-full flex items-center justify-between gap-y-2 flex-row">
                    <div className="flex flex-col gap-0.5">
                      <p className="flex-shrink truncate text-xs pr-4">
                        {project.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-1.5 h-fit">
                      {!!project.crm && (
                        <button
                          onClick={() =>
                            redirect(`/projects/${project.username}/crm`)
                          }
                          className="items-center gap-2 border px-2.5 py-0.5 rounded-full text-center flex justify-center uppercase"
                        >
                          <div className="size-1 rounded-full bg-blue-400"></div>
                          <span className="text-xs">crm</span>
                        </button>
                      )}
                      {!!project.creator?.creatorApps?.length && (
                        <button
                          onClick={() =>
                            redirect(`/projects/${project.username}/creator`)
                          }
                          className="items-center gap-2 border px-2.5 py-0.5 rounded-full text-center flex justify-center uppercase"
                        >
                          <div className="size-1 rounded-full bg-emerald-400"></div>
                          <span className="text-xs">creator</span>
                        </button>
                      )}
                      {!!project.recruit && (
                        <button
                          onClick={() =>
                            redirect(`/projects/${project.username}/recruit`)
                          }
                          className="items-center gap-2 border px-2.5 py-0.5 rounded-full text-center flex justify-center uppercase"
                        >
                          <div className="size-1 rounded-full bg-rose-400"></div>
                          <span className="text-xs">recruit</span>
                        </button>
                      )}
                      <CollapsibleTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="[data-state=open]:hidden"
                      >
                        <ChevronsUpDown className="size-4" />{" "}
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </button>
                <CollapsibleContent className="h-full">
                  <div className="p-3 bg-primary-foreground h-full">
                    <div className="flex w-full h-full">
                      <div className="flex flex-col gap-1 w-full h-full">
                        {filteredFunctions &&
                          filteredFunctions.length > 0 &&
                          filteredFunctions.map(
                            (functionInfo: CRMFunctions, index: number) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="w-full border text-xs"
                              >
                                {functionInfo.display_name}
                              </Button>
                            )
                          )}
                      </div>
                      <div className="bg-blue-400 w-0.5 h-full ml-3 rounded-full" />
                    </div>
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
