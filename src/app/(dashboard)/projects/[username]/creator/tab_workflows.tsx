import React, { useState } from 'react';

import {
  creatorGetAppStructure,
  creatorGetFunction,
} from '@/helpers/zoho/creator';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Commit, creatorApp } from '@/types/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowUpFromLine,
  ArrowUpRightFromSquare,
  Ban,
  ChevronsUpDown,
  CircleFadingArrowUp,
  Frown,
  Meh,
  Parentheses,
  RefreshCcw,
  SearchX,
  SquareArrowOutUpRight,
  Trash,
  TriangleAlert,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import {
  AppTabContent,
  AppTabContentBody,
  AppTabContentHead,
  AppTabContentMissing,
  AppTabDescription,
  AppTabHeader,
} from '@/components/layout/app-tab';
import ButtonCommitsHistory from '@/components/shared/button-commits-history';
import { ButtonCommitsNew } from '@/components/shared/button-commits-new';
import { ButtonPush } from '@/components/shared/button-push';
import { PushToGitButton } from '@/components/shared/button-push-to-git';
import CardContainer from '@/components/shared/card-container';
import ListHeaderFunction from '@/components/shared/list-header-functions';
import ListItemFunction from '@/components/shared/list-item-function';
import PopoverFilters from '@/components/shared/popover-filters';
import ScriptViewer from '@/components/shared/script-viewer';
import SectionMissing from '@/components/shared/section-missing';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { TypographyH2 } from '@/components/typography/typography-h2';
import { TypographyH3 } from '@/components/typography/typography-h3';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Description from '@/components/ui/description';
import InputSearch from '@/components/ui/input-search';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProjectStore } from '@/stores/project';
import { useFilters } from '@/hooks/use-filters';
import { DEPARMENTS } from '@/utils/constants';
import { matchByWords } from '@/utils/filters';
import { arr, str, time } from '@/utils/generic';
import LogoBitbucket from '@/assets/img/logo-bitbucket';

interface Props {
  username: string;
  app: creatorApp | undefined | null;
  setApp: any;
}

