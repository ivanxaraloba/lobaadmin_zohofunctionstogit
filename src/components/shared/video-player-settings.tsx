import React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';

import Description from '../ui/description';

export default function VideoPlayerSettings({ src }: { src: string }) {
  return (
    <Dialog>
      <DialogTrigger className="w-fit">
        <Description>
          Need help? <span className="underline underline-offset-2">click here</span>
        </Description>
      </DialogTrigger>
      <DialogContent className="!w-7/12 !max-w-full !border-none bg-transparent !p-0 shadow-2xl !outline-none !ring-0 !ring-offset-0">
        <DialogHeader className="">
          <video className="w-full rounded-2xl" controls>
            <source src={src} type="video/mp4" />
          </video>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
