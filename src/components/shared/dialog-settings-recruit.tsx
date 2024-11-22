'use client';

import React, { useEffect, useState } from 'react';

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
import DialogSettingsSteps from './dialog-settings-steps';

const formSchema = z.object({
  curl: z.string().min(3),
});

export default function DialogSettingsRecruit() {
  const { project, getProject } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      curl: '',
    },
  });

  const mutationUpdateConfig = useMutation({
    mutationFn: async ({ curl }: { curl: string }) => {
      const config = str.parseCURL(curl);

      if (!Object.keys(config)?.length) throw Error('Invalid cURL');

      const { error } = await supabase.from('recruit').upsert({
        id: project?.recruit?.id,
        projectId: project?.id,
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
      toast.error(err.message || 'Something went wrong');
    },
  });

  const onSubmit = (data: any) => {
    mutationUpdateConfig.mutate(data);
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

                    <DialogSettingsSteps />

                    <FormMessage />
                  </FormItem>
                )}
              />
              <ButtonLoading
                className="w-full"
                type="submit"
                loading={mutationUpdateConfig.isPending}
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
