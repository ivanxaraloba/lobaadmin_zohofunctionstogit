import React from 'react';

import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme';
import { LogOut, Search, SunMoon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { signOut } from '@/utils/authentication';
import LogoLoba from '@/assets/img/logo-loba';

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);

export function SidebarItem({ children, to = '', className, onClick }: any) {
  const Comp = onClick ? Button : Link;

  return (
    <Comp
      href={to}
      className={cn(
        'flex aspect-square h-12 items-center justify-start gap-2 rounded-md px-4 text-sm hover:bg-secondary',
        className,
      )}
      // @ts-ignore
      onClick={onClick}
    >
      {children}
    </Comp>
  );
}

interface Route {
  name?: string;
  to: string;
  icon: any;
  className?: string;
}

export default function Sidebar({
  routes,
  onlyIcons = false,
}: {
  routes: Route[];
  onlyIcons?: boolean;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="fixed h-screen border-r">
      <div className={cn('h-full px-2 py-8', onlyIcons ? 'w-[68px]' : 'w-52')}>
        <div className="flex h-full w-full flex-col">
          <SidebarItem className="hover:bg-transparent" to="/projects">
            <LogoLoba />
          </SidebarItem>
          <div className="mt-5 flex flex-col gap-1">
            {routes.map((item: any, index: number) => (
              <SidebarItem
                key={item.to}
                className={cn(pathname === item.to && 'bg-secondary', item.className)}
                to={item.to}
              >
                <item.icon
                  className={cn('size-5', item.classNameIcon)}
                  strokeWidth={1.5}
                />
                {!onlyIcons && <span className="font-medium">{item.name}</span>}
              </SidebarItem>
            ))}
          </div>
          <div className="mt-auto flex flex-col">
            <SidebarItem onClick={toggleTheme}>
              <SunMoon className="size-5" strokeWidth={1.5} />
              {!onlyIcons && <span className="font-medium">Theme</span>}
            </SidebarItem>
            <SidebarItem onClick={() => signOut()}>
              <LogOut className="size-5" strokeWidth={1.5} />
              {!onlyIcons && <span className="font-medium">Logout</span>}
            </SidebarItem>
          </div>
        </div>
      </div>
    </div>
  );
}
