'use client';

import React, { useEffect, useState } from 'react';

import { crmGetFunctions } from '@/helpers/zoho/crm';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
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
import { files, obj, type, str } from '@/utils/generic';

import { Button } from '../ui/button';
import ButtonLoading from '../ui/button-loading';
import Description from '../ui/description';
import { Textarea } from '../ui/textarea';
import VideoPlayerSettings from './video-player-settings';

const formSchema = z.object({
  har: z.string().min(3),
});

export default function DialogSettingsCRM2() {
  const { project, getProject } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      har: '',
    },
  });

  const mutationCreateProject = useMutation({
    mutationFn: async ({ har }: { har: string }) => {
      har = str.parseCURL(har);

      const config = {
        cookie: har.cookie,
        'x-crm-org': har['x-crm-org'],
        'x-zcsrf-token': har['x-zcsrf-token'],
        'user-agent': har['user-agent'],
      };

      // test api
      const { error: errorTesting, data } = await crmGetFunctions(
        project?.domain,
        config,
      );
      if (errorTesting) throw errorTesting;

      const { error } = await supabase
        .from('crm')
        .upsert({ id: project?.crm?.id, projectId: project?.id, config });
      if (error) throw error;
    },
    onSuccess: async () => {
      // @ts-ignore
      getProject(project?.username);
      toast.success('Settings updated successfully!');
      setIsOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong');
    },
  });

  const onSubmit = (data: any) => {
    mutationCreateProject.mutate(data);
  };

  useEffect(() => {
    // @ts-ignore
    form.reset({ ...project });
  }, [project?.id]);



  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <VideoPlayerSettings src={`${BUCKETS.SETTINGS}/settings_crm.mp4`} />
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-center justify-center gap-4"
            >
              <FormField
                control={form.control}
                name="har"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>cURL</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="textarea"
                        rows={10}
                        placeholder="Paste your cURL here..."
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Paste here cURL text</FormDescription>
                  </FormItem>
                )}
              />
              <ButtonLoading
                className="w-full"
                type="submit"
                loading={mutationCreateProject.isPending}
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
