'use client';

import { useEffect, useState } from 'react';

import { getRepository, updateRepository } from '@/helpers/bitbucket';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Check, Parentheses, Settings, SquareArrowOutUpRight, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ButtonNavTabs } from '@/components/layout/nav-tabs';
import CardContainer from '@/components/shared/card-container';
import DialogConfirmation from '@/components/shared/dialog-confirmation';
import LoadingScreen from '@/components/shared/loading-screen';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { TypographyH2 } from '@/components/typography/typography-h2';
import { TypographyH3 } from '@/components/typography/typography-h3';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import { Combobox } from '@/components/ui/combobox';
import Description from '@/components/ui/description';
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
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';
import { str } from '@/utils/generic';
import LogoRecruit from '@/assets/img/logo-recruit';

const TABS = [{ id: 'functions', label: 'Project Settings' }];

const formSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  domain: z.string().min(1),
  departmentId: z.number(),
});

export default function Page() {
  const router = useRouter();
  const { departments } = useGlobalStore();
  const { project, getProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

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

  const mutationDeleteProject = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('Project data is not available');

      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push('/');
      toast.success('Project deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Error');
    },
  });

  const mutationUpdateProject = useMutation({
    mutationFn: async (data: Project) => {
      if (!project) throw new Error('Project data is not available');

      if (data.username !== project?.username || data.domain !== project?.domain) {
        const { data: repository } = await getRepository(project?._repositoryName);

        if (repository) {
          const { error } = await updateRepository(
            project?._repositoryName,
            `lobaz2g-${data.domain}-${data.username}`,
          );
          if (error) throw new Error(error.message);
        }
      }

      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', project?.id);

      if (error) throw error;

      return data.username;
    },
    onSuccess: async (username: any) => {
      const redirect = username !== project?.username;
      getProject(username);
      toast.success('Project updated successfully!');
      if (redirect) router.push(`/projects/${username}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Error loading file');
    },
  });

  const onSubmit = (data: any) => {
    mutationUpdateProject.mutate(data);
  };

  useEffect(() => {
    form.reset({
      ...project,
    });
  }, [project?.id, project?.username]);

  return (
    <>
      {!project && <LoadingScreen />}
      {project && (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 pb-10 text-xs">
            <TypographyH1>{project.name}</TypographyH1>
          </div>
          <div className="flex flex-col">
            <ButtonNavTabs
              tabs={TABS}
              activeTabId={activeTab}
              toggle={setActiveTab}
              springy
            />
            {/* Header */}
            <div className="border-b py-10">
              <TypographyH2>Project Settings</TypographyH2>
              <div className="flex items-center">
                {project?._repository && (
                  <Description className="mt-4 flex items-center gap-2">
                    <Link
                      target="_blank"
                      className="flex items-center gap-2"
                      href={`https://bitbucket.org/lobadev/${project._repositoryName}/src/master/crm/functions`}
                    >
                      Open Bitbucket Repository
                      <SquareArrowOutUpRight className="size-3" />
                    </Link>
                  </Description>
                )}
              </div>
            </div>
            {/* Data */}
            <div className="mt-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  {/* basic information */}
                  <CardContainer className="flex flex-col rounded-lg">
                    <TypographyH3>Basic Information</TypographyH3>
                    <div className="mt-6 space-y-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            {/* <FormLabel>Project Name *</FormLabel> */}
                            <FormControl>
                              <Input placeholder="Project Name" {...field} />
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
                            {/* <FormLabel>Department</FormLabel> */}
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
                    </div>
                  </CardContainer>
                  {/* username */}
                  <CardContainer className="flex flex-col rounded-lg">
                    <TypographyH3>Username / Domain</TypographyH3>
                    <FormDescription>
                      Modifying this data will apply the name change to the Git repository
                    </FormDescription>
                    <div className="mt-6 space-y-3">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            {/* <FormLabel>Username</FormLabel> */}
                            <FormControl>
                              <Input
                                placeholder="Username"
                                {...field}
                                onChange={(e: any) =>
                                  field.onChange(str.slugify(e.target.value))
                                }
                              />
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
                    </div>

                    <Description className="mt-2">
                      lobaz2g-
                      <span className="text-primary">{form.watch('domain')}</span>-
                      <span className="text-primary">{form.watch('username')}</span>
                    </Description>
                  </CardContainer>
                  <CardContainer className="flex items-center justify-end gap-4"> 
                    <DialogConfirmation
                      button={
                        <Button variant="destructive" type="button">
                          <span>Delete</span>
                        </Button>
                      }
                      action={() => mutationDeleteProject.mutate()}
                    />

                    <ButtonLoading
                      type="submit"
                      loading={mutationUpdateProject.isPending}
                    >
                      Update
                    </ButtonLoading>
                  </CardContainer>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
