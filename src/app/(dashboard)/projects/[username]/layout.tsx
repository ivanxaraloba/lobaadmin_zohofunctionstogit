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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { username } = useParams<{ username: string }>();

  const { getProject } = useProjectStore();

  useQuery<any>({
    queryKey: ["project", username],
    queryFn: async () => {
      return getProject(username);
    },
  });

  const routes = [
    {
      name: "CRM",
      icon: LayoutDashboard,
      to: `/projects/${username}`,
    },
    {
      name: "CRM",
      icon: LogoCrm,
      to: `/projects/${username}/crm`,
    },
    {
      name: "Creator",
      icon: LogoCreator,
      to: `/projects/${username}/creator`,
    },
    {
      name: "Recruit",
      icon: LogoRecruit,
      to: `/projects/${username}/recruit`,
    },
  ];

  return (
    <div className="">
      <Sidebar routes={routes} onlyIcons />
      <div className="ml-[68px]">
        <div className="flex flex-col">
          <HeaderProject />
          <div className="p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
