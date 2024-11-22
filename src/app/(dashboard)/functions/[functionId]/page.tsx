'use client';

import React, { useEffect } from 'react';

import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import CardContainer from '@/components/shared/card-container';
import LoadingScreen from '@/components/shared/loading-screen';
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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Textarea } from '@/components/ui/textarea';
import { useGlobalStore } from '@/stores/global';
import {
  APPLICATIONS,
  CONFIG_FUNCTION_VARIABLE,
} from '@/utils/constants';

const formSchema = z.object({
  name: z.string().min(3),
  applications: z.array(z.string()).min(1),
  code: z.string().min(3),
});

export default function EditFunctionPage() {
  const router = useRouter();
  const { functionId } = useParams();
  const { getFunctions } = useGlobalStore();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      applications: [],
      code: '',
    },
  });

  const queryFunction = useQuery<any>({
    queryKey: ['function', functionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('functions')
        .select('*')
        .eq('id', functionId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const mutationUpdateFunction = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('functions')
        .update(data)
        .eq('id', functionId);
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await getFunctions();
      toast.success('Function updated successfully!');
      router.push('/functions');
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || 'Error updating function');
    },
  });

  const onSubmit = (data: any) => {
    mutationUpdateFunction.mutate(data);

    const matches = data.code.match(CONFIG_FUNCTION_VARIABLE.REGEX);
    if (!matches) return [];

    console.log(matches);
  };

  const mutationDeleteFunction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('functions')
        .delete()
        .eq('id', functionId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await getFunctions();
      router.push('/functions');
      toast.success('Function deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Error');
    },
  });

  useEffect(() => {
    form.reset({ ...queryFunction.data });
  }, [queryFunction.isSuccess]);

  return (
    <>
      {queryFunction.isPending && <LoadingScreen />}
      <div>
        <div className="flex items-center gap-4 pb-10 text-xs">
          <TypographyH1>Edit Function</TypographyH1>
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
                        <Input
                          placeholder="Function Name"
                          {...field}
                        />
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
                          defaultValue={field.value}
                          onValueChange={(value) =>
                            field.onChange(value)
                          }
                          className="bg-background"
                          options={APPLICATIONS}
                          placeholder="Applications"
                          maxCount={3}
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
                variant="destructive"
                type="button"
                loading={mutationDeleteFunction.isPending}
                onClick={() => mutationDeleteFunction.mutate()}
              >
                Delete
              </ButtonLoading>
              <ButtonLoading
                type="submit"
                loading={mutationUpdateFunction.isPending}
              >
                Update
              </ButtonLoading>
            </CardContainer>
          </form>
        </Form>
      </div>
    </>
  );
}
