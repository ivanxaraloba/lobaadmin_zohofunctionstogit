'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { PanelsTopLeft, Parentheses } from 'lucide-react';
import { usePathname } from 'next/navigation';

import Sidebar from '@/components/layout/sidebar';
import FormSetupBitbucket from '@/components/shared/form-setup-bitbucket';
import LoadingScreen from '@/components/shared/loading-screen';
import { useGlobalStore } from '@/stores/global';

import PageLogin from '../login/page';

const routes = [
  { name: 'Projects', icon: PanelsTopLeft, to: '/projects' },
  { name: 'Functions', icon: Parentheses, to: '/functions' },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, getUser, getFunctions, getProjects, getDepartments } =
    useGlobalStore();

  const queryUser = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
  useQuery({ queryKey: ['functions'], queryFn: getFunctions });
  useQuery({ queryKey: ['projects'], queryFn: getProjects });
  useQuery({ queryKey: ['departments'], queryFn: getDepartments });

  if (queryUser.isLoading) return <LoadingScreen />;
  if (!user) return <PageLogin />;
  if (!user.profile) return <FormSetupBitbucket />;
  if (pathname.includes('/projects/')) return <>{children}</>;

  return (
    <div className="flex">
      <Sidebar routes={routes} />
      <div className="ml-52 w-full px-10 py-8">{children}</div>
    </div>
  );
}
