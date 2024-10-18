'use client';

import React, { useEffect } from 'react';

import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useGlobalStore } from '@/stores/global';
import { str } from '@/utils/generic';

import { Button } from '../ui/button';
import ButtonLoading from '../ui/button-loading';
import { Combobox } from '../ui/combobox';
import { Input } from '../ui/input';

const formSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  domain: z.string().min(1),
  departmentId: z.number(),
});

export default function DialogCreateProject({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: any;
}) {
  const router = useRouter();
  const { getProjects, departments } = useGlobalStore();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      domain: '',
      departmentId: undefined,
    },
  });

  const mutationCreateProject = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('projects').insert(data);
      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      getProjects();
      toast.success('Project created successfully!');
      onOpenChange(false);
      router.push(`/projects/${data.username}`);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || 'Error creating project');
    },
  });

  const onSubmit = (data: any) => {
    mutationCreateProject.mutate(data);
  };

  useEffect(() => {
    const name = form.watch('name');
    if (!name) return;
    form.setValue('username', str.slugify(name), { shouldValidate: true });
  }, [form.watch('name')]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center justify-center gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Combobox
                      variant="outline"
                      items={['eu', 'com'].map((i) => ({
                        label: i,
                        value: i,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Combobox
                      variant="outline"
                      items={departments.map((i) => ({
                        label: i.name,
                        value: i.id,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ButtonLoading className="w-full" type="submit" loading={mutationCreateProject.isPending}>
              Create
            </ButtonLoading>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
