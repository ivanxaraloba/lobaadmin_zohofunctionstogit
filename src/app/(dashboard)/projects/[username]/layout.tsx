"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/stores/project";
import HeaderProject from "@/components/layout/header-project";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import LogoCrm from "@/assets/img/logo-crm";
import LogoCreator from "@/assets/img/logo-creator";
import Sidebar from "@/components/layout/sidebar";
import LogoRecruit from "@/assets/img/logo-recruit";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { username } = useParams<{ username: string }>();
  const { project, getProject } = useProjectStore();

  useQuery<any>({
    queryKey: ["project", username],
    queryFn: async () => {
      return getProject(username);
    },
  });

  const routes = [
    {
      icon: LayoutDashboard,
      to: `/projects/${username}`,
    },
    {
      icon: LogoCrm,
      to: `/projects/${username}/crm`,
      disabled: !project?.crm,
      className: cn(!project?.crm && "opacity-40"),
    },
    {
      icon: LogoCreator,
      to: `/projects/${username}/creator`,
      disabled: !project?.creator,
      className: cn(!project?.creator && "opacity-40"),
    },
    {
      icon: LogoRecruit,
      to: `/projects/${username}/recruit`,
      disabled: !project?.recruit,
      className: cn(!project?.recruit && "opacity-40"),
    },
  ].sort((a, b) => (a.disabled ? 1 : 0) - (b.disabled ? 1 : 0));

  return (
    <div className="">
      <Sidebar routes={routes} onlyIcons />
      <div className="ml-[68px]">
        <div className="flex flex-col">
          <HeaderProject />
          <div className="relative">
            <div className="p-10">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
