'use client';

import React, { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Braces, PanelsTopLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import Sidebar from '@/components/layout/sidebar';
import FormSetupBitbucket from '@/components/shared/form-setup-bitbucket';
import LoadingScreen from '@/components/shared/loading-screen';
import Description from '@/components/ui/description';
import { useGlobalStore } from '@/stores/global';

import PageLogin from '../login/page';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const routes = [
    {
      name: 'Projects',
      icon: PanelsTopLeft,
      to: '/projects',
    },
    // {
    //   name: 'Tokens',
    //   icon: Braces,
    //   to: '/tokens',
    // },
  ];

  const { user, getUser } = useGlobalStore();
  const queryUser = useQuery<any>({
    queryKey: ['user'],
    queryFn: async () => {
      if (!user) await getUser();
    },
  });

  if (queryUser.isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <PageLogin />;
  }

  if (!user?.profile) {
    return <FormSetupBitbucket />;
  }

  if (pathname.includes('/projects/')) {
    return <>{children}</>;
  }

  return (
    <>
      <div>
        <Sidebar routes={routes} />
        <div className="ml-52">
          <div className="px-10 py-8">{children}</div>
        </div>
      </div>
    </>
  );
}
