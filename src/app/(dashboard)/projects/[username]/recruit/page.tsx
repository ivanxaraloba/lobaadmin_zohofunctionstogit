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

import CodeViewer from '@/components/shared/code-viewer';
import ScriptViewer from '@/components/shared/code-viewer';
import DialogSettingsCRM from '@/components/shared/dialog-settings-crm';
import DialogSettingsRecruit from '@/components/shared/dialog-settings-recruit';
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
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import SearchInput from '@/components/ui/search-input';
import { ButtonNavTabs } from '@/components/vercel/button-nav-tabs';
import { LinkNavTabs } from '@/components/vercel/link-nav-tabs';
import { useGlobalStore } from '@/stores/global';
import { useProjectStore } from '@/stores/project';
import { useSearch } from '@/hooks/useSearch';
import { arr, str, time } from '@/utils/generic';
import LogoCrm from '@/assets/img/logo-crm';
import LogoRecruit from '@/assets/img/logo-recruit';

import TabFunctions from './tab_functions';

const TABS = [{ id: 'functions', label: 'Functions' }];

export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;
  const { project } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 pb-10 text-xs">
          <LogoRecruit size={30} />
          <TypographyH1>Zoho Recruit</TypographyH1>
          <DialogSettingsRecruit />
        </div>
        {project && (
          <>
            {project?.recruit ? (
              <div className="flex flex-col">
                <ButtonNavTabs
                  tabs={TABS}
                  activeTabId={activeTab}
                  toggle={setActiveTab}
                  springy
                />
                {activeTab === 'functions' && <TabFunctions username={username} />}
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
