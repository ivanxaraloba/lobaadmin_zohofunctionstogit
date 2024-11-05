import React from 'react';

import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme';
import { LogOut, Search, SunMoon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { signOut } from '@/utils/authentication';
import LogoLoba from '@/assets/img/logo-loba';

import { Button } from '../ui/button';

interface Route {
  name?: string;
  to: string;
  icon: any;
  separate?: boolean;
  className?: string;
}

export default function Sidebar({
  routes,
  onlyIcons = false,
}: {
  routes: Route[];
  onlyIcons?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="fixed h-screen border-r">
      <div className={cn('h-full px-2 py-8', onlyIcons ? 'w-[68px]' : 'w-52')}>
        <div className="flex h-full w-full flex-col">
          {/* Logo section */}
          <Link href="/projects">
            <Button variant="ghost" className="h-12 w-full items-center justify-start">
              <LogoLoba />
            </Button>
          </Link>

          {/* Routes */}
          <div className="mt-5 flex flex-col gap-1">
            {routes.map((item: any, index: number) => (
              <React.Fragment key={item.to}>
                <Link href={item.to}>
                  <Button
                    variant={pathname === item.to ? 'secondary' : 'ghost'}
                    className={cn(
                      'h-12 w-full items-center justify-start',
                      item.className,
                    )}
                  >
                    <item.icon
                      className={cn('size-5', item.classNameIcon)}
                      strokeWidth={1.5}
                    />
                    {!onlyIcons && <span className="font-medium">{item.name}</span>}
                  </Button>
                </Link>
                {/* Add border except after the last item */}
                {!!item.separate && <hr className="mx-1" />}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-auto flex flex-col">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              className="h-12 w-full items-center justify-start"
            >
              <SunMoon className="size-5" strokeWidth={1.5} />
              {!onlyIcons && <span className="font-medium">Theme</span>}
            </Button>
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="h-12 w-full items-center justify-start"
            >
              <LogOut className="size-5" strokeWidth={1.5} />
              {!onlyIcons && <span className="font-medium">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
