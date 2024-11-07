'use client';

import React, { useEffect, useState } from 'react';

import { crmGetFunctions } from '@/helpers/zoho/crm';
import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import Image from 'next/image';
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
import { useProjectStore } from '@/stores/project';
import { BUCKETS } from '@/utils/constants';
import { str } from '@/utils/generic';

import { Button } from '../ui/button';
import ButtonLoading from '../ui/button-loading';
import Description from '../ui/description';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  curl: z.string().min(3),
});

export default function DialogSettingsCRM2() {
  const { project, getProject } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      curl: '',
    },
  });

  const mutationCreateProject = useMutation({
    mutationFn: async ({ curl }: { curl: string }) => {
      const config = str.parseCURL(curl);

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

                    <Dialog>
                      <DialogTrigger className="w-fit">
                        <FormDescription>
                          Need help getting the cURL?{' '}
                          <span className="underline underline-offset-2">Click here</span>
                        </FormDescription>
                      </DialogTrigger>
                      <DialogContent className="!w-7/12 !max-w-full !border-none">
                        <DialogTitle>Follow these steps to copy cURL</DialogTitle>
                        <ol className="list-decimal space-y-1 pl-5 text-xs">
                          <li>
                            Open the browser’s <strong>Inspector</strong> and go to the{' '}
                            <strong>Network</strong> tab.
                          </li>
                          <li>
                            Right-click a request that fetches app data (look for one with
                            cookies).
                          </li>
                          <li>
                            Select <strong>Copy</strong> <strong>Copy as cURL</strong> (on
                            Mac) or <strong>Copy as cURL (bash)</strong> (on Windows).
                          </li>
                        </ol>
                        <Image
                          alt="crm_settings_image"
                          src={`${BUCKETS.SETTINGS}/settings_crm.png`}
                          className="w-full"
                          width={1000}
                          height={500}
                        />
                      </DialogContent>
                    </Dialog>

                    <FormMessage />
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
