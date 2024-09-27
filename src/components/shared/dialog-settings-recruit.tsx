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
import { Button } from "../ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { files, obj } from "@/utils/generic";
import { supabase } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Settings } from "lucide-react";
import { crmGetOrgDetails } from "@/helpers/zoho/crm";
import { useGlobalStore } from "@/stores/global";
import { useProjectStore } from "@/stores/project";
import ButtonLoading from "../ui/button-loading";
import { Project } from "@/types/types";
import VideoPlayerSettings from "./video-player-settings";
import { BUCKETS } from "@/utils/constants";

const formSchema = z.object({
  file: z.instanceof(File),
});

export default function DialogSettingsRecruit() {
  const { project, getProject } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const mutationUpdateSettings = useMutation({
    mutationFn: async ({ file }: { file: any }) => {
      console.log("dasdsadas");
      
      const content = await files.read(file);
      const json = JSON.parse(content);

      let config = {
        cookie: obj.findToken(json, "cookie", "CSRF_TOKEN"),
        "x-recruit-org": obj.findToken(json, "x-recruit-org"),
        "x-zcsrf-token": obj.findToken(json, "x-zcsrf-token"),
        "user-agent": obj.findToken(json, "user-agent"),
      };

      const { error } = await supabase
        .from("recruit")
        .upsert({ id: project?.recruit?.id, projectId: project?.id, config });
      if (error) throw error;
    },
    onSuccess: async () => {
      // @ts-ignore
      getProject(project?.username);
      toast.success("Settings updated successfully!");
      setIsOpen(false);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || "Error loading file");
    },
  });

  const onSubmit = (data: any) => {
    mutationUpdateSettings.mutate(data);
  };

  useEffect(() => {
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
              className="flex gap-4 flex-col items-center justify-center"
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
