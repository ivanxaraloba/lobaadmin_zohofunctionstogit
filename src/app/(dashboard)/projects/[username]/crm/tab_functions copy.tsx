"use client";

import { TypographyH1 } from "@/components/typography/typography-h1";
import ButtonLoading from "@/components/ui/button-loading";
import { crmGetFunction, crmGetFunctions } from "@/helpers/zoho/crm";
import { supabase } from "@/lib/supabase/client";
import { Project } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import {
  ALargeSmall,
  ArrowUpFromLine,
  Book,
  Meh,
  Parentheses,
  RefreshCcw,
  WholeWord,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CodeViewer from "@/components/shared/code-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/stores/project";
import { formatInTimeZone } from "date-fns-tz";
import DialogSettingsCRM from "@/components/shared/dialog-settings-crm";
import { useSearch } from "@/hooks/useSearch";
import SearchInput from "@/components/ui/search-input";
import {
  bitbucketCommit,
  bitbucketCreateRepository,
  bitbucketGetRepository,
} from "@/helpers/bitbucket";
import Description from "@/components/ui/description";
import { arr, str, time } from "@/utils/generic";
import { TypographyH2 } from "@/components/typography/typography-h2";
import { format } from "date-fns";
import { useGlobalStore } from "@/stores/global";
import ScriptViewer from "@/components/shared/code-viewer";
import { CRMFunctions } from "@/types/applications";
import { LinkNavTabs } from "@/components/vercel/link-nav-tabs";
import Link from "next/link";
import { ButtonNavTabs } from "@/components/vercel/button-nav-tabs";
import LogoCrm from "@/assets/img/logo-crm";
import { PushToGitButton } from "@/components/shared/button-push-to-git";
import MultipleSelector from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TabFunctions({ username }: { username: string }) {
  const { project, getProject } = useProjectStore();
  const [activeFunction, setActiveFunction] = useState<any>(null);

  const mutationRefresh = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Project data is not available.");

      const functions = await crmGetFunctions(
        project.domain,
        project.crm?.config
      );

      const functionsWithCode = await Promise.all(
        (functions || []).map((functionInfo: any) =>
          crmGetFunction(project.domain, project.crm?.config, functionInfo)
        )
      );

      const { error } = await supabase
        .from("crm")
        .update({
          functions: functionsWithCode.filter((x: any) => !!x.id),
          lastSync: time.getTimestamptz(),
        })
        .eq("id", project.crm?.id);

      if (error) throw new Error("Failed to update project functions");
    },
    onSuccess: () => {
      getProject(username);
      toast.success("Project functions updated successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Mutation failed. Please try again.");
    },
  });

  const onCommitSuccess = async () => {
    if (!project?.crm) return;

    const { error } = await supabase
      .from("crm")
      .update({
        lastCommit: time.getTimestamptz(),
      })
      .eq("id", project.crm.id);

    if (error) toast.error("Error updating project committed time");
  };

  const { data, search, setSearch, setColumns } = useSearch({
    data: project?.crm?.functions,
    searchKeys: ["script", "display_name"],
    groupBy: "category",
  });

  return (
    project?.crm && (
      <>
        {/* Header */}
        <div className="py-10 border-b">
          <TypographyH2 className>Functions</TypographyH2>
          {/* Information & Buttons */}
          <div className="flex items-center">
            <div className="flex flex-col mt-4 gap-2">
              <Description className="flex items-center gap-2">
                <Parentheses className="size-3" />A total of{" "}
                {project?.crm?.functions?.length || 0} functions
              </Description>
              <Description className="flex items-center gap-2">
                <RefreshCcw className="size-3" />
                Last sync occurred {time.timeAgo(project?.crm?.lastSync) || "-"}
              </Description>
              <Description className="flex items-center gap-2">
                <ArrowUpFromLine className="size-3" />
                Last commit occurred{" "}
                {time.timeAgo(project?.crm?.lastCommit) || "-"}
              </Description>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <PushToGitButton
                project={project}
                data={project?.crm?.functions?.map((func: any) => ({
                  folder: `crm/functions/${func.display_name}.dg`,
                  script: func.workflow,
                }))}
                onSuccess={onCommitSuccess}
              />
              <ButtonLoading
                icon={RefreshCcw}
                loading={mutationRefresh.isPending}
                onClick={() => mutationRefresh.mutate()}
              >
                <span>Sync</span>
              </ButtonLoading>
            </div>
          </div>
        </div>
        {/* Functions */}
        <div className="mt-10">
          {project?.crm?.functions?.length ? (
            <div className="flex flex-col gap-4">
              <div className="flex w-full gap-4">
                <SearchInput
                  placeholder="Search for function name or code"
                  search={search}
                  setSearch={setSearch}
                />
                <Select
                  onValueChange={(e: any) =>
                    // @ts-ignore
                    setColumns([{ key: "category", value: e }])
                  }
                >
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: "All", value: null },
                      ...FUNCTIONS_CATEGORIES,
                    ].map((item: any, index: number) => (
                      <SelectItem value={item.value} key={index}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-x-10 rounded-2xl">
                <div className="flex flex-col text-sm gap-10">
                  {data.map((item: any, index: any) => {
                    return (
                      <div
                        key={index}
                        className="bg-primary-foreground p-8 rounded-2xl"
                      >
                        {/* Title */}
                        <div className="flex items-center gap-2">
                          <Book className="size-4" />
                          <span className="text-lg">{item.label}</span>
                        </div>
                        {/* Elements */}
                        {item.items?.length > 0 && (
                          <div className="mt-4 flex flex-col gap-2">
                            {item.items.map((func: any, index: number) => (
                              <Button
                                key={index}
                                size="sm"
                                variant={
                                  func.id === activeFunction?.id
                                    ? "secondary"
                                    : "ghost"
                                }
                                className="text-sm justify-start truncate"
                                onClick={() => setActiveFunction(func)}
                              >
                                {str.decodeHtmlSpecialChars(func.display_name)}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-primary-foreground col-span-2 p-8 rounded-2xl h-[calc(100vh-40px)] sticky top-4 overflow-auto">
                  <ScriptViewer script={activeFunction?.workflow} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center w-full gap-4">
              <Meh />
              <TypographyH1>No functions have been added yet</TypographyH1>
            </div>
          )}
        </div>
      </>
    )
  );
}
