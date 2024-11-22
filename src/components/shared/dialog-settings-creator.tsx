'use client';

import React, { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useMutation } from '@tanstack/react-query';
import { LoaderCircle, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';
import { BUCKETS } from '@/utils/constants';
import { files, obj, str } from '@/utils/generic';

import { Button } from '../ui/button';
import ButtonLoading from '../ui/button-loading';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import DialogSettingsSteps from './dialog-settings-steps';
import VideoPlayerSettings from './video-player-settings';

const formSchema = z.object({
  owner: z.string().min(1),
  curl: z.string().min(3),
});

export default function DialogSettingsCreator() {
  const { project, getProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: '',
      curl: '',
    },
  });

  const mutationUpdateSettings = useMutation({
    mutationFn: async ({
      owner,
      curl,
    }: {
      owner: string;
      curl?: string;
    }) => {
      const config = str.parseCURL(curl);

      console.log(config);

      if (!Object.keys(config)?.length) throw Error('Invalid cURL');

      const { error } = await supabase.from('creator').upsert({
        id: project?.creator?.id,
        projectId: project?.id,
        owner,
        config,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      // @ts-ignore
      getProject(project?.username);
      toast.success('Settings updated successfully!');
      setIsOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Error loading file');
    },
  });

  const onSubmit = (data: any) => {
    mutationUpdateSettings.mutate(data);
  };

  useEffect(() => {
    form.reset({
      ...project?.creator,
    });
  }, [project?.id]);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          form.setValue('curl', '');
          setIsOpen(!isOpen);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-center justify-center gap-4"
            >
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Owner Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="curl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>cURL</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="textarea resize-none"
                        placeholder="Paste your cURL here..."
                      />
                    </FormControl>

                    <DialogSettingsSteps />

                    <FormMessage />
                  </FormItem>
                )}
              />
              <ButtonLoading
                className="mt-4 w-full"
                type="submit"
                loading={mutationUpdateSettings.isPending}
              >
                Save Changes
              </ButtonLoading>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
