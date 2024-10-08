import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function CardProject({ project }: { project: any }) {
  const apps = [
    {
      condition: !!project.crm,
      href: `/projects/${project.username}/crm`,
      label: "crm",
      className: "bg-blue-400",
    },
    {
      condition: !!project.creator?.creatorApps?.length,
      href: `/projects/${project.username}/creator`,
      label: "creator",
      className: "bg-emerald-400",
    },
    {
      condition: !!project.recruit,
      href: `/projects/${project.username}/recruit`,
      label: "recruit",
      className: "bg-rose-400",
    },
  ];

  return (
    <Link
      href={`/projects/${project.username}`}
      className={cn(
        "group max-h-28 relative text-left bg-surface-10 hover:bg-primary-foreground border border-surface rounded-md flex flex-row transition ease-in-out duration-150 cursor-pointer !px-0 group p-5"
      )}
    >
      <div className={cn("w-full flex justify-between gap-y-2 px-5 flex-col")}>
        <div className="flex flex-col gap-0.5">
          <p className="flex-shrink truncate text-sm pr-4">{project.name}</p>
          <span className="text-sm text-muted-foreground">
            zoho.{project.domain}
          </span>
        </div>
        <div className="flex items-center gap-x-1.5">
          {apps.map(
            ({ condition, href, label, className }, index) =>
              condition && (
                <Link
                  key={index}
                  href={href}
                  className={cn(
                    "items-center gap-2 border px-2.5 py-0.5 rounded-full text-center flex justify-center uppercase"
                  )}
                >
                  <div className={cn("size-1 rounded-full", className)}></div>
                  <span className="text-xs">{label}</span>
                </Link>
              )
          )}
        </div>
      </div>
      <div className="absolute right-4 top-4 text-foreground-lighter transition-all duration-200 group-hover:right-2 group-hover:text-foreground">
        <ChevronRight strokeWidth={1} />
      </div>
    </Link>
  );
}
