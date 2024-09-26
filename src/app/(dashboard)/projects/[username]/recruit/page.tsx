"use client";

import DialogSettingsRecruit from "@/components/shared/dialog-settings-recruit";
import { TypographyH1 } from "@/components/typography/typography-h1";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/project";
import React from "react";
import CodeViewer from "@/components/shared/code-viewer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ButtonLoading from "@/components/ui/button-loading";
import { ArrowUpFromLine, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  recruitGetFunction,
  recruitGetFunctions,
} from "@/helpers/zoho/recruit";

import {
  bitbucketCommit,
  bitbucketCreateRepository,
  bitbucketGetRepository,
} from "@/helpers/bitbucket";

import { formatInTimeZone } from "date-fns-tz";
import { supabase } from "@/lib/supabase/client";
import { useSearch } from "@/hooks/useSearch";
import SearchInput from "@/components/ui/search-input";
import { TypographyH2 } from "@/components/typography/typography-h2";
import Description from "@/components/ui/description";
import { time } from "@/utils/generic";
import { format } from "date-fns";
import { useGlobalStore } from "@/stores/global";
import { PushToGitButton } from "@/components/shared/button-push-to-git";

export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;
  const { user, getUser } = useGlobalStore();
  const { project, getProject } = useProjectStore();

  const mutationRefresh = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Project data is not available.");

      const functions = await recruitGetFunctions(
        project.domain,
        project.recruit?.config
      );

      const functionsWithCode = await Promise.all(
        (functions || []).map((functionInfo: any) =>
          recruitGetFunction(
            project.domain,
            project.recruit?.config,
            functionInfo.id
          )
        )
      );

      const { error } = await supabase.from("recruit").upsert({
        id: project.recruit?.id,
        projectId: project.id,
        functions: functionsWithCode.filter((x: any) => !!x.id),
        lastSync: formatInTimeZone(
          new Date(),
          "Europe/Lisbon",
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
      });

      if (error) throw new Error("Failed to update project functions");
    },
    onSuccess: () => {
      getProject(username);
      toast.success("Project functions updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Mutation failed. Please try again.");
    },
  });

  const { data, filters, setFilters } = useSearch(
    project?.recruit?.functions || [],
    "script",
    ["display_name"]
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-end">
        <div className="flex gap-2">
          <TypographyH1>Zoho Recruit</TypographyH1>
          <DialogSettingsRecruit />
        </div>
      </div>
      {project?.recruit && (
        <>
          <div className="flex items-end">
            <div className="grid">
              <TypographyH2>Functions</TypographyH2>
              <Description>
                Last sync occurred {time.timeAgo(project.recruit?.lastSync)}
              </Description>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <PushToGitButton
                project={project}
                data={project?.recruit?.functions?.map((func: any) => ({
                  folder: `recruit/functions/${func.display_name}.dg`,
                  script: func.workflow,
                }))}
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
          <div className="flex flex-col gap-4">
            <SearchInput
              placeholder="Search for function name or code"
              filters={filters}
              setFilters={setFilters}
            />
            <span className="text-xs text-muted-foreground mt-4">
              Total functions: {project?.recruit?.functions?.length || 0}
            </span>
            {data?.map((func: any, index: number) => (
              <Dialog key={index}>
                <DialogTrigger>
                  <Button key={index} variant="outline" className="w-full">
                    {func?.display_name}
                  </Button>
                </DialogTrigger>
                <DialogContent className="!max-w-max !w-7/12 max-h-[500px] overflow-auto">
                  <DialogTitle className="border-b pb-4">
                    {func?.display_name}
                  </DialogTitle>
                  <div className="overflow-auto min-w-96">
                    <CodeViewer script={func?.workflow} />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
