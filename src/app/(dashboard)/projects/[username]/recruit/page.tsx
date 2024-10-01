"use client";

import { TypographyH1 } from "@/components/typography/typography-h1";
import ButtonLoading from "@/components/ui/button-loading";
import { crmGetFunction, crmGetFunctions } from "@/helpers/zoho/crm";
import { supabase } from "@/lib/supabase/client";
import { Project } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CodeViewer from "@/components/shared/code-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/stores/project";
import { formatInTimeZone } from "date-fns-tz";
import DialogSettingsCRM from "@/components/shared/dialog-settings-crm";
import { useSearch } from "@/hooks/useSearch";
import SearchInput from "@/components/ui/search-input";
import {
  bitbucketCommit,
  bitbucketCreateRepository,
  bitbucketGetRepository,
} from "@/helpers/bitbucket";
import Description from "@/components/ui/description";
import { arr, str, time } from "@/utils/generic";
import { TypographyH2 } from "@/components/typography/typography-h2";
import { format } from "date-fns";
import { useGlobalStore } from "@/stores/global";
import ScriptViewer from "@/components/shared/code-viewer";
import { CRMFunctions } from "@/types/applications";
import { LinkNavTabs } from "@/components/vercel/link-nav-tabs";
import Link from "next/link";
import { ButtonNavTabs } from "@/components/vercel/button-nav-tabs";
import LogoCrm from "@/assets/img/logo-crm";
import SectionMissing from "@/components/shared/section-missing";
import LogoRecruit from "@/assets/img/logo-recruit";
import DialogSettingsRecruit from "@/components/shared/dialog-settings-recruit";
import TabFunctions from "./tab_functions";
import LoadingScreen from "@/components/shared/loading-screen";

const TABS = [{ id: "functions", label: "Functions" }];

export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;
  const { project } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 text-xs pb-10">
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
                {activeTab === "functions" && (
                  <TabFunctions username={username} />
                )}
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
