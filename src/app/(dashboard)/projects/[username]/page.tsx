"use client";

import { useRouter } from "next/navigation";
import { TypographyH1 } from "@/components/typography/typography-h1";
import ButtonLoading from "@/components/ui/button-loading";
import { Parentheses, Settings, Trash } from "lucide-react";
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

export default function Page() {
  const router = useRouter();
  const { project, getProject } = useProjectStore();

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

  if (!project) return <p>Loading...</p>;

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 text-xs">
          <Settings className="size-8" strokeWidth={1.2} />
          <TypographyH1>Settings</TypographyH1>
        </div>
        {project && (
          <>
            {/* Header */}
            <div className="py-10 border-b">
              <TypographyH2>{project.name}</TypographyH2>
              {/* Information & Buttons */}
            </div>
          </>
        )}
      </div>
    </>
  );
}
