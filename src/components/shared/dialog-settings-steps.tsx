import React from 'react';

import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BUCKETS } from '@/utils/constants';

import { FormDescription } from '../ui/form';

export default function DialogSettingsSteps() {
  return (
    <Dialog>
      <DialogTrigger className="w-fit">
        <FormDescription>
          Need help getting the cURL?{' '}
          <span className="underline underline-offset-2">
            Click here
          </span>
        </FormDescription>
      </DialogTrigger>
      <DialogContent className="!w-7/12 !max-w-full !border-none">
        <DialogTitle>Follow these steps to copy cURL</DialogTitle>
        <ol className="list-decimal space-y-1 pl-5 text-xs">
          <li>
            Open the browser’s <strong>Inspector</strong> and go to
            the <strong>Network</strong> tab.
          </li>
          <li>
            Right-click a request that fetches app data (look for one
            with cookies).
          </li>
          <li>
            Select <strong>Copy</strong> <strong>Copy as cURL</strong>{' '}
            (on Mac) or <strong>Copy as cURL (bash)</strong> (on
            Windows).
          </li>
        </ol>
        <Image
          alt="settings_steps_image"
          src={`${BUCKETS.SETTINGS}/settings_crm.png`}
          className="w-full"
          width={1000}
          height={500}
        />
      </DialogContent>
    </Dialog>
  );
}
