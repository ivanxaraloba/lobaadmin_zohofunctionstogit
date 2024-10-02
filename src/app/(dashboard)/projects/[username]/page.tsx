"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "next/navigation";
import { TypographyH1 } from "@/components/typography/typography-h1";
import ButtonLoading from "@/components/ui/button-loading";
import {
  Check,
  Parentheses,
  Settings,
  SquareArrowOutUpRight,
  Trash,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/project";
import { str } from "@/utils/generic";
import CardContainer from "@/components/shared/card-container";
import { TypographyH2 } from "@/components/typography/typography-h2";
import { TypographyH3 } from "@/components/typography/typography-h3";
import LoadingScreen from "@/components/shared/loading-screen";
import Description from "@/components/ui/description";
import LogoRecruit from "@/assets/img/logo-recruit";
import { ButtonNavTabs } from "@/components/vercel/button-nav-tabs";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { useGlobalStore } from "@/stores/global";
import { Project } from "@/types/types";
import {
  bitbucketGetRepository,
  bitbucketUpdateRepositoryName,
} from "@/helpers/bitbucket";
import Link from "next/link";

const TABS = [{ id: "functions", label: "Project Settings" }];

const formSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  domain: z.string().min(1),
  departmentId: z.number(),
});

export default function Page() {
  const router = useRouter();
  const { user, departments } = useGlobalStore();
  const { project, getProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  const auth = {
    username: user?.profile?.bbUsername,
    password: user?.profile?.bbPassword,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      domain: "",
      departmentId: undefined,
    },
  });

  const mutationDeleteProject = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Project data is not available");

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push("/");
      toast.success("Project deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Error");
    },
  });

  const mutationUpdateProject = useMutation({
    mutationFn: async (data: Project) => {
      if (
        data.username !== project?.username ||
        data.domain !== project?.domain
      ) {
        const repository = await bitbucketGetRepository(
          auth,
          project?._repository
        );

        if (repository) {
          const response = await bitbucketUpdateRepositoryName(
            auth,
            project?._repository,
            `lobaz2g-${data.domain}-${data.username}`
          );
          if (response.error) throw new Error("Error updating repository name");
        }
      }

      const { error } = await supabase
        .from("projects")
        .update(data)
        .eq("id", project?.id);

      if (error) throw error;

      return data.username;
    },
    onSuccess: async (username: any) => {
      const redirect = username !== project?.username;
      getProject(username);
      toast.success("Project updated successfully!");
      if (redirect) router.push(`/projects/${username}`);
    },
    onError: (err) => {
      toast.error(err.message || "Error loading file");
    },
  });

  const onSubmit = (data: any) => {
    mutationUpdateProject.mutate(data);
  };

  useEffect(() => {
    form.reset({
      ...project,
    });
  }, [project?.username]);

  return (
    <>
      {!project && <LoadingScreen />}
      {project && (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 text-xs pb-10">
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
            <div className="py-10 border-b">
              <TypographyH2>Project Settings</TypographyH2>
              <div className="flex items-center">
                <div className="flex flex-col mt-4 gap-2">
                  <Description className="flex items-center gap-2 mt-4">
                    <Link
                      target="_blank"
                      className="flex items-center gap-2"
                      href={`https://bitbucket.org/lobadev/${project._repository}/src/master/crm/functions`}
                    >
                      Open Bitbucket Repository
                      <SquareArrowOutUpRight className="size-3" />
                    </Link>
                  </Description>
                </div>
              </div>
            </div>
            {/* Data */}
            <div className="mt-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-10"
                >
                  <CardContainer className="flex flex-col rounded-lg">
                    <TypographyH3>Basic Information</TypographyH3>
                    <div className="space-y-3 mt-6">
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
                    </div>
                  </CardContainer>
                  <CardContainer className="flex flex-col rounded-lg">
                    <TypographyH3>Username / Repository</TypographyH3>
                    <FormDescription>
                      Changing the username will update the Git repository by
                      reflecting the new name.
                    </FormDescription>
                    <div className="space-y-3 mt-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            {/* <FormLabel>Username</FormLabel> */}
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContainer>
                  <CardContainer className="flex flex-col rounded-lg">
                    <TypographyH3>Domain</TypographyH3>
                    <FormDescription>
                      Changing the username will update the Git repository by
                      reflecting the new name.
                    </FormDescription>
                    <div className="space-y-3 mt-6">
                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Combobox
                                variant="outline"
                                items={["eu", "com"].map((i) => ({
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
                  </CardContainer>
                  <div className="flex items-center justify-end gap-4 mt-10">
                    <ButtonLoading
                      variant="destructive"
                      icon={Trash}
                      loading={mutationDeleteProject.isPending}
                      onClick={() => mutationDeleteProject.mutate()}
                    >
                      <span>Delete</span>
                    </ButtonLoading>
                    <ButtonLoading
                      type="submit"
                      icon={Check}
                      loading={mutationUpdateProject.isPending}
                    >
                      Update
                    </ButtonLoading>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
