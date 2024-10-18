'use client';

import React, { useState } from 'react';

import { recruitGetFunction, recruitGetFunctions } from '@/helpers/zoho/recruit';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
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
  X,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { PushToGitButton } from '@/components/shared/button-push-to-git';
import CardContainer from '@/components/shared/card-container';
import ScriptViewer from '@/components/shared/code-viewer';
import SectionMissing from '@/components/shared/section-missing';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { TypographyH2 } from '@/components/typography/typography-h2';
import { TypographyH3 } from '@/components/typography/typography-h3';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Description from '@/components/ui/description';
import SearchInput from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProjectStore } from '@/stores/project';
import { useSearch } from '@/hooks/useSearch';
import { DEPARMENTS, FUNCTIONS_CATEGORIES_LIST, FUNCTIONS_CATEGORIES_OBJ } from '@/utils/constants';
import { arr, str, time } from '@/utils/generic';
import LogoBitbucket from '@/assets/img/logo-bitbucket';

export default function TabFunctions({ username }: { username: string }) {
  const { project, getProject } = useProjectStore();
  const [activeFunction, setActiveFunction] = useState<any>(null);

  const mutationRefresh = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('Project data is not available.');

      let { data: functions, error: errorGetFunctions } = await recruitGetFunctions(
        project.domain,
        project.recruit?.config,
      );

      if (errorGetFunctions) throw errorGetFunctions;
      if (!functions?.length) return [];

      // if (project?.recruit?.lastSync) {
      //   functions = functions.filter((functionInfo: any) => {
      //     const lastSync = time.fixTime(project?.recruit?.lastSync);
      //     return (
      //       functionInfo.updatedTime >= lastSync ||
      //       functionInfo.createdTime >= lastSync
      //     );
      //   });
      // }

      const functionsWithCode = await Promise.all(
        functions.map((functionInfo: any) =>
          recruitGetFunction(project.domain, project.recruit?.config, functionInfo.id),
        ),
      );

      const toUpdate = arr.concat(functionsWithCode, project.recruit?.functions, 'id').filter((x: any) => x.id);

      const { error } = await supabase
        .from('recruit')
        .update({
          functions: toUpdate,
          lastSync: time.getTimestamptz(),
        })
        .eq('id', project.recruit?.id);

      if (error) throw new Error('Failed to update project functions');
    },
    onSuccess: () => {
      getProject(username);
      toast.success('Project functions updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Mutation failed. Please try again.');
    },
  });

  const onCommitSuccess = async () => {
    if (!project?.recruit) return;

    const { error } = await supabase
      .from('recruit')
      .update({
        lastCommit: time.getTimestamptz(),
      })
      .eq('id', project.recruit?.id);

    getProject(project.username);
    if (error) toast.error('Error updating project committed time');
  };

  const { data, search, setSearch, setColumn } = useSearch({
    data: project?.recruit?.functions,
    searchKeys: ['script', 'display_name'],
    groupBy: 'category',
  });

  return (
    project?.recruit && (
      <>
        {/* Header */}
        <div className="border-b py-10">
          <TypographyH2>Functions</TypographyH2>
          {/* Information & Buttons */}
          <div className="flex items-center">
            <div className="mt-4 flex flex-col gap-2">
              <Description className="flex items-center gap-2">
                <Parentheses className="size-3" />A total of {project?.recruit?.functions?.length || 0} functions
              </Description>
              <Description className="flex items-center gap-2">
                <RefreshCcw className="size-3" />
                Last sync occurred {time.timeAgo(project?.recruit?.lastSync) || '-'}
              </Description>
              {project?.departments?.id === DEPARMENTS.FTE && (
                <Description className="flex items-center gap-2">
                  <ArrowUpFromLine className="size-3" />
                  Last commit occurred {time.timeAgo(project?.recruit?.lastCommit) || '-'}
                </Description>
              )}
              {project?.recruit?.lastCommit && (
                <Description className="mt-4 flex items-center gap-2">
                  <Link
                    target="_blank"
                    className="flex items-center gap-2"
                    // @ts-ignore
                    href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/recruit/functions`}
                  >
                    Open Bitbucket Repository
                    <SquareArrowOutUpRight className="size-3" />
                  </Link>
                </Description>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              {project?.departments?.id === DEPARMENTS.FTE && (
                <PushToGitButton
                  project={project}
                  data={project?.recruit?.functions?.map((func: any) => ({
                    folder: `recruit/functions/${func.display_name}.dg`,
                    script: func.workflow,
                  }))}
                  onSuccess={onCommitSuccess}
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
          {project?.recruit?.functions?.length ? (
            <div className="flex flex-col gap-4">
              {/* Search / Columns */}
              <div className="flex w-full gap-4">
                <SearchInput placeholder="Search for function name or code" search={search} setSearch={setSearch} />
                <Select onValueChange={(e: any) => setColumn('category', e)}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ label: 'All Categories', value: null }, ...FUNCTIONS_CATEGORIES_LIST].map(
                      (item: any, index: number) => (
                        <SelectItem value={item.value} key={index}>
                          {item.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* List / Code */}
              <div className="grid grid-cols-3 gap-x-10 rounded-2xl">
                <div className={cn('flex flex-col gap-10 text-sm', activeFunction ? 'col-span-1' : 'col-span-3')}>
                  {data.map(({ label, items }: any, index: any) => {
                    return (
                      <Collapsible key={index} defaultOpen={true}>
                        <CardContainer>
                          <div className="flex w-full items-center gap-2">
                            <Parentheses className="size-4" />
                            <span className="text-base">
                              {FUNCTIONS_CATEGORIES_OBJ[label as keyof typeof FUNCTIONS_CATEGORIES_OBJ]}
                            </span>
                            <span className="mt-[4px] text-xs text-muted-foreground">( {items.length} )</span>

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
                                  return (
                                    <Button
                                      key={index}
                                      variant={functionInfo.id === activeFunction?.id ? 'outline' : 'ghost'}
                                      className="justify-start truncate border border-transparent text-xs"
                                      onClick={() => setActiveFunction(functionInfo)}
                                    >
                                      <span>{str.decodeHtmlSpecialChars(functionInfo.display_name)}</span>
                                      <div className="ml-auto flex items-center gap-2">
                                        {!functionInfo.workflow?.length && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Ban className="size-3 text-red-400" />
                                              </TooltipTrigger>
                                              <TooltipContent>No code available</TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        {/* {toCommit && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <ArrowUpFromLine className="size-3 text-green-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              Ready to be committed
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )} */}
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
                {activeFunction && (
                  <div className="sticky top-4 col-span-2 h-[calc(100vh-40px)] overflow-auto rounded-2xl bg-primary-foreground p-6 pt-0">
                    <div className="sticky top-0 flex w-full items-center justify-between border-b bg-primary-foreground pb-2 pt-4">
                      <div className="flex flex-col">
                        <TypographyH3>{activeFunction.display_name}</TypographyH3>
                        <Description>
                          Last modified date: {format(new Date(activeFunction.modified_on), 'dd-MM-yyyy HH:mm:ss')}
                        </Description>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          target="_blank"
                          href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/recruit/functions/${activeFunction?.display_name}.dg`}
                        >
                          <Button variant="ghost" size="sm">
                            <ArrowUpRightFromSquare className="size-4" />
                          </Button>
                        </Link>

                        <Button variant="ghost" size="icon" onClick={() => setActiveFunction(null)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <ScriptViewer className="mt-2 w-full" script={activeFunction?.workflow} />
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
