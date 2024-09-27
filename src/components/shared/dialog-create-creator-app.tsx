"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useState } from "react";
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
import { LoaderCircle, Plus } from "lucide-react";
import { useProjectStore } from "@/stores/project";

const formSchema = z.object({
  name: z.string().min(3),
});

export default function DialogCreateCreatorApp() {
  const { project, getProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const mutationCreateApp = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { error } = await supabase
        .from("creatorApps")
        .insert({ creatorId: project?.creator?.id, name });
      if (error) throw error;
    },
    onSuccess: async () => {
      setIsOpen(false);
      toast.success("App created successfully!");
      // @ts-ignore
      getProject(project?.username);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || "Error creating app");
    },
  });

  const onSubmit = (data: any) => {
    mutationCreateApp.mutate(data);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create App</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-4 flex-col items-center justify-center"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="App Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full"
                type="submit"
                disabled={mutationCreateApp.isPending}
              >
                {mutationCreateApp.isPending && (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                )}
                Create
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
