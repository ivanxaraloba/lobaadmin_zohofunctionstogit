'use client';

import React, { useState } from 'react';

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
  ChevronsUpDown,
  Frown,
  Parentheses,
  RefreshCcw,
  SquareArrowOutUpRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import ButtonCommits from '../src/components/shared/button-commits';
import {
  AppTabContent,
  AppTabContentBody,
  AppTabContentHead,
  AppTabContentMissing,
  AppTabDescription,
  AppTabHeader,
} from '@/components/layout/app-tab';
import { ButtonPush } from '@/components/shared/button-push';
import CardContainer from '@/components/shared/card-container';
import ScriptViewer from '@/components/shared/code-viewer';
import ListItemFunction from '@/components/shared/list-item-function';
import SectionMissing from '@/components/shared/section-missing';
import { TypographyH3 } from '@/components/typography/typography-h3';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Description from '@/components/ui/description';
import SearchInput from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectStore } from '@/stores/project';
import { useSearch } from '@/hooks/useSearch';
import {
  DEPARMENTS,
  FUNCTIONS_CATEGORIES_LIST,
  FUNCTIONS_CATEGORIES_OBJ,
} from '@/utils/constants';
import { arr, time } from '@/utils/generic';

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
        <AppTabHeader
          label="Functions"
          description={
            <>
              <AppTabDescription icon={Parentheses}>
                A total of {project?.crm?.functions?.length || 0} functions
              </AppTabDescription>
              <AppTabDescription icon={RefreshCcw}>
                Last sync occurred {time.timeAgo(project?.crm?.lastSync) || '-'}
              </AppTabDescription>
              {project?.departments?.id === DEPARMENTS.FTE && (
                <AppTabDescription icon={ArrowUpFromLine}>
                  Last commit occurred {time.timeAgo(project?.crm?.lastCommit) || '-'}
                </AppTabDescription>
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
            </>
          }
        />
        {/* data */}
        {project?.crm?.functions?.length ? (
          <AppTabContent>
            {/* Search / Columns */}
            <AppTabContentHead>
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
            </AppTabContentHead>
            {/* List / Code */}
            <AppTabContentBody>
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
                              {items.map((functionInfo: CRMFunctions, i: number) => {
                                const lastCommit = time.fixTime(project?.crm?.lastCommit);

                                const toCommit =
                                  time.fixTime(functionInfo.updatedTime) >= lastCommit ||
                                  time.fixTime(functionInfo.createdTime) >= lastCommit;

                                return (
                                  <ListItemFunction
                                    key={i}
                                    activeFn={activeFn}
                                    setActiveFn={setActiveFn}
                                    functionInfo={functionInfo}
                                    functionName={functionInfo.display_name}
                                    functionId={functionInfo.id}
                                    commitsObj={queryCommits.data.obj}
                                    toCommit={toCommit}
                                  />
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
                <CardContainer className="sticky top-4 col-span-2 h-[calc(100vh-40px)] overflow-auto pt-0">
                  <div className="sticky top-0 flex w-full items-center justify-between border-b bg-primary-foreground pb-2 pt-4">
                    {/* Header */}
                    <div className="flex flex-col">
                      <TypographyH3>{activeFn.display_name}</TypographyH3>
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
                </CardContainer>
              )}
            </AppTabContentBody>
          </AppTabContent>
        ) : (
          <AppTabContentMissing>
            <SectionMissing icon={Frown} message="No functions have been added yet" />
          </AppTabContentMissing>
        )}
      </>
    )
  );
}
