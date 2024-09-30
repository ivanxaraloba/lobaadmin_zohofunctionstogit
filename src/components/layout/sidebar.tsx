import LogoLoba from "@/assets/img/logo-loba";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme";
import { LogOut, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);

export function SidebarItem({ children, to = "", className, onClick }: any) {
  const Comp = onClick ? Button : Link;

  return (
    <Comp
      href={to}
      className={cn(
        "h-12 aspect-square items-center flex gap-2 justify-start px-4 text-sm hover:bg-secondary rounded-md",
        className
      )}
      // @ts-ignore
      onClick={onClick}
    >
      {children}
    </Comp>
  );
}

export default function Sidebar({
  routes,
  onlyIcons = false,
}: {
  routes: any[];
  onlyIcons?: boolean;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="border-r fixed h-screen">
      <div className={cn("px-2 py-8 h-full", onlyIcons ? "w-[68px]" : "w-52")}>
        <div className="flex flex-col w-full h-full">
          <SidebarItem className="hover:bg-transparent" to="/projects">
            <LogoLoba />
          </SidebarItem>
          <div className="flex flex-col mt-5 gap-1">
            {routes.map((item: any, index: number) => (
              <SidebarItem
                key={item.to}
                className={cn(pathname === item.to && "bg-secondary")}
                to={item.to}
              >
                <item.icon className="size-5" strokeWidth={1.5} />
                {!onlyIcons && <span className="font-medium">{item.name}</span>}
              </SidebarItem>
            ))}
          </div>
          <div className="flex flex-col mt-auto">
            <SidebarItem onClick={toggleTheme}>
              <SunMoon className="size-5" strokeWidth={1.5} />
              {!onlyIcons && <span className="font-medium">Theme</span>}
            </SidebarItem>
            <SidebarItem
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
            >
              <LogOut className="size-5" strokeWidth={1.5} />
              {!onlyIcons && <span className="font-medium">Logout</span>}
            </SidebarItem>
          </div>
        </div>
      </div>
    </div>
  );
}
