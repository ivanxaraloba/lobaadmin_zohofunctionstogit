'use client';

import { useState } from 'react';

import { createRepository, getRepository, pushCommit } from '@/helpers/bitbucket';
import { supabase } from '@/lib/supabase/client';
import { Commit, Project } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpFromLine, Meh } from 'lucide-react';
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
import { arr } from '@/utils/generic';

import ButtonLoading from '../ui/button-loading';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import CardCommit from './card-commit';
import SectionMissing from './section-missing';

interface Props {
  project: Project;
  functions: { folder: string; script: string }[];
  functionscommitted: { folder: string; script: string; commit: Commit }[];
  commits: Commit[];
  onSuccess?: () => Function | Promise<void>;
}

export const ButtonPush: React.FC<Props> = ({
  project,
  functions = [],
  functionscommitted = [],
  onSuccess = async () => {},
  commits = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const groupedByName = arr.groupInArr(commits, 'functionName');
  const formSchema = z.object({
    message: z
      .string()
      .optional()
      .refine((value) => !!value || commits.length > 0, {
        message: 'Message is required when there are no commits',
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: undefined,
    },
  });

  const mutationPushToGit = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const name = project._repositoryName;
      let { data: repository } = await getRepository(name);

      if (!repository) {
        const { data: created } = await createRepository(name);
        repository = created;
      }

      if (message) {
        const formData = new FormData();
        functions.forEach(({ folder, script }) => {
          formData.append(folder, script);
        });

        const { error } = await pushCommit(name, formData, message);
        if (error) throw new Error(error?.error?.message);
      }

      console.log('functionscommitted');
      console.log(functionscommitted);

      if (!functionscommitted.length) return;
      for (const { folder, script, commit } of functionscommitted) {
        console.log('==============================');
        console.log({ folder });
        console.log({ script });
        console.log({ commit });
        console.log('==============================');

        const formData = new FormData();
        formData.append(folder, script);
        try {
          const { error: errorPush } = await pushCommit(name, formData, commit.message);

          if (errorPush) {
            toast.error(`Error committing ${commit.functionName}`);
            continue;
          }

          await supabase
            .from('commits')
            .update({ status: 'committed' })
            .eq('id', commit.id);
        } catch (error) {
          console.error(`Error in commit ${commit.functionName}:`, error);
        }
      }
    },
    onSuccess: async () => {
      onSuccess && (await onSuccess());
      toast.success('Functions pushed successfully');
      setIsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error pushing to git');
    },
  });

  const onSubmit = (data: any) => {
    mutationPushToGit.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ButtonLoading
          variant="secondary"
          icon={ArrowUpFromLine}
          onClick={() => setIsOpen(true)}
        >
          <span>Push</span>
        </ButtonLoading>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Push commits</DialogTitle>
          <DialogDescription>
            Add a message to push all functions. Leave blank for system commits only
          </DialogDescription>
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
                        placeholder="Global message ( example: first commit )"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ButtonLoading
                type="submit"
                icon={ArrowUpFromLine}
                loading={mutationPushToGit.isPending}
              >
                Push
              </ButtonLoading>
            </form>
          </Form>
          {groupedByName?.length ? (
            <div className="flex max-h-80 flex-col gap-4 overflow-auto pr-2">
              {groupedByName.map(
                (item: { label: string; items: Commit[] }, index: number) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <div className="flex flex-col divide-y rounded-md border">
                      {item.items.map((commit) => (
                        <CardCommit key={commit.id} commit={commit} />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <SectionMissing
              className="h-fit"
              icon={Meh}
              message="No commits have been made yet"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
