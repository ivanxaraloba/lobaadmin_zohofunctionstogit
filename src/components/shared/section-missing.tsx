import React from "react";
import { TypographyH2 } from "../typography/typography-h2";
import { Frown } from "lucide-react";
import { LucideProps } from "lucide-react";
import { TypographyH3 } from "../typography/typography-h3";
import { cn } from "@/lib/utils";

export default function SectionMissing({
  icon: Icon, // Capitalize the prop name when using it as a component
  message,
  className,
}: {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-52 justify-center items-center w-full gap-4 bg-primary-foreground p-6 rounded-2xl",
        className
      )}
    >
      <Icon className="size-5" />
      <TypographyH3>{message}</TypographyH3>
    </div>
  );
}
