"use client";

import { TypographyH1 } from "@/components/typography/typography-h1";
import ButtonLoading from "@/components/ui/button-loading";
import {
  creatorGetAppStructure,
  creatorGetFunction,
} from "@/helpers/zoho/creator";
import { supabase } from "@/lib/supabase/client";
import { Project, creatorApp } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Angry,
  ArrowUpFromLine,
  Book,
  FolderCode,
  RefreshCcw,
  Trash,
  TriangleAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DialogCreateCreatorApp from "@/components/shared/dialog-create-creator-app";
import { TypographyH2 } from "@/components/typography/typography-h2";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/project";
import DialogSettingsCreator from "@/components/shared/dialog-settings-creator";
import ScriptViewer from "@/components/shared/code-viewer";
import { formatInTimeZone } from "date-fns-tz";
import { Input } from "@/components/ui/input";
import { str, time } from "@/utils/generic";
import { cn } from "@/lib/utils";
import Description from "@/components/ui/description";
import {
  bitbucketCommit,
  bitbucketCreateRepository,
  bitbucketGetRepository,
} from "@/helpers/bitbucket";
import { format } from "date-fns";
import { useGlobalStore } from "@/stores/global";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PushToGitButton } from "@/components/shared/button-push-to-git";
import LogoCreator from "@/assets/img/logo-creator";
import { ButtonNavTabs } from "@/components/vercel/button-nav-tabs";
import TabWorkflows from "./tab_workflows";
import DialogConfirmation from "@/components/shared/dialog-confirmation";
import SectionMissing from "@/components/shared/section-missing";
import LoadingScreen from "@/components/shared/loading-screen";

const TABS = [
  { id: "workflows", label: "Workflows" },
  { id: "functions", label: "Functions" },
];

export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;
  const { user, getUser } = useGlobalStore();
  const { project, getProject } = useProjectStore();
  const [app, setApp] = useState<creatorApp | null>(null);
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  const mutationDeleteApp = useMutation({
    mutationFn: async (appId: any) => {
      if (!project) throw new Error("Project data is not available");

      const { error } = await supabase
        .from("creatorApps")
        .delete()
        .eq("id", appId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await getProject(username);
      setApp(null);
      toast.success("App deleted successfully!");
    },
    onError: (err) => {
      toast.error(typeof err === "string" ? err : err?.message);
    },
  });

  useEffect(() => {
    if (project?.creator?.creatorApps?.length)
      setApp(project.creator.creatorApps[0]);
  }, [project?.id]);

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="px-4 flex items-center gap-4 text-xs pb-10">
          <LogoCreator size={26} />
          <TypographyH1>Zoho Creator</TypographyH1>
          <DialogSettingsCreator />
        </div>
        {project && (
          <>
            {project?.creator ? (
              <>
                <div className="flex items-center gap-2">
                  <DialogCreateCreatorApp />
                  {project?.creator?.creatorApps &&
                    project?.creator?.creatorApps.map((item, index) => (
                      <Button
                        key={index}
                        variant={app?.id === item.id ? "default" : "outline"}
                        onClick={() => setApp(item)}
                        size="sm"
                        className="rounded-full px-6 relative group"
                      >
                        <span>{item.name}</span>
                        <DialogConfirmation
                          action={() => mutationDeleteApp.mutate(app?.id)}
                          button={
                            <div className="hidden -right-1.5 -top-1.5 bg-destructive absolute transition-all group-hover:flex size-5 items-center justify-center rounded-full">
                              <X className="size-3 text-white" />
                            </div>
                          }
                        />
                      </Button>
                    ))}
                </div>
                {app?.id && (
                  <div className="mt-10">
                    <ButtonNavTabs
                      tabs={TABS}
                      activeTabId={activeTab}
                      toggle={setActiveTab}
                      springy
                    />
                    {activeTab === "workflows" && (
                      <TabWorkflows
                        username={username}
                        app={app}
                        setApp={setApp}
                      />
                    )}
                    {activeTab === "functions" && (
                      <SectionMissing
                        icon={Angry}
                        message="Espera um pouco ainda estou a fazer"
                        className="mt-10"
                      />
                    )}
                  </div>
                )}
              </>
            ) : (
              <SectionMissing
                icon={TriangleAlert}
                message="Set up settings to continue"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
