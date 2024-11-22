'use client';

import React from 'react';

import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import CardContainer from '@/components/shared/card-container';
import ScriptViewer from '@/components/shared/script-viewer';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { TypographyH3 } from '@/components/typography/typography-h3';
import ButtonLoading from '@/components/ui/button-loading';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Textarea } from '@/components/ui/textarea';
import { useGlobalStore } from '@/stores/global';
import { APPLICATIONS } from '@/utils/constants';

const formSchema = z.object({
  name: z.string().min(3),
  applications: z.array(z.string()).min(1),
  code: z.string().min(3),
});

export default function Page() {
  const router = useRouter();
  const { getFunctions } = useGlobalStore();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      applications: [],
      code: 'return "sample";',
    },
  });

  const mutationCreateFunction = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('functions').insert(data);
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await getFunctions();
      toast.success('Project created successfully!');
      router.push('/functions');
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || 'Error creating project');
    },
  });

  const onSubmit = (data: any) => {
    mutationCreateFunction.mutate(data);
  };

  return (
    <div>
      <div className="flex items-center gap-4 pb-10 text-xs">
        <TypographyH1>Create Function</TypographyH1>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-10"
        >
          <CardContainer className="flex flex-col rounded-lg">
            <TypographyH3>Basic Information</TypographyH3>
            <div className="mt-6 space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Function Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applications"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MultiSelect
                        onValueChange={(value) =>
                          field.onChange(value)
                        }
                        className="bg-background"
                        options={APPLICATIONS}
                        placeholder="Applications"
                        maxCount={3}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContainer>
          <CardContainer className="flex flex-col rounded-lg">
            <TypographyH3>Function Code</TypographyH3>
            <div className="mt-6 space-y-3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScriptViewer editable {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContainer>
          <CardContainer className="flex items-center justify-end gap-4">
            <ButtonLoading
              type="submit"
              loading={mutationCreateFunction.isPending}
            >
              Create
            </ButtonLoading>
          </CardContainer>
        </form>
      </Form>
    </div>
  );
}
