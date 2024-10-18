import React, { useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpFromLine, CircleFadingArrowUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';

const formSchema = z.object({
  message: z.string().min(4),
});

export function ButtonCommitsNew({
  functionId,
  functionName,
  functionInfo,
  path,
  refetchCommits,
  className,
}: {
  functionId: string;
  functionName: string;
  functionInfo: any;
  path: string;
  refetchCommits: () => void;
  className?: string;
}) {
  const { user } = useGlobalStore();
  const { project } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const mutationCommit = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
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
    onSuccess: () => {
      refetchCommits();
      toast.success('Commit added!');
      setIsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error committing');
    },
  });

  const onSubmit = (data: { message: string }) => {
    mutationCommit.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <CircleFadingArrowUp className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Commit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full gap-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="New commit message (e.g., feat: add feature)"
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
      </DialogContent>
    </Dialog>
  );
}
