"use client";

import LogoCrm from "@/assets/img/logo-crm";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

const AnimatedNavTabs = ({
  tabs,
  activeTabId,
  onTabClick,
  springy,
}: {
  tabs: Array<{ id: string; label: React.ReactNode }>;
  activeTabId: string;
  onTabClick: (id: string) => void;
  springy?: boolean;
}) => {
  const tabContainerRef = useRef<HTMLDivElement | null>(null);
  const tabIndicatorRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hoverBgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeTabRef = tabRefs.current.find(
      (ref) => ref?.dataset.id === activeTabId
    );
    if (activeTabRef && tabIndicatorRef.current) {
      tabIndicatorRef.current.style.width = `${activeTabRef.offsetWidth}px`;
      tabIndicatorRef.current.style.left = `${activeTabRef.offsetLeft}px`;
    }
  }, [activeTabId]);

  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (hoverBgRef.current) {
        hoverBgRef.current.style.width = `${target.offsetWidth}px`;
        hoverBgRef.current.style.left = `${target.offsetLeft}px`;
        hoverBgRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      if (hoverBgRef.current) {
        hoverBgRef.current.style.opacity = "0";
        hoverBgRef.current.style.width = "0px"; // Reset width on leave
      }
    };

    const tabsElements = tabRefs.current;
    tabsElements.forEach((tab) => {
      tab?.addEventListener("mouseenter", handleMouseEnter);
      tab?.addEventListener("mouseleave", handleMouseLeave); // Added mouseleave here for individual tab
    });

    return () => {
      tabsElements.forEach((tab) => {
        tab?.removeEventListener("mouseenter", handleMouseEnter);
        tab?.removeEventListener("mouseleave", handleMouseLeave); // Clean up event listeners
      });
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        <div
          ref={tabContainerRef}
          className="inline-flex h-12 w-full items-center justify-start rounded-none border-b bg-transparent text-muted-foreground"
          role="tablist"
          tabIndex={0}
        >
          {tabs.map((tab, idx) => (
            <div
              role="tab"
              aria-selected={tab.id === activeTabId ? true : false}
              tabIndex={0}
              key={tab.id}
              ref={(ref) => {
                tabRefs.current[idx] = ref;
                return undefined;
              }}
              data-id={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={cn(
                "relative cursor-pointer z-10 inline-flex h-11 items-center justify-center whitespace-nowrap rounded-none bg-transparent px-4  text-xs text-muted-foreground shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow-none",
                tab.id === activeTabId && "text-foreground"
              )}
            >
              {tab.label}
            </div>
          ))}
          <div
            ref={hoverBgRef}
            className={`absolute cursor-pointer bottom-0 z-0 h-full py-2 transition-all ${
              springy
                ? "duration-200 ease-spring-4"
                : "duration-150 ease-linear"
            }`}
            style={{ opacity: 0 }}
          >
            <div className="h-full w-full rounded-sm bg-muted bg-opacity-10 " />
          </div>
          <div
            ref={tabIndicatorRef}
            className={`absolute bottom-0 z-10 transition-all ${
              springy
                ? "duration-200 ease-spring-4"
                : "duration-150 ease-linear"
            }`}
          >
            <div className="h-[1px] bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ButtonNavTabs = ({
  tabs,
  activeTabId,
  toggle,
  springy,
}: {
  tabs: Array<{ id: string; label: React.ReactNode }>;
  activeTabId: string;
  toggle: (id: string) => void;
  springy?: boolean;
}) => {
  return (
    <AnimatedNavTabs
      tabs={tabs}
      activeTabId={activeTabId}
      onTabClick={toggle}
      springy={springy}
    />
  );
};
