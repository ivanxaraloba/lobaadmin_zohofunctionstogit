'use client';

import React, { useEffect, useState } from 'react';

import { crmGetFunction, crmGetFunctions } from '@/helpers/zoho/crm';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { CRMFunctions } from '@/types/applications';
import { Commit } from '@/types/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowUpFromLine,
  ArrowUpRightFromSquare,
  Ban,
  ChevronsUpDown,
  Frown,
  History,
  Meh,
  Parentheses,
  RefreshCcw,
  SquareArrowOutUpRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import ButtonCommits from '../src/components/shared/button-commits';
import { ButtonPush } from '@/components/shared/button-push';
import { PushToGitButton } from '@/components/shared/button-push-to-git';
import CardContainer from '@/components/shared/card-container';
import ScriptViewer from '@/components/shared/code-viewer';
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
import { Input } from '@/components/ui/input';
import SearchInput from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProjectStore } from '@/stores/project';
import { useSearch } from '@/hooks/useSearch';
import {
  DEPARMENTS,
  FUNCTIONS_CATEGORIES_LIST,
  FUNCTIONS_CATEGORIES_OBJ,
} from '@/utils/constants';
import { arr, str, time } from '@/utils/generic';
import LogoBitbucket from '@/assets/img/logo-bitbucket';

