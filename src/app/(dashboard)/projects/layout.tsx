'use client';

import { useQuery } from '@tanstack/react-query';

import { useGlobalStore } from '@/stores/global';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getProjects, getDepartments } = useGlobalStore();

  useQuery<any>({
    queryKey: ['projects'],
    queryFn: async () => {
      return getProjects();
    },
  });

  useQuery<any>({
    queryKey: ['departments'],
    queryFn: async () => {
      return getDepartments();
    },
  });

  return <div className="">{children}</div>;
}
