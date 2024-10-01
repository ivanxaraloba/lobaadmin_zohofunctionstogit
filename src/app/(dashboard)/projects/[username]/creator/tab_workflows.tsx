import LogoBitbucket from "@/assets/img/logo-bitbucket";
import { PushToGitButton } from "@/components/shared/button-push-to-git";
import ScriptViewer from "@/components/shared/code-viewer";
import SectionMissing from "@/components/shared/section-missing";
import { TypographyH1 } from "@/components/typography/typography-h1";
import { TypographyH2 } from "@/components/typography/typography-h2";
import { Button } from "@/components/ui/button";
import ButtonLoading from "@/components/ui/button-loading";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Description from "@/components/ui/description";
import SearchInput from "@/components/ui/search-input";
import {
  creatorGetAppStructure,
  creatorGetFunction,
} from "@/helpers/zoho/creator";
import { useSearch } from "@/hooks/useSearch";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/project";
import { creatorApp } from "@/types/types";
import { str, time } from "@/utils/generic";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowUpFromLine,
  ArrowUpRightFromSquare,
  Ban,
  ChevronsUpDown,
  Frown,
  Meh,
  Parentheses,
  RefreshCcw,
  SquareArrowOutUpRight,
  Trash,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyH3 } from "@/components/typography/typography-h3";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CardContainer from "@/components/shared/card-container";

interface Props {
  username: string;
  app: creatorApp | undefined | null;
  setApp: any;
}

export default function TabWorkflows({ username, app, setApp }: Props) {
  const { project, getProject } = useProjectStore();
  const [activeFunction, setActiveFunction] = useState<any>(null);

  const onCommitSuccess = async () => {
    if (!app?.id) return;

    const lastCommit = time.getTimestamptz();
    const { error } = await supabase
      .from("creatorApps")
      .update({
        lastCommit,
      })
      .eq("id", app.id);

    getProject(username);
    setApp((prev: creatorApp) => ({ ...prev, lastCommit }));
    if (error) toast.error("Error updating project committed time");
  };

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
                  report: functionInfo.name,
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

          return workflowsWithCode;
        })
      );

      const flattenedWorkflows = accordianWithCode.flat();

      const { data, error } = await supabase
        .from("creatorApps")
        .update({
          id: project.crm?.id,
          accordian: flattenedWorkflows,
          lastSync: time.getTimestamptz(),
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

  const { data, search, setSearch, setColumn } = useSearch({
    data: app?.accordian,
    searchKeys: ["script", "WFLinkName"],
    groupBy: "report",
  });

  return (
    project?.creator && (
      <>
        {/* Header */}
        <div className="py-10 border-b">
          <TypographyH2 className>Workflows</TypographyH2>
          {/* Information & Buttons */}
          <div className="flex items-center">
            <div className="flex flex-col mt-4 gap-2">
              <Description className="flex items-center gap-2">
                <Parentheses className="size-3" />A total of{" "}
                {app?.accordian?.length || 0} workflows
              </Description>
              <Description className="flex items-center gap-2">
                <RefreshCcw className="size-3" />
                Last sync occurred {time.timeAgo(app?.lastSync) || "-"}
              </Description>
              <Description className="flex items-center gap-2">
                <ArrowUpFromLine className="size-3" />
                Last commit occurred {time.timeAgo(app?.lastCommit) || "-"}
              </Description>
              {app?.lastCommit && (
                <Description className="flex items-center gap-2 mt-4">
                  <Link
                    target="_blank"
                    className="flex items-center gap-2"
                    href={`https://bitbucket.org/lobadev/${project._repository}/src/master/creator/workflows`}
                  >
                    Open Bitbucket Repository
                    <SquareArrowOutUpRight className="size-3" />
                  </Link>
                </Description>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <PushToGitButton
                project={project}
                data={app?.accordian?.map((func: any) => ({
                  folder: `creator/workflows/${func.WFName}.dg`,
                  script: func.script,
                }))}
                onSuccess={onCommitSuccess}
              />
              <ButtonLoading
                icon={RefreshCcw}
                loading={mutationRefreshCreator.isPending}
                onClick={() => mutationRefreshCreator.mutate()}
              >
                <span>Sync</span>
              </ButtonLoading>
            </div>
          </div>
        </div>
        {/* Data */}
        <div className="mt-10">
          {app?.accordian?.length ? (
            <div className="flex flex-col gap-4">
              {/* Search / Columns */}
              <div className="flex w-full gap-4">
                <SearchInput
                  placeholder="Search for function name or code"
                  search={search}
                  setSearch={setSearch}
                />
              </div>
              {/* List / Code */}
              <div className="grid grid-cols-3 gap-x-10 rounded-2xl">
                <div
                  className={cn(
                    "flex flex-col text-sm gap-10",
                    activeFunction ? "col-span-1" : "col-span-3"
                  )}
                >
                  {data.map(({ label, items }: any, index: any) => {
                    return (
                      <Collapsible key={index} defaultOpen={true}>
                        <CardContainer>
                          <div className="flex items-center w-full gap-2">
                            <Parentheses className="size-4" />
                            <span className="text-base">{label}</span>
                            <span className="text-xs mt-[4px] text-muted-foreground">
                              ( {items.length} )
                            </span>

                            <div className="ml-auto">
                              <CollapsibleTrigger className="[data-state=open]:hidden">
                                <ChevronsUpDown className="size-4" />{" "}
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className="mt-4">
                            {items?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {items.map(
                                  (functionInfo: any, index: number) => {
                                    return (
                                      <Button
                                        key={index}
                                        variant={
                                          functionInfo.WFLinkName ===
                                          activeFunction?.WFLinkName
                                            ? "outline"
                                            : "ghost"
                                        }
                                        className="text-xs justify-start truncate border border-transparent"
                                        onClick={() =>
                                          setActiveFunction(functionInfo)
                                        }
                                      >
                                        <span>
                                          {str.decodeHtmlSpecialChars(
                                            functionInfo.WFName
                                          )}
                                        </span>
                                        <div className="ml-auto flex items-center gap-2">
                                          {!functionInfo.script?.length && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <Ban className="size-3 text-red-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  No Code
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                        </div>
                                      </Button>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </CollapsibleContent>
                        </CardContainer>
                      </Collapsible>
                    );
                  })}
                </div>
                {activeFunction && (
                  <div className="bg-primary-foreground p-6 pt-0 col-span-2 rounded-2xl h-[calc(100vh-40px)] sticky top-4 overflow-auto">
                    <div className="sticky top-0 w-full pt-4 flex items-center justify-between border-b pb-2 bg-primary-foreground">
                      <div className="flex flex-col">
                        <TypographyH3>{activeFunction.WFName}</TypographyH3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          target="_blank"
                          href={`https://bitbucket.org/lobadev/${project._repository}/src/master/creator/workflows/${activeFunction?.WFName}.dg`}
                        >
                          <Button variant="ghost" size="sm">
                            <ArrowUpRightFromSquare className="size-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveFunction(null)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <ScriptViewer
                      className="w-full mt-2"
                      script={activeFunction?.script}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SectionMissing
              icon={Frown}
              message="No workflows have been added yet"
            />
          )}
        </div>
      </>
    )
  );
}
