"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function TypographyH1({ children, className }: any) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tighter lg:text2xl",
        className
      )}
    >
      {children}
    </h1>
  );
}
