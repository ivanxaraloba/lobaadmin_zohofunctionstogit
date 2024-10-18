'use client';

import React, { useEffect, useState } from 'react';

import { creatorGetAppStructure, creatorGetFunction } from '@/helpers/zoho/creator';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { creatorApp, Project } from '@/types/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Angry, ArrowUpFromLine, Book, FolderCode, RefreshCcw, Trash, TriangleAlert, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { PushToGitButton } from '@/components/shared/button-push-to-git';
import ScriptViewer from '@/components/shared/code-viewer';
import DialogConfirmation from '@/components/shared/dialog-confirmation';
import DialogCreateCreatorApp from '@/components/shared/dialog-create-creator-app';
import DialogSettingsCreator from '@/components/shared/dialog-settings-creator';
import LoadingScreen from '@/components/shared/loading-screen';
import SectionMissing from '@/components/shared/section-missing';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { TypographyH2 } from '@/components/typography/typography-h2';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import Description from '@/components/ui/description';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ButtonNavTabs } from '@/components/vercel/button-nav-tabs';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';
import { str, time } from '@/utils/generic';
import LogoCreator from '@/assets/img/logo-creator';

import TabWorkflows from './tab_workflows';

const TABS = [
  { id: 'workflows', label: 'Workflows' },
  { id: 'functions', label: 'Functions' },
];

export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;
  const { user, getUser } = useGlobalStore();
  const { project, getProject } = useProjectStore();
  const [app, setApp] = useState<creatorApp | null>(null);
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  const mutationDeleteApp = useMutation({
    mutationFn: async (appId: any) => {
      if (!project) throw new Error('Project data is not available');

      const { error } = await supabase.from('creatorApps').delete().eq('id', appId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await getProject(username);
      setApp(null);
      toast.success('App deleted successfully!');
    },
    onError: (err) => {
      toast.error(typeof err === 'string' ? err : err?.message);
    },
  });

  useEffect(() => {
    if (project?.creator?.creatorApps?.length) setApp(project.creator.creatorApps[0]);
  }, [project?.id]);

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 pb-10 text-xs">
          <LogoCreator size={30} />
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
                        variant={app?.id === item.id ? 'default' : 'outline'}
                        onClick={() => setApp(item)}
                        size="sm"
                        className="group relative rounded-full px-6"
                      >
                        <span>{item.name}</span>
                        <DialogConfirmation
                          action={() => mutationDeleteApp.mutate(app?.id)}
                          button={
                            <div className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-destructive transition-all group-hover:flex">
                              <X className="size-3 text-white" />
                            </div>
                          }
                        />
                      </Button>
                    ))}
                </div>
                {app?.id && (
                  <div className="mt-10">
                    <ButtonNavTabs tabs={TABS} activeTabId={activeTab} toggle={setActiveTab} springy />
                    {activeTab === 'workflows' && <TabWorkflows username={username} app={app} setApp={setApp} />}
                    {activeTab === 'functions' && (
                      <SectionMissing icon={Angry} message="Espera um pouco ainda estou a fazer" className="mt-10" />
                    )}
                  </div>
                )}
              </>
            ) : (
              <SectionMissing icon={TriangleAlert} message="Set up settings to continue" />
            )}
          </>
        )}
      </div>
    </>
  );
}
