'use client';

import React, { useEffect } from 'react';

import { PanelsTopLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import Sidebar from '@/components/layout/sidebar';
import FormSetupBitbucket from '@/components/shared/form-setup-bitbucket';
import { useGlobalStore } from '@/stores/global';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const routes = [
    {
      name: 'Projects',
      icon: PanelsTopLeft,
      to: '/projects',
    },
  ];

  const { user, getUser } = useGlobalStore();

  useEffect(() => {
    const fetch = async () => {
      if (!user) await getUser();
    };
    fetch();
  }, []);

  if (!user) {
    return null;
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