export default function TabWorkflows({
  username,
  app,
  setApp,
}: Props) {
  const PATH_TAB = `creator/${app?.name}/workflows`;

  const searchParams = useSearchParams();
  const { project, getProject } = useProjectStore();
  const [activeFn, setActiveFn] = useState<any>(null);

  const queryParams = useQuery<any>({
    queryKey: ['creator_workflows_params', project?.id, searchParams],
    queryFn: async () => {
      // search
      const searchParam = searchParams.get('search') as string;
      if (searchParam) setSearch(searchParam);

      // active function
      const functionParam = searchParams.get('function');
      if (functionParam && app?.accordian?.length) {
        const functionInfo = app?.accordian.find(
          (func) => func.WFLinkName === functionParam,
        );
        if (functionInfo) setActiveFn(functionInfo);
      }

      // commit
      const commitParam = searchParams.get('commit');
      const { data: commit } = await supabase
        .from('commits')
        .select()
        .eq('projectId', project?.id)
        .eq('id', commitParam)
        .single();

      if (commit) setActiveFn({ ...commit.function, commit });
    },
  });

  const queryCommits = useQuery<any>({
    queryKey: ['creator_workflows_commits', project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commits')
        .select('*, users(*), projects(*)')
        .eq('projectId', project?.id)
        .eq('path', PATH_TAB)
        .order('created_at', { ascending: false });

      return {
        arr: data,
        obj: arr.groupInObj(data, 'functionId'),
        pending: (data || []).filter(
          (c: Commit) => c.status === 'pending',
        ),
      };
    },
  });

  const mutationRefreshCreator = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('Project data is not available.');

      console.log(project.creator?.config);

      const { data: accordian, error: errorAccordian } =
        await creatorGetAppStructure(
          project.domain,
          project.creator?.config,
          project.creator?.owner,
          app?.name,
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
                  workflow.WFLinkName,
                );

                return {
                  ...workflow,
                  script,
                  report: functionInfo.name,
                };
              } catch (error) {
                console.error(
                  'Error fetching workflow script for',
                  workflow.WFLinkName,
                  error,
                );
                return { ...workflow, script: null };
              }
            }),
          );

          return workflowsWithCode;
        }),
      );

      const flattenedWorkflows = accordianWithCode.flat();

      const { data, error } = await supabase
        .from('creatorApps')
        .update({
          accordian: flattenedWorkflows,
          lastSync: time.getTimestamptz(),
        })
        .eq('creatorId', project.creator?.id)
        .eq('name', app?.name)
        .select()
        .single();

      if (error) throw new Error('Failed to update app accordian');

      return data;
    },
    onSuccess: (data: creatorApp) => {
      setApp(data);
      toast.success('App functions updated successfully.');
    },
    onError: (err) => {
      toast.error(typeof err === 'string' ? err : err?.message);
    },
  });

  const onCommitSuccess = async () => {
    if (!app?.id) return;

    const lastCommit = time.getTimestamptz();
    const { error } = await supabase
      .from('creatorApps')
      .update({
        lastCommit,
      })
      .eq('id', app.id);

    await queryCommits.refetch();

    await getProject(username);
    setApp((prev: creatorApp) => ({ ...prev, lastCommit }));
    if (error) toast.error('Error updating project committed time');
  };

  const {
    data,
    search,
    setSearch,
    filters,
    setFilters,
    filtersCount,
    searchMatches,
    setSearchMatches,
  } = useFilters({
    data: app?.accordian,
    filterConfig: [
      {
        key: 'tags',
        type: 'array',
        matchFn: (data: any, value: string[]) => {
          if (value.includes('empty_function'))
            return !data.script?.length;
          const commits =
            queryCommits.data.obj[data.WFLinkName] || [];
          if (value.includes('committed')) return commits?.length;
          if (value.includes('pending_commits'))
            return !!commits.filter(
              (c: Commit) => c.status === 'pending',
            )?.length;
        },
      },
    ],
    searchMatchFn: (data: any, searchValue: string) => {
      return matchByWords(
        data,
        searchValue,
        ['WFName', 'script'],
        searchMatches,
      );
    },
  });
  const functions = arr.groupInArr(data, 'report');

  return (
    !!project?.creator &&
    !!queryParams.isFetched &&
    !!queryCommits.isFetched && (
      <>
        {/* Header */}
        <AppTabHeader
          label="Workflows"
          description={
            <>
              <AppTabDescription icon={Parentheses}>
                A total of {app?.accordian?.length || 0} workflows
              </AppTabDescription>
              <AppTabDescription icon={RefreshCcw}>
                Last sync occurred{' '}
                {time.timeAgo(project?.crm?.lastSync) || '-'}
              </AppTabDescription>
              {!!project?._repository &&
                project?.departments?.id === DEPARMENTS.FTE && (
                  <AppTabDescription icon={ArrowUpFromLine}>
                    Last commit occurred{' '}
                    {time.timeAgo(project?.crm?.lastCommit) || '-'}
                  </AppTabDescription>
                )}
              {!!project?._repository && !!app?.lastCommit && (
                <Description className="mt-4 flex items-center gap-2">
                  <Link
                    target="_blank"
                    className="flex items-center gap-2"
                    href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/${PATH_TAB}`}
                  >
                    Open Bitbucket Repository
                    <SquareArrowOutUpRight className="size-3" />
                  </Link>
                </Description>
              )}
            </>
          }
          right={
            <>
              {project?.departments?.id === DEPARMENTS.FTE && (
                <ButtonPush
                  project={project}
                  commits={queryCommits.data.pending}
                  onSuccess={onCommitSuccess}
                  functionscommitted={queryCommits.data.pending?.map(
                    (commit: Commit) => ({
                      folder: `${PATH_TAB}/${commit.function.WFName}.dg`,
                      script: commit.function.script,
                      commit: commit,
                    }),
                  )}
                  functions={
                    app?.accordian?.map((func: any) => ({
                      folder: `${PATH_TAB}/${func.WFName}.dg`,
                      script: func.script,
                    })) || []
                  }
                />
              )}
              <ButtonLoading
                icon={RefreshCcw}
                loading={mutationRefreshCreator.isPending}
                onClick={() => mutationRefreshCreator.mutate()}
              >
                <span>Sync</span>
              </ButtonLoading>
            </>
          }
        />
        {/* Data */}
        {app?.accordian?.length ? (
          <AppTabContent>
            {/* Search / Columns */}
            <AppTabContentHead>
              <InputSearch
                placeholder="Search for functions name or a code snippet"
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
                  <Label>Tags</Label>
                  <MultiSelect
                    defaultValue={filters.tags}
                    options={[
                      {
                        label: 'Empty function',
                        value: 'empty_function',
                        icon: TriangleAlert,
                      },
                      {
                        label: 'Committed',
                        value: 'committed',
                        icon: ArrowUpFromLine,
                      },
                      {
                        label: 'Ready to push',
                        value: 'pending_commits',
                        icon: ArrowUpFromLine,
                      },
                    ]}
                    onValueChange={(e: any) =>
                      setFilters({ tags: e })
                    }
                    placeholder="Select tags"
                    maxCount={3}
                  />
                </div>
              </PopoverFilters>
            </AppTabContentHead>
            {data.length ? (
              <AppTabContentBody>
                {/* List */}
                <div
                  className={cn(
                    'flex flex-col gap-10 text-sm',
                    activeFn ? 'col-span-1' : 'col-span-3',
                  )}
                >
                  {functions.map(
                    ({ label, items }: any, index: any) => {
                      return (
                        <Collapsible key={index} defaultOpen={true}>
                          <CardContainer>
                            <ListHeaderFunction
                              label={label}
                              length={items.length}
                            />
                            <CollapsibleContent className="mt-4">
                              {items?.length > 0 && (
                                <div className="flex flex-col gap-2">
                                  {items.map(
                                    (
                                      functionInfo: any,
                                      i: number,
                                    ) => {
                                      return (
                                        <ListItemFunction
                                          key={i}
                                          activeFn={activeFn}
                                          setActiveFn={setActiveFn}
                                          functionInfo={functionInfo}
                                          functionName={
                                            functionInfo.WFName
                                          }
                                          functionCode={
                                            functionInfo.script
                                          }
                                          functionId={
                                            functionInfo.WFLinkName
                                          }
                                          commitsObj={
                                            queryCommits.data.obj
                                          }
                                        />
                                      );
                                    },
                                  )}
                                </div>
                              )}
                            </CollapsibleContent>
                          </CardContainer>
                        </Collapsible>
                      );
                    },
                  )}
                </div>
                {/* Code */}
                {activeFn && (
                  <CardContainer className="sticky top-4 col-span-2 h-[calc(100vh-40px)] overflow-auto pt-0">
                    <div className="sticky top-0 flex w-full items-center justify-between border-b bg-primary-foreground pb-2 pt-4 z-10">
                      {/* Header */}
                      <div className="flex flex-col">
                        <TypographyH3>{activeFn.WFName}</TypographyH3>
                      </div>
                      {/* Buttons */}
                      <div className="flex items-center gap-1">
                        <ButtonCommitsNew
                          functionId={activeFn.WFLinkName}
                          functionName={activeFn.WFName}
                          functionInfo={activeFn}
                          refetchCommits={queryCommits.refetch}
                          path={PATH_TAB}
                        />
                        <ButtonCommitsHistory
                          commits={
                            queryCommits.data?.obj[
                              activeFn.WFLinkName
                            ]
                          }
                        />
                        <Link
                          target="_blank"
                          href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/${PATH_TAB}/${activeFn?.WFName}.dg`}
                        >
                          <Button variant="ghost" size="sm">
                            <ArrowUpRightFromSquare className="size-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveFn(null)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Code */}
                    <ScriptViewer
                      className="mt-2 w-full"
                      value={activeFn?.script}
                    />
                  </CardContainer>
                )}
              </AppTabContentBody>
            ) : (
              // Empty data with filters
              <SectionMissing
                icon={SearchX}
                message="No matching workflows found"
              />
            )}
          </AppTabContent>
        ) : (
          <AppTabContentMissing>
            <SectionMissing
              icon={Frown}
              message="No workflows have been added yet"
            />
          </AppTabContentMissing>
        )}
      </>
    )
  );
}
