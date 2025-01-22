import React from 'react';

import { crmTestFunction } from '@/helpers/zoho/crm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AppTabContent,
  AppTabContentHead,
  AppTabDescription,
  AppTabHeader,
} from '@/components/layout/app-tab';
import CardContainer from '@/components/shared/card-container';
import ScriptViewer from '@/components/shared/script-viewer';
import ButtonLoading from '@/components/ui/button-loading';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useProjectStore } from '@/stores/project';

const formSchema = z.object({
  execTimes: z.coerce.number().min(1).max(10),
  code: z.string().min(3),
});

export default function TabBulkExecution() {
  const { project } = useProjectStore();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    defaultValues: {
      execTimes: 1,
      code: `// paste here the function code
      

      `,
    },
  });

  const mutationExecution = useMutation({
    mutationFn: async ({
      code,
      execTimes,
    }: z.infer<typeof formSchema>) => {
      if (!project) throw new Error('Project data is unavailable.');
      const { data, error } = await crmTestFunction(
        project.domain,
        project.crm?.config,
        execTimes,
        code,
      );

      console.log(data);

      if (error) throw error;
    },
    onSuccess: () => toast.success('Function executed successfully!'),
    onError: (err) =>
      toast.error(err.message || 'Error executing the function'),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) =>
    mutationExecution.mutate(data);

  return (
    <>
      <AppTabHeader label="Bulk Execution" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AppTabContent>
            <FormField
              control={form.control}
              name="execTimes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AppTabContentHead>
                      <Input
                        placeholder="Times to run"
                        type="number"
                        {...field}
                      />
                      <ButtonLoading
                        type="submit"
                        loading={mutationExecution.isPending}
                      >
                        Run
                      </ButtonLoading>
                    </AppTabContentHead>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardContainer>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScriptViewer
                        {...field}
                        editable={!mutationExecution.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContainer>
          </AppTabContent>
        </form>
      </Form>
    </>
  );
}
