"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { files, obj } from "@/utils/generic";
import { supabase } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Settings } from "lucide-react";
import { crmGetOrgDetails } from "@/helpers/zoho/crm";
import { useGlobalStore } from "@/stores/global";
import { useProjectStore } from "@/stores/project";
import { Project } from "@/types/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { BUCKETS } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/ui/button-loading";
import { TypographyH2 } from "@/components/typography/typography-h2";

const formSchema = z.object({
  file: z.instanceof(File),
});

export default function SettingsCRM() {
  const { project, getProject } = useProjectStore();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const mutationCreateProject = useMutation({
    mutationFn: async ({ file }: { file: any }) => {
      const content = await files.read(file);
      const json = JSON.parse(content);

      let config = {
        cookie: obj.findToken(json, "cookie"),
        "x-crm-org": obj.findToken(json, "x-crm-org"),
        "x-zcsrf-token": obj.findToken(json, "x-zcsrf-token"),
        "user-agent": obj.findToken(json, "user-agent"),
      };

      // test api
      const testApi = await crmGetOrgDetails(project?.domain, config);
      if (!testApi) throw new Error("Fail testing api");

      const { error } = await supabase
        .from("crm")
        .upsert({ id: project?.crm?.id, projectId: project?.id, config });
      if (error) throw error;
    },
    onSuccess: async () => {
      // @ts-ignore
      getProject(project?.username);
      toast.success("Settings updated successfully!");
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || "Error loading file");
    },
  });

  const onSubmit = (data: any) => {
    mutationCreateProject.mutate(data);
  };

  return (
    <>
      <TypographyH2>Settings</TypographyH2>
      <div className="mt-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-4 flex-col w-fit items-center justify-center"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File .Har</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".har"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          field.onChange(e.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Retrieve the file from the homepage
                  </FormDescription>
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
      </div>
    </>
  );
}
