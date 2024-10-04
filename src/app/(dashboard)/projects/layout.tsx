"use client";

import DialogSearch from "@/components/shared/dialog-search";
import { useGlobalStore } from "@/stores/global";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getProjects, getDepartments } = useGlobalStore();

  useQuery<any>({
    queryKey: ["projects"],
    queryFn: async () => {
      return getProjects();
    },
  });

  useQuery<any>({
    queryKey: ["departments"],
    queryFn: async () => {
      return getDepartments();
    },
  });

  return (
    <div className="">
      <DialogSearch />
      {children}
    </div>
  );
}
