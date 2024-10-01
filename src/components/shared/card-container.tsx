import { cn } from "@/lib/utils";
import React from "react";

export default function CardContainer({
  children,
  className,
}: {
  children: any;
  className?: any;
}) {
  return (
    <div className={cn("bg-primary-foreground p-6 rounded-2xl border", className)}>
      {children}
    </div>
  );
}
