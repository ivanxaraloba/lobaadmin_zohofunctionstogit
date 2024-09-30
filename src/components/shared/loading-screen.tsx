import React from "react";
import { TypographyH1 } from "../typography/typography-h1";
import { TypographyH3 } from "../typography/typography-h3";
import { LoaderCircle } from "lucide-react";

export default function LoadingScreen() {
  return (
    <>
      <div>
        <div className="absolute top-0 left-0 w-full justify-center items-center bg-background/50">
          <div className="flex flex-col gap-2 w-full h-screen justify-center items-center">
            {/* <TypographyH3 className="text-muted-foreground">Z2G</TypographyH3> */}
            {/* <div className="flex space-x-2">
              <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.20s]"></div>
              <div className="size-2 bg-muted-foreground rounded-full animate-bounce"></div>
            </div> */}
            <div className="relative grid place-items-center">
              <TypographyH3 className="text-muted-foreground absolute animate-pulse">
                Z2G
              </TypographyH3>
              <LoaderCircle
                strokeWidth={0.5}
                className="size-24 animate-spin text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
