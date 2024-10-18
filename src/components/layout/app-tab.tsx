import React from 'react';

import { TypographyH2 } from '../typography/typography-h2';
import Description from '../ui/description';

export function AppTabHeader({ label, description, right }: any) {
  return (
    <div className="border-b py-10">
      <TypographyH2>{label}</TypographyH2>
      <div className="flex items-center">
        <div className="mt-4 flex flex-col gap-2">{description}</div>
        <div className="ml-auto flex items-center gap-3">{right}</div>
      </div>
    </div>
  );
}

export function AppTabDescription({ icon: Icon, children }: any) {
  return (
    <Description className="flex items-center gap-2">
      <Icon className="size-3" />
      {children}
    </Description>
  );
}

export function AppTabContent({ icon: Icon, children }: any) {
  return <div className="mt-10 flex flex-col gap-4">{children}</div>;
}

export function AppTabContentHead({ icon: Icon, children }: any) {
  return <div className="flex w-full gap-4">{children}</div>;
}

export function AppTabContentBody({ icon: Icon, children }: any) {
  return <div className="grid grid-cols-3 gap-x-10 rounded-2xl">{children}</div>;
}

export function AppTabContentMissing({ icon: Icon, children }: any) {
  return <div className="mt-10">{children}</div>;
}
