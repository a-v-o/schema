"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center p-12 text-center gap-4">
      <h2>Something went wrong!</h2>
      <p>
        Hi, dear user. Unfortunately, something went wrong. I do not know what.
        Probably a server or database issue. Sorry, but I was too lazy to handle
        specific errors. Please try the previous action again. Thanks!
      </p>
      <Button
        onClick={() => {
          reset();
        }}
      >
        Try again
      </Button>
    </div>
  );
}