export default function TabFunctions({ username }: { username: string }) {
  const searchParams = useSearchParams();
  const { project, getProject } = useProjectStore();
  const [activeFn, setActiveFn] = useState<any>(null);

  const mutationRefresh = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('Project data is not available.');

      const { data: functions, error: errorGetFunctions } = await crmGetFunctions(
        project.domain,
        project.crm?.config,
      );

      if (errorGetFunctions) throw errorGetFunctions;
      if (!functions?.length) return [];

      const lastSync = project.crm?.lastSync ? time.fixTime(project.crm.lastSync) : null;

      const filteredFunctions = lastSync
        ? functions.filter(
            ({ updatedTime, createdTime }) =>
              updatedTime >= lastSync || createdTime >= lastSync,
          )
        : functions;

      if (!filteredFunctions.length) return [];

      const toastId = toast.loading(`${filteredFunctions.length} functions to update...`);
      const functionsWithCode = (
        await Promise.all(
          filteredFunctions.map(async (functionInfo, index) => {
            const { data, error } = await crmGetFunction(
              project.domain,
              project.crm?.config,
              functionInfo,
            );
            if (error) return null;

            toast.loading(
              `${filteredFunctions.length - (index + 1)} functions remaining`,
              { id: toastId },
            );
            return data;
          }),
        )
      ).filter(Boolean);

      toast.dismiss(toastId);

      const toUpdate = arr
        .concat(functionsWithCode, project.crm?.functions, 'id')
        .filter((x: any) => x.id);

      const { error } = await supabase
        .from('crm')
        .update({
          functions: toUpdate,
          lastSync: time.getTimestamptz(),
        })
        .eq('id', project.crm?.id);

      if (error) throw new Error('Failed to update project functions');

      return functionsWithCode;
    },
    onSuccess: (data) => {
      getProject(username);
      if (activeFn) {
        setActiveFn(data.find((func) => func.id === activeFn.id));
      }
      toast.success('Functions updated successfully.');
    },
    onError: (err) => {
      toast.error(err.message || 'Mutation failed. Please try again.');
    },
  });

  const { data, search, setSearch, setColumn } = useSearch({
    data: project?.crm?.functions,
    searchKeys: ['script', 'display_name'],
    groupBy: 'category',
  });

  const queryParams = useQuery<any>({
    queryKey: ['crm_functions_params', project?.id, searchParams],
    queryFn: async () => {
      // search
      const searchParam = searchParams.get('search') as string;
      if (searchParam) setSearch((prev: any) => ({ ...prev, text: searchParam }));

      // active function
      const functionParam = searchParams.get('function');
      if (functionParam && project?.crm?.functions?.length) {
        const functionInfo = project.crm.functions.find(
          (func) => func.name === functionParam,
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
    queryKey: ['crm_functions_commits', project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commits')
        .select('*, users(*), projects(*)')
        .eq('projectId', project?.id)
        .eq('path', 'crm/functions')
        .order('created_at', { ascending: false });

      return {
        arr: data,
        obj: arr.groupInObj(data, 'functionId'),
        pending: (data || []).filter((c: Commit) => c.status === 'pending'),
      };
    },
  });

  const onCommitSuccess = async () => {
    if (!project) throw new Error('Project data is not available.');

    const { error } = await supabase
      .from('crm')
      .update({
        lastCommit: time.getTimestamptz(),
      })
      .eq('id', project?.crm?.id);

    await queryCommits.refetch();

    await getProject(project?.username);
    if (error) toast.error('Error updating project committed time');
  };

  return (
    !!project?.crm &&
    !!queryParams.isFetched &&
    !!queryCommits.isFetched && (
      <>
        {/* Header */}
        <div className="border-b py-10">
          <TypographyH2 className>Functions</TypographyH2>
          {/* Information & Buttons */}
          <div className="flex items-center">
            <div className="mt-4 flex flex-col gap-2">
              <Description className="flex items-center gap-2">
                <Parentheses className="size-3" />A total of{' '}
                {project?.crm?.functions?.length || 0} functions
              </Description>
              <Description className="flex items-center gap-2">
                <RefreshCcw className="size-3" />
                Last sync occurred {time.timeAgo(project?.crm?.lastSync) || '-'}
              </Description>
              {project?.departments?.id === DEPARMENTS.FTE && (
                <Description className="flex items-center gap-2">
                  <ArrowUpFromLine className="size-3" />
                  Last commit occurred {time.timeAgo(project?.crm?.lastCommit) || '-'}
                </Description>
              )}
              {project?.crm?.lastCommit && (
                <Description className="mt-4 flex items-center gap-2">
                  <Link
                    target="_blank"
                    className="flex items-center gap-2"
                    href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/crm/functions`}
                  >
                    Open Bitbucket Repository
                    <SquareArrowOutUpRight className="size-3" />
                  </Link>
                </Description>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              {project?.departments?.id === DEPARMENTS.FTE && (
                <ButtonPush
                  project={project}
                  commits={queryCommits.data.pending}
                  onSuccess={onCommitSuccess}
                  functionscommitted={queryCommits.data.pending?.map(
                    (commit: Commit) => ({
                      folder: `crm/functions/${commit.function.display_name}.dg`,
                      script: commit.function.workflow,
                      commit: commit,
                    }),
                  )}
                  functions={project?.crm?.functions?.map((func: any) => ({
                    folder: `crm/functions/${func.display_name}.dg`,
                    script: func.workflow,
                  }))}
                />
              )}
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
        {/* Data */}
        <div className="mt-10">
          {project?.crm?.functions?.length ? (
            <div className="flex flex-col gap-4">
              {/* Search / Columns */}
              <div className="flex w-full gap-4">
                <SearchInput
                  placeholder="Search for function name or code"
                  search={search}
                  setSearch={setSearch}
                />
                <Select onValueChange={(e: any) => setColumn('category', e)}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: 'All Categories', value: null },
                      ...FUNCTIONS_CATEGORIES_LIST,
                    ].map((item: any, index: number) => (
                      <SelectItem value={item.value} key={index}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* List / Code */}
              <div className="grid grid-cols-3 gap-x-10 rounded-2xl">
                {/* List */}
                <div
                  className={cn(
                    'flex flex-col gap-10 text-sm',
                    activeFn ? 'col-span-1' : 'col-span-3',
                  )}
                >
                  {data.map(({ label, items }: any, index: any) => {
                    return (
                      <Collapsible key={index} defaultOpen={true}>
                        <CardContainer>
                          <div className="flex w-full items-center gap-2">
                            <Parentheses className="size-4" />
                            <span className="text-base">
                              {
                                FUNCTIONS_CATEGORIES_OBJ[
                                  label as keyof typeof FUNCTIONS_CATEGORIES_OBJ
                                ]
                              }
                            </span>
                            <span className="mt-[4px] text-xs text-muted-foreground">
                              ( {items.length} )
                            </span>

                            <div className="ml-auto">
                              <CollapsibleTrigger className="[data-state=open]:hidden">
                                <ChevronsUpDown className="size-4" />{' '}
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className="mt-4">
                            {items?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {items.map((functionInfo: any, index: number) => {
                                  const lastCommit = time.fixTime(
                                    project?.crm?.lastCommit,
                                  );

                                  const toCommit =
                                    time.fixTime(functionInfo.updatedTime) >=
                                      lastCommit ||
                                    time.fixTime(functionInfo.createdTime) >= lastCommit;

                                  return (
                                    <Button
                                      key={index}
                                      variant={
                                        functionInfo.id === activeFn?.id
                                          ? 'outline'
                                          : 'ghost'
                                      }
                                      className="justify-start truncate border border-transparent text-xs"
                                      onClick={() => setActiveFn(functionInfo)}
                                    >
                                      <span>
                                        {str.decodeHtmlSpecialChars(
                                          functionInfo.display_name,
                                        )}
                                      </span>
                                      <div className="ml-auto flex items-center gap-2">
                                        {!functionInfo.workflow?.length && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Ban className="size-3 text-red-400" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                No code available
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}

                                        {queryCommits.data.obj[functionInfo.id]?.find(
                                          (c: Commit) => c.status === 'pending',
                                        ) ? (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <ArrowUpFromLine className="size-3 text-amber-400" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                Ready to be committed ( commit )
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        ) : (
                                          toCommit && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <ArrowUpFromLine className="size-3 text-green-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  Ready to be committed ( sync )
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )
                                        )}
                                      </div>
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </CollapsibleContent>
                        </CardContainer>
                      </Collapsible>
                    );
                  })}
                </div>
                {/* Code */}
                {activeFn && (
                  <div className="sticky top-4 col-span-2 h-[calc(100vh-40px)] overflow-auto rounded-2xl bg-primary-foreground p-6 pt-0">
                    <div className="sticky top-0 flex w-full items-center justify-between border-b bg-primary-foreground pb-2 pt-4">
                      {/* Header */}
                      <div className="flex flex-col">
                        <TypographyH3>
                          {activeFn.display_name}{' '}
                          {activeFn.commit && (
                            <span className="text-xs font-normal">
                              ( {activeFn.commit.message} )
                            </span>
                          )}
                        </TypographyH3>
                        <Description>
                          Last modified date:{' '}
                          {format(new Date(activeFn.modified_on), 'dd-MM-yyyy HH:mm:ss')}
                        </Description>
                      </div>
                      {/* Buttons */}
                      <div className="flex items-center gap-1">
                        <ButtonCommits
                          queryCommits={queryCommits}
                          functionId={activeFn.id}
                          functionName={activeFn.display_name}
                          functionInfo={activeFn}
                          path="crm/functions"
                        />
                        <Link
                          target="_blank"
                          href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/crm/functions/${activeFn?.display_name}.dg`}
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
                    <ScriptViewer className="mt-2 w-full" script={activeFn?.workflow} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SectionMissing icon={Frown} message="No functions have been added yet" />
          )}
        </div>
      </>
    )
  );
}
