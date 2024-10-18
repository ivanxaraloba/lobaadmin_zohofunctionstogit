import React from 'react';

import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Commit } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowUpFromLine, Ban, Eye, Frown, History, Meh } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';
import { time } from '@/utils/generic';

import { TypographyH3 } from '../typography/typography-h3';
import { Button } from '../ui/button';
import ButtonLoading from '../ui/button-loading';
import Description from '../ui/description';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import CardCommit from './card-commit';
import SectionMissing from './section-missing';

const formSchema = z.object({
  message: z.string().min(4),
});

export default function ButtonCommits({
  queryCommits,
  functionId,
  functionName,
  functionInfo,
  path,
}: {
  queryCommits: any | { data: { arr: any; obj: any }; refetch: any };
  functionId: string;
  functionName: string;
  functionInfo: any;
  path: string;
}) {
  const { user } = useGlobalStore();
  const { project } = useProjectStore();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: undefined,
    },
  });

  const mutationCommit = useMutation({
    mutationFn: async ({ message }: any) => {
      const { data, error } = await supabase.from('commits').insert({
        userId: user?.profile?.id,
        projectId: project?.id,
        function: functionInfo,
        message,
        functionId,
        functionName,
        path,
      });

      if (error) throw error;

      return data;
    },
    onSuccess: async () => {
      queryCommits.refetch();
      toast.success('Commit pending!');
    },
    onError: (err) => {
      toast.error(err.message || 'Error commiting');
    },
  });

  const onSubmit = (data: any) => {
    mutationCommit.mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <ArrowUpFromLine className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Commits</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full gap-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="New commit description ( feat: create record ) "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ButtonLoading type="submit" loading={mutationCommit.isPending}>
                Commit
              </ButtonLoading>
            </form>
          </Form>
          <div className="flex max-h-80 flex-col gap-4 overflow-auto pr-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{functionName}</span>
              {queryCommits.data?.obj[functionId] ? (
                <div className="flex flex-col divide-y rounded-md border">
                  {queryCommits.data?.obj[functionId].map((commit: Commit) => (
                    <CardCommit key={commit.id} commit={commit} />
                  ))}
                </div>
              ) : (
                <SectionMissing
                  className="h-fit"
                  icon={Meh}
                  message="No commits have been made yet"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
