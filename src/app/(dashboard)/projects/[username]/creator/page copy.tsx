"use client";

import { TypographyH1 } from "@/components/typography/typography-h1";
import ButtonLoading from "@/components/ui/button-loading";
import {
  creatorGetAppStructure,
  creatorGetFunction,
} from "@/helpers/zoho/creator";
import { supabase } from "@/lib/supabase/client";
import { Project, creatorApp } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowUpFromLine,
  Book,
  FolderCode,
  RefreshCcw,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import DialogCreateCreatorApp from "@/components/shared/dialog-create-creator-app";
import { TypographyH2 } from "@/components/typography/typography-h2";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/project";
import DialogSettingsCreator from "@/components/shared/dialog-settings-creator";
import ScriptViewer from "@/components/shared/code-viewer";
import { formatInTimeZone } from "date-fns-tz";
import { Input } from "@/components/ui/input";
import { str, time } from "@/utils/generic";
import { cn } from "@/lib/utils";
import Description from "@/components/ui/description";
import {
  bitbucketCommit,
  bitbucketCreateRepository,
  bitbucketGetRepository,
} from "@/helpers/bitbucket";
import { format } from "date-fns";
import { useGlobalStore } from "@/stores/global";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PushToGitButton } from "@/components/shared/button-push-to-git";

export default function Page({ params }: { params: { username: string } }) {
  const router = useRouter();
  const { username } = params;
  const [app, setApp] = useState<creatorApp | null>(null);
  const [code, setCode] = useState<string>("");
  const { user, getUser } = useGlobalStore();
  const { project, getProject } = useProjectStore();
  const [search, setSearch] = useState("");

  const mutationRefreshCreator = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Project data is not available.");

      const { data: accordian, error: errorAccordian } =
        await creatorGetAppStructure(
          project.domain,
          project.creator?.config,
          project.creator?.owner,
          app?.name
        );

      if (errorAccordian) throw errorAccordian;

      const accordianWithCode = await Promise.all(
        // @ts-ignore
        accordian.map(async (functionInfo: any) => {
          const workflowsWithCode = await Promise.all(
            functionInfo.workflows.map(async (workflow: any) => {
              try {
                // Use creatorGetFunction to fetch workflow script
                const { script } = await creatorGetFunction(
                  project.domain,
                  project.creator?.config,
                  project.creator?.owner,
                  app?.name,
                  workflow.WFLinkName
                );

                return {
                  ...workflow,
                  script,
                };
              } catch (error) {
                console.error(
                  "Error fetching workflow script for",
                  workflow.WFLinkName,
                  error
                );
                return { ...workflow, script: null };
              }
            })
          );

          return {
            ...functionInfo,
            workflows: workflowsWithCode, // Attach fetched workflows with code
          };
        })
      );
      const { data, error } = await supabase
        .from("creatorApps")
        .update({
          id: project.crm?.id,
          accordian: accordianWithCode,
          lastSync: formatInTimeZone(
            new Date(),
            "Europe/Lisbon",
            "yyyy-MM-dd'T'HH:mm:ss"
          ),
        })
        .eq("creatorId", project.creator?.id)
        .eq("name", app?.name)
        .select()
        .single();

      if (error) throw new Error("Failed to update app accordian");

      return data;
    },
    onSuccess: (data: creatorApp) => {
      setApp(data);
      toast.success("App functions updated successfully.");
    },
    onError: (err) => {
      toast.error(typeof err === "string" ? err : err?.message);
    },
  });

  const mutationDeleteApp = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Project data is not available");

      const { error } = await supabase
        .from("creatorApps")
        .delete()
        .eq("id", app?.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await getProject(username);
      setApp(null);
      toast.success("App deleted successfully!");
    },
    onError: (err) => {
      toast.error(typeof err === "string" ? err : err?.message);
    },
  });

  const lowercasedSearch = search.toLowerCase();
  const filteredAccordian = app?.accordian?.reduce((acc: any[], form: any) => {
    const formNameLower = form?.name?.toLowerCase() || "";

    if (formNameLower.includes(lowercasedSearch)) {
      acc.push({ ...form, workflows: form.workflows });
      return acc;
    }

    const filteredWorkflows = form.workflows.filter((workflow: any) => {
      const script = workflow.script?.trim().toLowerCase();
      const wfLinkName = workflow.WFLinkName?.trim().toLowerCase();

      return (
        (script || wfLinkName) &&
        (script?.includes(lowercasedSearch) ||
          wfLinkName?.includes(lowercasedSearch))
      );
    });

    if (filteredWorkflows.length > 0) {
      acc.push({ ...form, workflows: filteredWorkflows });
    }

    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-2">
        <TypographyH1>Zoho Creator</TypographyH1>
        <DialogSettingsCreator />
      </div>
      {project?.creator && (
        <>
          <div className="flex items-center gap-2">
            <DialogCreateCreatorApp />
            {project?.creator?.creatorApps &&
              project?.creator?.creatorApps.map((item, index) => (
                <Button
                  key={index}
                  variant={app?.id === item.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApp(item)}
                >
                  {item.name}
                </Button>
              ))}
          </div>
          {app?.id && (
            <div>
              <div className="flex items-end">
                <div className="grid">
                  <TypographyH2>Workflows</TypographyH2>
                  <Description>
                    Last sync occurred {time.timeAgo(app.lastSync)}
                  </Description>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <PushToGitButton
                    project={project}
                    data={app?.accordian?.flatMap((form: any) =>
                      (form.workflows ?? []).map((func: any) => ({
                        folder: `creator/workflows/${func.WFName}.dg`,
                        script: func.script,
                      }))
                    )}
                  />
                  <ButtonLoading
                    icon={RefreshCcw}
                    loading={mutationRefreshCreator.isPending}
                    onClick={() => mutationRefreshCreator.mutate()}
                  >
                    <span>Sync</span>
                  </ButtonLoading>
                  <ButtonLoading
                    variant="destructive"
                    icon={Trash}
                    loading={mutationDeleteApp.isPending}
                    onClick={() => mutationDeleteApp.mutate()}
                  >
                    <span>Delete</span>
                  </ButtonLoading>
                </div>
              </div>
              <div className="w-full pb-4">
                <Input
                  className="mt-10"
                  placeholder="Search for function name or code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {filteredAccordian?.length > 0 && (
                <div className="grid grid-cols-3 mt-6 gap-x-10 rounded-2xl">
                  <div className="flex flex-col text-sm gap-10">
                    {filteredAccordian.map((form: any, index: any) => (
                      <div
                        key={index}
                        className="bg-primary-foreground p-8 rounded-2xl"
                      >
                        {/* Form Name */}
                        <div className="flex items-center gap-2">
                          <Book className="size-4" />
                          <span className="text-lg">{form.name}</span>
                        </div>
                        {/* Reports / Functions */}
                        {form?.reports?.length > 0 && (
                          <div className="mt-4 flex flex-col gap-2">
                            {form.reports.map((report: any, index: number) => (
                              <Button
                                size="sm"
                                variant="ghost"
                                key={index}
                                className="w-fit text-sm pointer-events-none opacity-30"
                              >
                                {report.dn}
                              </Button>
                            ))}
                            {form.workflows.map(
                              (workflow: any, index: number) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={
                                    workflow.script === code
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="text-sm justify-start truncate"
                                  onClick={() => setCode(workflow.script)}
                                >
                                  {str.decodeHtmlSpecialChars(workflow.WFName)}
                                </Button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary-foreground col-span-2 p-8 rounded-2xl h-[calc(100vh-40px)] sticky top-4 overflow-auto">
                    <ScriptViewer script={code} />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
