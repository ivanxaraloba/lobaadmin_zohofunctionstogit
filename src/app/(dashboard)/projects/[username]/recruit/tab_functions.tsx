'use client';

import React, { useState } from 'react';

import { recruitGetFunction, recruitGetFunctions } from '@/helpers/zoho/recruit';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { CRMFunctions } from '@/types/applications';
import { Commit } from '@/types/types';
import { Label } from '@radix-ui/react-label';
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
import { MultiSelect } from '@/components/ui/multi-select';
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
import { useFilters } from '@/hooks/use-filters';
import { useSearch } from '@/hooks/use-search';
import {
  DEPARMENTS,
  FUNCTIONS_CATEGORIES_LIST,
  FUNCTIONS_CATEGORIES_OBJ,
} from '@/utils/constants';
import { matchByWords } from '@/utils/filters';
import { arr, str, time } from '@/utils/generic';
import LogoBitbucket from '@/assets/img/logo-bitbucket';

export default function TabFunctions({ username }: { username: string }) {
  const PATH_TAB = 'recruit/functions';

  const searchParams = useSearchParams();
  const { project, getProject } = useProjectStore();
  const [activeFn, setActiveFn] = useState<any>(null);

  const mutationRefresh = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('Project data is not available.');

      let { data: functions, error: errorGetFunctions } = await recruitGetFunctions(
        project.domain,
        project.recruit?.config,
      );

      if (errorGetFunctions) throw errorGetFunctions;
      if (!functions?.length) return [];

      const lastSync = project.recruit?.lastSync
        ? time.fixTime(project.recruit.lastSync)
        : null;

      const filteredFunctions = lastSync
        ? functions.filter(
            ({ updatedTime, createdTime }: any) =>
              updatedTime >= lastSync || createdTime >= lastSync,
          )
        : functions;

      if (!filteredFunctions.length) return [];

      const toastId = toast.loading(`${filteredFunctions.length} functions to update...`);
      const functionsWithCode = (
        await Promise.all(
          filteredFunctions.map(async (functionInfo: any, index: number) => {
            const { data, error } = await recruitGetFunction(
              project.domain,
              project.recruit?.config,
              functionInfo.id,
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
        .concat(functionsWithCode, project.recruit?.functions, 'id')
        .filter((x: any) => x.id);

      console.log({ toUpdate });

      const { error } = await supabase
        .from('recruit')
        .update({
          functions: toUpdate,
          lastSync: time.getTimestamptz(),
        })
        .eq('id', project.recruit?.id);

      if (error) throw new Error('Failed to update project functions');

      return functionsWithCode;
    },
    onSuccess: (data) => {
      getProject(username);
      toast.success('Recruit functions updated successfully.');
    },
    onError: (err) => {
      toast.error(err.message || 'Mutation failed. Please try again.');
    },
  });

  const queryParams = useQuery<any>({
    queryKey: ['recruit_functions_params', project?.id, searchParams],
    queryFn: async () => {
      // search
      const searchParam = searchParams.get('search') as string;
      if (searchParam) setSearch(searchParam);

      // active function
      const functionParam = searchParams.get('function');
      if (functionParam && project?.recruit?.functions?.length) {
        const functionInfo = project.recruit.functions.find(
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
    queryKey: ['recruit_functions_commits', project?.id],
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
        pending: (data || []).filter((c: Commit) => c.status === 'pending'),
      };
    },
  });

  const onCommitSuccess = async () => {
    if (!project) throw new Error('Project data is not available.');

    const { error } = await supabase
      .from('recruit')
      .update({
        lastCommit: time.getTimestamptz(),
      })
      .eq('id', project?.recruit?.id);

    await queryCommits.refetch();

    await getProject(project?.username);
    if (error) toast.error('Error updating project committed time');
  };

  const lastCommit = time.fixTime(project?.recruit?.lastCommit);
  const isToCommit = (functionInfo: any) => {
    return (
      time.fixTime(functionInfo.updatedTime) >= lastCommit ||
      time.fixTime(functionInfo.createdTime) >= lastCommit
    );
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
    data: project?.recruit?.functions,
    filterConfig: [
      {
        key: 'categories',
        type: 'array',
        matchFn: (data: any, value: number[]) => {
          return value.includes(data.category);
        },
      },
      {
        key: 'tags',
        type: 'array',
        matchFn: (data: any, value: string[]) => {
          if (value.includes('empty_function')) return !data.workflow?.length;
          const commits = queryCommits.data.obj[data.id] || [];
          if (value.includes('committed')) return commits?.length;
          if (value.includes('pending_commits'))
            return !!commits.filter((c: Commit) => c.status === 'pending')?.length;
        },
      },
    ],
    searchMatchFn: (data: any, searchValue: string) => {
      return matchByWords(data, searchValue, ['display_name', 'script'], searchMatches);
    },
  });
  const functions = arr.groupInArr(data, 'category');

  return (
    !!project?.recruit &&
    !!queryParams.isFetched &&
    !!queryCommits.isFetched && (
      <>
        {/* Header */}
        <AppTabHeader
          label="Functions"
          description={
            <>
              <AppTabDescription icon={Parentheses}>
                A total of {project?.recruit?.functions?.length || 0} functions
              </AppTabDescription>
              <AppTabDescription icon={RefreshCcw}>
                Last sync occurred {time.timeAgo(project?.recruit?.lastSync) || '-'}
              </AppTabDescription>
              {!!project?._repository && project?.departments?.id === DEPARMENTS.FTE && (
                <AppTabDescription icon={ArrowUpFromLine}>
                  Last commit occurred {time.timeAgo(project?.recruit?.lastCommit) || '-'}
                </AppTabDescription>
              )}
              {!!project?._repository && !!project?.recruit?.lastCommit && (
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
                      folder: `${PATH_TAB}/${commit.function.name}.dg`,
                      script: commit.function.workflow,
                      commit: commit,
                    }),
                  )}
                  functions={project?.recruit?.functions?.map((func: any) => ({
                    folder: `${PATH_TAB}/${func.name}.dg`,
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
        {/* Data */}
        {project?.recruit?.functions?.length ? (
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
                  <Label>Categories</Label>
                  <MultiSelect
                    defaultValue={filters.categories}
                    options={FUNCTIONS_CATEGORIES_LIST}
                    onValueChange={(e: any) => setFilters({ categories: e })}
                    placeholder="Select departments"
                    maxCount={3}
                  />
                </div>
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
                    onValueChange={(e: any) => setFilters({ tags: e })}
                    placeholder="Select tags"
                    maxCount={3}
                  />
                </div>
              </PopoverFilters>
            </AppTabContentHead>
            {/* List / Code */}
            {data.length ? (
              <AppTabContentBody>
                {/* List */}
                <div
                  className={cn(
                    'flex flex-col gap-10 text-sm',
                    activeFn ? 'col-span-1' : 'col-span-3',
                  )}
                >
                  {functions.map(({ label, items }: any, index: any) => {
                    return (
                      <Collapsible key={index} defaultOpen={true}>
                        <CardContainer>
                          <ListHeaderFunction
                            label={
                              FUNCTIONS_CATEGORIES_OBJ[
                                label as keyof typeof FUNCTIONS_CATEGORIES_OBJ
                              ]
                            }
                            length={items.length}
                          />
                          <CollapsibleContent className="mt-4">
                            {items?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {items.map((functionInfo: CRMFunctions, i: number) => {
                                  return (
                                    <ListItemFunction
                                      key={i}
                                      activeFn={activeFn}
                                      setActiveFn={setActiveFn}
                                      functionInfo={functionInfo}
                                      functionName={functionInfo.display_name}
                                      functionCode={functionInfo.workflow}
                                      functionId={functionInfo.id}
                                      commitsObj={queryCommits.data.obj}
                                      toCommit={isToCommit(functionInfo)}
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
                        <ButtonCommitsNew
                          functionId={activeFn.id}
                          functionName={activeFn.display_name}
                          functionInfo={activeFn}
                          path={PATH_TAB}
                          refetchCommits={queryCommits.refetch}
                          className={cn(isToCommit(activeFn) && '!text-yellow-400')}
                        />
                        <ButtonCommitsHistory
                          commits={queryCommits.data?.obj[activeFn.id]}
                        />
                        <Link
                          target="_blank"
                          href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/${PATH_TAB}/${activeFn?.name}.dg`}
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
                    <ScriptViewer className="mt-2 w-full" value={activeFn?.workflow} />
                  </CardContainer>
                )}
              </AppTabContentBody>
            ) : (
              // Empty data with filters
              <SectionMissing icon={SearchX} message="No matching functions found" />
            )}
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
