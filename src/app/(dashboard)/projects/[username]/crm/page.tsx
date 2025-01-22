'use client';

import React, { useState } from 'react';

import { crmGetFunction, crmGetFunctions } from '@/helpers/zoho/crm';
import { supabase } from '@/lib/supabase/client';
import { CRMFunctions } from '@/types/applications';
import { Project } from '@/types/types';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  ALargeSmall,
  Angry,
  ArrowUpFromLine,
  Book,
  Meh,
  Parentheses,
  RefreshCcw,
  TriangleAlert,
  WholeWord,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ButtonNavTabs } from '@/components/layout/nav-tabs';
import DialogSettingsCRM from '@/components/shared/dialog-settings-crm';
import LoadingScreen from '@/components/shared/loading-screen';
import CodeViewer from '@/components/shared/script-viewer';
import ScriptViewer from '@/components/shared/script-viewer';
import SectionMissing from '@/components/shared/section-missing';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { TypographyH2 } from '@/components/typography/typography-h2';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
import Description from '@/components/ui/description';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';
import { arr, str, time } from '@/utils/generic';
import LogoCrm from '@/assets/img/logo-crm';

import TabClientScripts from './tab_bulkexecution';
import TabConnections from './tab_connections';
import TabFunctions from './tab_functions';

const TABS = [
  { id: 'functions', label: 'Functions' },
  { id: 'client_scripts', label: 'Client Scripts' },
  { id: 'bulk_execution', label: 'Bulk Execution' },
  // { id: 'connections', label: 'Connections' },
];

export default function Page({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { project } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 pb-10 text-xs">
          <LogoCrm size={30} />
          <TypographyH1>Zoho CRM</TypographyH1>
          <DialogSettingsCRM />
        </div>
        {project && (
          <>
            {project?.crm ? (
              <div className="flex flex-col">
                <ButtonNavTabs
                  tabs={TABS}
                  activeTabId={activeTab}
                  toggle={setActiveTab}
                  springy
                />
                {activeTab === 'functions' && (
                  <TabFunctions username={username} />
                )}
                {activeTab === 'client_scripts' && (
                  <SectionMissing
                    icon={Angry}
                    message="Espera um pouco ainda estou a fazer"
                    className="mt-10"
                  />
                )}
                {activeTab === 'bulk_execution' && (
                  <TabClientScripts />
                )}
                {activeTab === 'connections' && <TabConnections />}
              </div>
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
